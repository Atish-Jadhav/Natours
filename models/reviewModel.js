const mongoose = require('mongoose');
const Tour = require('../models/tourModel');

const reviewSchema = new mongoose.Schema({
    review : {
        type : String,
        required : [true, 'Please tell us your thoughts.']
    },
    rating : {
        type : Number,
        min : 1,
        max : 5,
        required : [true, "Please tell us how was your experience by giving the rating."]
    },
    createdAt :{
        type : Date,
        default : Date.now()
    },
    tour :
        {
            type : mongoose.Schema.ObjectId,
            ref : 'Tour', //Model name
            required : [true, 'Review must belong to a tour.']
        },
    user :
        {
            type : mongoose.Schema.ObjectId,
            ref : 'User', //Model name
            required : [true, 'Review must belong to a user.']
        }
}, {
    toJSON : { virtuals : true },
    toObject : { virtuals : true }
});

// To prevent duplicate reviews
// This will dictate that each combination of user and tour has to be unique. This will allow same reviews from different users.
// But not more than one review on one tour from same user.
reviewSchema.index({ tour : 1, user : 1}, { unique : true }) //1 or -1 doesn't matter in this case

// Have the Middlewares after Schema and before creating Model.

// Query Middleware for populating user and tour fields for referencing

reviewSchema.pre(/^find/, function(next) {
    // this.populate({
    //     // path : 'tour user', //This works too
    //     // select : 'name user' //This works too
    //     path : 'tour',
    //     select : 'name'
    // }).populate({
    //     path : 'user',
    //     select : 'name photo'
    // });

    // Did this because when quering a tour, the 'reviews' virtual field in tour, the tour information would get populated which was unnecessary and repititve.
    this.populate({
        path : 'user',
        select : 'name photo'
    })

    next();
})

// Static Method. In Static Method, 'this' points to the current model which is why we can use 'aggregate'
// Aggregate needs to be called on model directly which is why we're using static method
reviewSchema.statics.calcAverageratings = async function(tourID) {
    const stats = await this.aggregate([
        {
            $match : {tour : tourID} 
        },
        {
            $group : {
                _id : '$tour', //grouping by tour property
                nRatings : { $sum : 1 }, //Add one for each tour that was matched.
                avgRating : { $avg : '$rating' } //rating is the field name in Model. $avg is the operator
            }
        }
    ]);
    // console.log(stats); //result stored in an array
    // Persisting the calculated average and total number of ratings to Tour. 
    // We find the tour in question by id which was passed to the function.
    if(stats.length > 0) {
        await Tour.findByIdAndUpdate(tourID, {
            ratingsQuantity : stats[0].nRatings,
            ratingsAverage : stats[0].avgRating,
        })
    }else { //In case, there are no review documents specify the default value of average ratings and 0 for total ratings
        await Tour.findByIdAndUpdate(tourID, {
            ratingsQuantity : 0,
            ratingsAverage : 1.5,
        })
    }

}

// We are using post save because at pre save the current review is not in the collection just yet
// So, therefore when we do the match below it shouldn't be able to appear in the output, because it's not saved into the collection.
// It's best to use post because at that time all the documents are saved in the database and is a great time to do calculations with all the reviews already there and store that result on tour.
reviewSchema.post('save', function() {
    //'this' points to the current review document.
    
    // We can't call Review model here as it created after this middleware function.
    // And if we shift it above this function, the middleware won't be called as the model will already be created

    // Workaround. this points to the document and constructor is basically the model that created the document
    //calcAverageratings is available on the model as it is static method
    //this.tour :- this -points to the current review and we're gonna pass the tourID to the function as reviews contain tourID in 'tour' property
    this.constructor.calcAverageratings(this.tour); 
    // next(); Post middleware does not get access to next
});

// To calculate reviews when we update or delete reviews and those are done by findByIdAndUpdate and findByIdAndDelete
// Same method can't be used as above as for this we don't have document middleware but Query middleware
// In Query Middleware, we don't have access to current document using 'this' but current query, so we can't call call calcAverageratings using this

// Behind the scenes, findByIdAndUpdate and findByIDAndDelete are a short hand for find one and delete/update
// From this, we only need the review document. We can't call calcAverageratings function here as we're gettings values before any updation/deletion.
// We need to call calcAverageRatings function after updation/deletion has taken place. 
// So after saving data to the database. We need 'post' hook just like we needed for calculating average ratings while creating reviews
// We also can't change pre to post here, because by then quey would already have been executed and we wouldn't have access to it.
reviewSchema.pre(/^findOneAnd/, async function(next) {
    // By executing the query we get access to the document that is being processed. This is the workaround
    // this.getQuery() gets the conditions of the query, like { _id: '12345' }.
    const query = this.getQuery();
    // this.model.findOne(query) uses the query conditions to find the document that matches those conditions
    // this.model in Mongoose middleware refers to the model associated with the query.
    this.document = await this.model.findOne(query);
    // The found document 'document' is logged or processed before the original update or delete operation is executed
    // console.log(this.document); //This will not show the updated document but the document before any updation/deletion.
    next();
});

// To pass data from pre middleware to post middleware, we save the document retrieved on 'this' as query variable
reviewSchema.post(/^findOneAnd/, async function() {
    // We could not have executed findOne() query here as it would've already been executed.
    // calcAverageratings is a static method so we need a model to call it.
    await this.document.constructor.calcAverageratings(this.document.tour); //tour is the property on review that contains tour id.
});

const Review = mongoose.model('Review', reviewSchema);


module.exports = Review;