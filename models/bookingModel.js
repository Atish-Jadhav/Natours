const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    // Doing parent referencing, meaning keeping the reference of user and tour in here
    tour : {
        type : mongoose.Schema.ObjectId,
        ref : 'Tour', //Pointing to the Tour Model
        required : [true, 'Booking must belong to a Tour!']
    },
    user : {
        type : mongoose.Schema.ObjectId,
        ref : 'User', //Pointing to the Tour Model
        required : [true, 'Booking must belong to a User!']
    },
    price : {
        type : Number,
        required : [true, 'Booking must have a price.']
    },
    createdAt : {
        type : Date,
        default : Date.now()
    },
    // This is in scenario, customer pays to the owner without using stripe, meaning directly
    paid : {
        type : Boolean,
        default : true
    }
});

// To populate tour and user. This is for guides and admins to check who has booked tours.
// Query Middleware
bookingSchema.pre(/^find/, function(next) {
    this.populate('user').populate({
        path : 'tour',
        select : 'name' //Only show the tour name
    });
    next();
})

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;