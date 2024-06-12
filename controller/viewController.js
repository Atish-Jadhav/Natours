const Tour = require('../models/tourModel');
const User = require('../models/userModel');
const Booking = require('../models/bookingModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// The set property is needed to access mapbox, axios, stripe or their elements axios and mapboxgl will show undefined. All have same CSP settings.
// If in future, any of the elements available from the above external libraries (or the ones added later from other external libraries) don't work, meaning showing undefined, try to update CSP for that element's site.
// All these CSP settings were written by Chatgpt so in future if any error occurs, go to Chatgpt.

// exports.alerts = (req, res, next) => {
//   const {alert} = req.query.alert;
//   if(alert === 'booking') {
//     res.locals.alert = 'Your booking was successful! Please check your email for confirmation. If your booking doesn\'t show up here immediately, please come back later.';
//   }
//   next();
// }

exports.getOverview = catchAsync(async (req, res, next) => {
    // 1) Get tour data from collection
    const tours = await Tour.find();

    // 2) Build template
    // 3) Render the template using data from (1)
    res.status(200).set(
      'Content-Security-Policy',
      "default-src 'self' https://*.mapbox.com; base-uri 'self'; block-all-mixed-content; font-src 'self' https: data:; frame-ancestors 'self'; img-src 'self' data:; object-src 'none'; script-src 'self' https://cdnjs.cloudflare.com https://api.mapbox.com https://js.stripe.com blob:; script-src-attr 'none'; style-src 'self' https: 'unsafe-inline'; upgrade-insecure-requests; frame-src 'self' https://js.stripe.com;"
    ).render('overview', {
      title : 'All tours',
      tours    
    });
});

exports.getTour = catchAsync(async (req, res, next) => {
    // 1) Get the data, from the requested tour (including reviews and guides)
    const tour = await Tour.findOne({ slug : req.params.slug }).populate({
        path : 'reviews', //virtual field
        fields : 'review rating user' 
    });

    if(!tour){
      return next(new AppError('There is no tour with that name.', 404));
    }

    // 2) Build template
    // 3) Render template using data from (1)

    // The below set method is 'absolutely' necessary or the map won't load.

    res.status(200).set(
      'Content-Security-Policy',
      "default-src 'self' https://*.mapbox.com; base-uri 'self'; block-all-mixed-content; font-src 'self' https: data:; frame-ancestors 'self'; img-src 'self' data:; object-src 'none'; script-src 'self' https://cdnjs.cloudflare.com https://api.mapbox.com https://js.stripe.com blob:; script-src-attr 'none'; style-src 'self' https: 'unsafe-inline'; upgrade-insecure-requests; frame-src 'self' https://js.stripe.com;"
    )
    .render('tour', {
      title : `${tour.name} Tour`,
      tour    
    });
});

exports.getLoginForm = (req, res) => {
  res.status(200).set(
    'Content-Security-Policy',
    "default-src 'self' https://*.mapbox.com; base-uri 'self'; block-all-mixed-content; font-src 'self' https: data:; frame-ancestors 'self'; img-src 'self' data:; object-src 'none'; script-src 'self' https://cdnjs.cloudflare.com https://api.mapbox.com https://js.stripe.com blob:; script-src-attr 'none'; style-src 'self' https: 'unsafe-inline'; upgrade-insecure-requests; frame-src 'self' https://js.stripe.com;"
  ).render('login', {
      title : 'Log into your account'
  }) 
}

exports.getSignupForm = (req, res) => {
  res.status(200).set(
    'Content-Security-Policy',
    "default-src 'self' https://*.mapbox.com; base-uri 'self'; block-all-mixed-content; font-src 'self' https: data:; frame-ancestors 'self'; img-src 'self' data:; object-src 'none'; script-src 'self' https://cdnjs.cloudflare.com https://api.mapbox.com https://js.stripe.com blob:; script-src-attr 'none'; style-src 'self' https: 'unsafe-inline'; upgrade-insecure-requests; frame-src 'self' https://js.stripe.com;"
  ).render('signup', {
      title : 'Sign Up'
  }) 
}

exports.getAccount = (req, res) => {
  // We don't need to query for current user as it has been done in protect middleware and it has been in added in route before getAccount
  res.status(200).set(
    'Content-Security-Policy',
    "default-src 'self' https://*.mapbox.com; base-uri 'self'; block-all-mixed-content; font-src 'self' https: data:; frame-ancestors 'self'; img-src 'self' data:; object-src 'none'; script-src 'self' https://cdnjs.cloudflare.com https://api.mapbox.com https://js.stripe.com blob:; script-src-attr 'none'; style-src 'self' https: 'unsafe-inline'; upgrade-insecure-requests; frame-src 'self' https://js.stripe.com;"
  ).render('account', {
      title : 'Your Account'
  }) 
}

exports.getMyTours = catchAsync(async (req, res, next) => {
  // 1) Find all bookings
  const bookings = await Booking.find({ user : req.user.id});

  // 2) Find tours with the returned IDs
  const tourIDs = bookings.map(el => el.tour); //tour is tour id itself. We'll have an array of tour IDs
  // Select all the tour which are in tourIDs
  const tours = await Tour.find({ _id : { $in : tourIDs }}); //we can't use in operator with findById

  res.status(200).set(
    'Content-Security-Policy',
    "default-src 'self' https://*.mapbox.com; base-uri 'self'; block-all-mixed-content; font-src 'self' https: data:; frame-ancestors 'self'; img-src 'self' data:; object-src 'none'; script-src 'self' https://cdnjs.cloudflare.com https://api.mapbox.com https://js.stripe.com blob:; script-src-attr 'none'; style-src 'self' https: 'unsafe-inline'; upgrade-insecure-requests; frame-src 'self' https://js.stripe.com;"
  ).render('overview', {
    title : 'My Tours',
    tours
  })
});

exports.updateUserData = catchAsync(async (req, res, next) => {
  // console.log(req.body);
  const updatedUser = await User.findByIdAndUpdate( req.user.id, {
    // This is possible because in HTML forms, the fields have name attribute
    name : req.body.name,
    email : req.body.email
  }, 
  {
    new : true, //Return the updated result
    runValidators : true
  });

  // We will be passing the updatedUser or the page will show data coming from protect middleware which will not be the updated user
  res.status(200).set(
    'Content-Security-Policy',
    "default-src 'self' https://*.mapbox.com; base-uri 'self'; block-all-mixed-content; font-src 'self' https: data:; frame-ancestors 'self'; img-src 'self' data:; object-src 'none'; script-src 'self' https://cdnjs.cloudflare.com https://api.mapbox.com https://js.stripe.com blob:; script-src-attr 'none'; style-src 'self' https: 'unsafe-inline'; upgrade-insecure-requests; frame-src 'self' https://js.stripe.com;"
  ).render('account', {
      title : 'Your Account',
      user : updatedUser
  })

})