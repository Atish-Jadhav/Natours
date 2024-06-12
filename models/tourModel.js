const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');
const User = require('./userModel');

const tourSchema = mongoose.Schema({
    name : { 
        type : String, 
        required : [true, 'A tour must have a name'], //Second parameter in the required is the error we want to display
        unique : true, 
        trim : true, 
        maxlength : [40, 'A tour name must have less than or equal to 40 characters'],
        minlength : [10, 'A tour name must have more than or equal to 10 characters'],
        // We could have followed the same pattern for writing error for a custom validator, but it would have looked wierd as the function is big.
        // validate : [validator.isAlpha, 'Tour name must only contain characters'] //Here validator is a 3rd party module. Not using because it doesn't allow whitespace also.
    }, 
    slug : String,
    duration : { type : Number, required : [true, 'A tour must have a duration'] },
    maxGroupSize : { type : Number, required : [true, 'A tour must have a group size']},
    difficulty : { 
        type : String, 
        required : [true, 'A tour must have a difficulty level'],
        enum : {
            values : ['easy', 'medium', 'difficult'], //Case sensitive
            message : 'Difficulty must be either: easy, medium or difficult'
        }
    },
    price : { type : Number, required : [true, 'Price must be entered for the tour']},
    priceDiscount : {
        type : Number,
        validate : {
            validator : function(discount) { //Checks if priceDiscount is less than price, if yes, return true. Else false.
                return discount < this.price; //this refers to current document when creating new document. This function won't work when updating a document.
            },
            message : 'Discounter price {VALUE} cannot be greater than price'
        }
    },
    summary : { type : String, trim : true, required : [true, 'A tour must have a summary']},
    description : { type : String, trim : true },
    imageCover : { type : String, required : [true, 'A tour must have a cover image']},
    images : [String], //An array of strings
    createdAt : { type : Date, default : Date.now(), select : false }, //When select to false, it permanently hides the field from the user. It is never showed
    startDates : [Date], //An array of dates
    ratingsAverage : { 
        type : Number, 
        default : 1.5, 
        min : [1, 'Rating must be above 1.0'],
        max : [5, 'Rating must be below 5.0'],
        // A setter function and this will run each time a new value is set for this field
        set : val => Math.round(val * 10) / 10 // 4.6666 to 46.666 to 47 (round will round it up to integer) to 4.7. If not used this little hacks, you will get value 5.
    },
    ratingsQuantity : { type : Number, default : 0},
    secretTour : { type : Boolean, default : false },
    startLocation : {
        // GeoJSON for storing geospatial data. startLocation is not an document but an object.
        type : {
            type : String,
            default : 'Point',
            enum : ['Point']
        },
        coordinates : [Number], //Longitude first and latitude second
        address : String,
        description : String,
    },
    // Embedded document
    locations : [
        {
            type : {
                type : String,
                default : 'Point',
                enum : ['Point']
            },
            coordinates : [Number],
            address : String,
            description : String,
            day : Number
        }
    ],
    // guides : Array //For Embedding
    // For referencing
    guides : [
        {
            type : mongoose.Schema.ObjectId, //Of type MongoDB id
            ref : 'User' //For this we don't even need to require User model but I used it to try embedding user into tour so I'll let it be.
        }
    ]
}, {
    toJSON : { virtuals : true }, //This means every time data is being outputted as JSON, like in Postman, we want virtual fields to display
    toObject : { virtuals : true } //When data gets outputted as object
})

// tourSchema.index({ price : 1}); //1 ascending, -1 descending. This is a single field index.
//This is a compound index because it has 2 fields. 
// In a compound index, if you query for one of the parameters in it, the index is set for that field also as in compound index'es, individual parameters get set an index too.
// Though it won't be displayed in MongoDB.
tourSchema.index({ price : 1, ratingsAverage : -1 }); 
tourSchema.index({ slug : 1});
//For geospatial data, this index needs to be 2D sphere if the data describes real points on earth like sphere or fictional points on a simple two dimensional plane.
tourSchema.index({ startLocation : '2dsphere' }); 

