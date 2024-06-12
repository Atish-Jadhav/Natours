const express = require('express');

const router = express.Router();
const userController = require('../controller/userController');
const authController = require('../controller/authController');

// Have all the single line routes above the chaining routes. 
// Sometimes, unexpectedly the control may shift to chaining routes even though their routes may be totally different in name.
// It might happen because they share the same http verb.

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/logout', authController.logout);
router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

// To use protect middleware on all the following routes, we write it as -
router.use(authController.protect);

router.get('/me', userController.getMe, userController.getUserById);
router.patch('/updateMyPassword', authController.updatePassword);

router.patch('/updateMe', userController.uploadUserPhoto, userController.resizeUserPhoto, userController.updateMe);
router.delete('/deleteMe', userController.deleteMe);

// Following actions can only by admin, so we write it as -
router.use(authController.restrictTo('admin'));

router
    .route('/')
    .get(userController.getAllUsers)
    .post(userController.postUser)

router
    .route('/:id')
    .get(userController.getUserById)
    .patch(userController.patchUser)
    .delete(userController.deleteUser)

module.exports = router