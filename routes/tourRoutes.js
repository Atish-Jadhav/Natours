const express = require('express');
const router = express.Router();
const authController = require('../controller/authController');
const tourController = require('../controller/tourController');
const reviewRouter = require('../routes/reviewRoutes');
// const reviewController = require('../controller/reviewController'); Don't need anymore but let it be for seeing nested route messy implementation

// router.param('id', tourController.checkID)

router.route('/top-5-cheap').get(tourController.aliasTopTours, tourController.getAllTours)

router.route('/tour-stats').get(tourController.getTourStats)

router.route('/monthly-plan/:year').get(authController.protect, authController.restrictTo('admin', 'lead-guide', 'guide'), tourController.getMonthlyPlan)

// If user wanted to find tours within 300 miles (distance = 300) and latlng will be the co-ordinates of where user lived
// unit could be miles or kilometer
router.route('/tours-within/:distance/center/:latlng/unit/:unit').get(tourController.getToursWithin)
// Using query string, you would've written it as - tours-within?distance=300,center=-40,45,unit=mi
// But above url is much cleaner and a standard

router.route('/distances/:latlng/unit/:unit').get(tourController.getDistances);

// For nested tour and review routes. They should be like following
// POST /tour/tourID/reviews (The user will come from currently logged in user)
// GET /tour/tourID/reviews - get all the reviews for a tour
// GET /tour/tourID/reviewsreviewID - get a specific review
// We are implementing this functionality here in tourRoutes and tourController because the address starts with tours

// The problem with this implementation is that it is messy. So we will try to write this more cleanly
// Also the .post() code is exactly similar to what we wrote in reviewRoutes. This is a case of repititve code 
// router
//     .route('/:tourID/reviews/')
//     .post(authController.protect, authController.restrictTo('user'), reviewController.createReview)

// Cleaner and best implementation for nested routes
// router itself is a middleware and so it can use 'use' method.
// This says for the below specific route, it will use/go to reviewRouter
// The problem here is that reviewRouter doesn't get access to tourID. We will solve for it in reviewRouter.
router.use('/:tourID/reviews', reviewRouter);

router
    .route('/')
    .get(tourController.getAllTours)
    .post(authController.protect, authController.restrictTo('admin', 'lead-guide'), tourController.postTour);

router 
    .route('/:id')
    .get(tourController.getTourById)
    .patch(authController.protect, authController.restrictTo('admin', 'lead-guide'), tourController.uploadTourImages, tourController.resizeTourImages, tourController.updateTour)
    .delete(authController.protect, authController.restrictTo('admin', 'lead-guide'), tourController.deleteTour);

module.exports = router