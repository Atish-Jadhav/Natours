const express = require('express');

const router = express.Router();
const authController = require('../controller/authController');
const bookingController = require('../controller/bookingController');

router.use(authController.protect);

router.get('/checkout-session/:tourID', bookingController.getCheckoutSession);

router.use(authController.restrictTo('admin', 'lead-guide'))
router.route('/')
    .get(bookingController.getAllBookings)
    .post(bookingController.createBooking);

router.route('/:id')
    .get(bookingController.getBooking)
    .patch(bookingController.updateBooking)
    .delete(bookingController.deleteBooking);

module.exports = router;