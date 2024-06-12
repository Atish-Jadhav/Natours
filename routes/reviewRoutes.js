const express = require('express');
const router = express.Router({ mergeParams : true });
const authController = require('../controller/authController');
const reviewController = require('../controller/reviewController');

// Why do we need mergeParams? Because by default, each router only has access to the parameters of their specific routes
// For the below post route to create review (or to getALlReviews), there is no tourID. But we still want to get access to the tourID in the other router
// To get that access, we need to physically merge the parameters and that's what mergeParams set to true does.

// Now no matter what route you get - ('/reviews') or ('/:tourID/reviews/'), It will all end up in appropriate route handler according to the HTTP verb

// To protect all routes after line 13.
router.use(authController.protect);

router
    .route('/')
    .get(reviewController.getAllReviews)
    .post(authController.restrictTo('user'), reviewController.setTourUserIds, reviewController.createReview);

router
    .route('/:id')
    .get(reviewController.getReviewById)
    .delete(authController.restrictTo('user', 'admin'), reviewController.deleteReview)
    .patch(authController.restrictTo('user', 'admin'), reviewController.updateReview)

module.exports = router;