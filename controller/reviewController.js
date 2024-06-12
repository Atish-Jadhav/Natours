const Review = require('../models/reviewModel');
// const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');

exports.getAllReviews = factory.getAll(Review);
// exports.getAllReviews = catchAsync(async(req, res, next) => {
//     let filter = {};
//     if(req.params.tourID) filter = { tour : req.params.tourID }
//     const reviews = await Review.find(filter); //Filter reviews for only the received tour id

//     res.status(200).json({
//         status : 'success',
//         results : reviews.length,
//         data : {
//             reviews
//         }
//     })
// });

// Separated this logic for handleFactory.js. The below will run first before creating review as it is specified in routes file
exports.setTourUserIds = (req, res, next) => {
    // To Allow nested routes - As we won't be entering any tour and user data, the below 'if' conditions are good to get their data 
    if(!req.body.tour) req.body.tour = req.params.tourID;
    if(!req.body.user) req.body.user = req.user.id; //Getting req.user from protect middleware
    next();
}

exports.createReview = factory.createOne(Review);
// exports.createReview = catchAsync(async(req, res, next) => {
//     // To Allow nested routes - As we won't be entering any tour and user data, the below 'if' conditions are good to get their data 
//     if(!req.body.tour) req.body.tour = req.params.tourID;
//     if(!req.body.user) req.body.user = req.user.id; //Getting req.user from protect middleware

//     const newReview = await Review.create({
//         review : req.body.review,
//         rating : req.body.rating,
//         tour : req.body.tour,
//         user : req.body.user
//     });

//     res.status(201).json({
//         status : 'success',
//         data : {
//             review : newReview
//         }
//     })
// });

exports.getReviewById = factory.getOne(Review);
// exports.getReviewById = catchAsync(async (req, res, next) => {
//     const review = await Review.findById(req.params.id);

//     res.status(200).json({
//         status : 'success',
//         data : {
//             review
//         }
//     })
// });

exports.updateReview = factory.updateOne(Review);
exports.deleteReview = factory.deleteOne(Review); //This will return a function which will be called when we hit the particular route