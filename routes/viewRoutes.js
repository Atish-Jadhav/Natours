const express = require('express');

const router = express.Router();
const viewController = require('../controller/viewController');
const authController = require('../controller/authController');
const bookingController = require('../controller/bookingController');

// router.use(viewController.alerts);

router.get('/me', authController.protect, viewController.getAccount);

// Applying isLoggedIn middleware to all routes
router.use(authController.isLoggedIn);

// For the unsecure workaround to create new booking (explained in bookingController) we need to add a middleware to overview route  
router.get('/', bookingController.createBookingCheckout, viewController.getOverview);
// Not needed above workaround as website now deployed. Not working for some reason.
// router.get('/', viewController.getOverview);
router.get('/tour/:slug', viewController.getTour);
router.get('/signup', viewController.getSignupForm);
router.get('/login', viewController.getLoginForm);

router.get('/my-tours', authController.protect, viewController.getMyTours);

// For updating user name and email in /me page using form action and method attributes
router.post('/submit-user-data', authController.protect, viewController.updateUserData);

module.exports = router;