//Counting durationWeeks here in Models and not in controllers because we need to keep as much as business logic in Models and durationWeeks is business logic.
// Virtual properties will not be saved into the database
tourSchema.virtual('durationWeeks').get(function() { //Not an arrow function because they don't have their own 'this' keyword
    return this.duration /7;
})

// Virtual Populate. If you haven't used populate on a query to populate 'reviews', the reviews property won't appear
tourSchema.virtual('reviews', {
    ref : 'Review', //Model Name
    foreignField : 'tour', //This will be the name of field in Review Model where the reference to the current model is stored
    localField : '_id' //Where that tour id is stored in the current model
})

// DOCUMENT MIDDLEWARE: runs before .save() and .create(). But not .insertMany()
tourSchema.pre('save', function(next) {
    this.slug = slugify(this.name, { lower : true }); //this.slug create a new property slug before saving document to the database
    next();
})

// Won't be implementing this as embedding user (guides) document into tour model isn't efficient. 
// Because if any details changed for that user, we'd have to update those changes in embedded document too.

// Getting the user document into tour documents by their id's
// tourSchema.pre('save', async function(next) {
//     const guidesPromises = this.guides.map(async id => await User.findById(id)); //aysnc will return promsises.

//     // Running all of the promises stored at the same time
//     this.guides = await Promise.all(guidesPromises); //Overwriting guides array which will now store user documents.
//     next();
// })

/* Both work just fine. Just don't want to pollute console log with resultss
tourSchema.pre('save', function(next) {
    console.log('Will save document ...');
    next();
})

//Runs after saving to the database
tourSchema.post('save', function(doc, next) {   //post document middleware has access not only to next but also to the doc(document) that was just saved
    console.log(doc);   //post middleware doesn't have access to 'this' keyword
    next();
}) */

// QUERY MIDDLEWARE
// tourSchema.pre('find', function(next){ 
tourSchema.pre(/^find/, function(next){ //Regular expression makes it so that the query middleware will be pre-executed for all queries with find in them. If we just typed 'find', then query middleware will only be executed for 'find' query.
    this.find({ secretTour : { $ne : true } }) //'this' points to the query object now and not the document
    this.start = Date.now();
    next();
})

tourSchema.post(/^find/, function(docs, next){ //docs point to documents returned by the query
    console.log(`Query took ${Date.now() - this.start} milliseconds`);
    // console.log(docs)
    next();
})

// Query Middleware for populating user data into guides property for referencing
tourSchema.pre(/^find/, function(next) {
    this.populate({ //this points to the current query
        path : 'guides',
        select : '-__v -passwordChangedAt' //Not showing this fields.
    });
    
    next();
})

// AGGREGATION MIDDLEWARE
tourSchema.pre('aggregate', function(next) {
    const pipeline = this.pipeline();

    // Check if the first stage is $geoNear as in geospatial aggregation pipeline, $geoNear mandatorily needs to be first stage
    // pipeline[0].$geoNear accesses the $geoNear property of the first stage. If the first stage is a $geoNear stage, this property will exist and will contain the configuration for the $geoNear operation.
    // If the first stage is not a $geoNear stage, pipeline[0].$geoNear will be undefined which will evaluate to false.
    if(pipeline.length > 0 && pipeline[0].$geoNear){
        // Add the $match stage after the $geoNear stage
        // 1 is the start index where the new element will be inserted. 0 is the count of how many elements should be deleted from the array, starting from start index.
        // { $match: { secretTour: { $ne: true } } } this is the element that will be added to the array, starting at the start index.
        pipeline.splice(1, 0, { $match : { secretTour: { $ne : true } } });
    }else {
        // Add the $match stage as the first stage
        pipeline.unshift({ $match: { secretTour: { $ne: true } } });
    }
    // Let the below line be.
    // this.pipeline().unshift({ $match : { secretTour: { $ne : true } } }) //This avoids secret tours being taken into account by aggregate pipeline
    // console.log(this.pipeline()); //this points to the current aggregation object.
    next();
})

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour