const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Tour = require('../models/tourModel');
const User = require('../models/userModel');
const Booking = require('../models/bookingModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const factory = require('../controller/handlerFactory');

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
    // 1) Get the currently booked tour
    const tour = await Tour.findById(req.params.tourID);

    // 2) Create a checkout session
    const session = await stripe.checkout.sessions.create({
        // Information about the session
        mode : 'payment',
        payment_method_types : ['card'],
        // Whenever payment is successful, it will go to success_url and it's at this point in time that we need to create a booking for the paid tour
        // When the website is deployed, we'll have access to session object when the purchase is completed using Stripe Webhooks and these webhooks will be perfect to create new booking
        // But as we can't do it until website is deployed, we'll apply an unsecure workaround. We'll pass the data needed to create a new booking as query string into the success_url
        // And we need query string, because Stripe will only make a get request to the url, so we cannot send any body with it.
        // This is really insecure because if someone accesses the route with query string, they will create a booking without paying for the tour.
        success_url : `${req.protocol}://${req.get('host')}/?tour=${req.params.tourID}&user=${req.user.id}&price=${tour.price}`,
        // success_url : `${req.protocol}://${req.get('host')}/`,
        cancel_url : `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
        // We included customer_email so that on checkout page, it automatically appears.
        customer_email : req.user.email, //This is a protected route and so we req.user from protect
        client_reference_id : req.params.tourID,
        // This is the information about the product
        line_items : [
            {
                quantity : 1, //One tour in our case
                price_data : {
                    currency : 'usd',
                    unit_amount: tour.price * 100, //The amount is expected to be in cents, so 1 dollar or 1 euro or most of the currencies have 100 cents, so 1 dollar = 100 cents, so to convert it cents multiply by 100
                    product_data : {
                    // These field names come from stripe
                    name : `${tour.name} Tour`,
                    description : tour.summary,
                    // These images need to be live images, basically images that are hosted on internet because Stripe will actually upload this images on their server
                    // For now, as our website isn't hosted, we will use image on the hosted www.natours.dev website.
                    // Copied the link address of cover image of The Forest Hiker
                    // We'll replace the name of the image with tour.imageCover as because the names of images on natours.dev are exactly the same as we have here in our project
                    images : [`https://www.natours.dev/img/tours/${tour.imageCover}`],
                    // images : [`${req.protocol}://${req.get('host')}/img/tours/${tour.imageCover}`],
                    },
                    // unit_amount: tour.price * 100, //The amount is expected to be in cents, so 1 dollar or 1 euro or most of the currencies have 100 cents, so 1 dollar = 100 cents, so to convert it cents multiply by 100
                },
                // quantity : 1, //One tour in our case
            },
        ]
    })

    // 3) Create session as response so we could send it to client
    res.status(200).json({
        status : 'success',
        session
    })
});

exports.createBookingCheckout = catchAsync(async(req, res, next) => {
    const {tour, user, price} = req.query;
    // We need all three. If even one missing don't create the booking
    if(!tour && !user && !price) return next();

    // Create Booking
    //We only need to create the booking and not send it, so we're not storing it in variable
    await Booking.create({ tour, user, price}); 
    // We won't be using next() because of unsecure the workaround as the url contains all that data about paid tour
    // So, we will be redirecting to the intended page just without the query string. query string starts with ?
    // redirect basically creates a new request but to the new url we pass, so the 2nd time when we go through this middleware, user, price & tour will not be present and so we'll go to next function using next()
    res.redirect(req.originalUrl.split('?')[0]); 
});

// Not sure why not working. Will come back later to the issue.
// const createBookingWebhookCheckout = async session => {
//     try{
//         // client_reference_id contains tour id
//     const tour = session.client_reference_id;
//     // customer_email contains user's email through we will find it's id
//     const user = (await User.findOne({ email : session.customer_email })).id; //This will only return the id and not entire user document
//     const price = session.amount_total / 100; // /100 to get back amount in dollars
//     await Booking.create({ tour, user, price});
//     }catch(err){
//         console.log(err.message);
//     }
// } 

// exports.webhookCheckout = (req, res, next) => {
//     const signature = req.headers['stripe-signature'];
//     let event;
//     try{
//         event = stripe.webhooks.constructEvent(req.body, signature, process.env.STRIPE_WEBHOOK_SECRET);
//     }catch(err){
//         // It is the Stripe who receive the below response
//         return res.status(400).send(`Webhook error : ${err.message}`);
//     }

//     if(event.type === 'checkout.session.completed')
//         createBookingWebhookCheckout(event.object.data); //session is at event.object.data

//     res.status(200).json({ received : true });
    
// }

exports.createBooking = factory.createOne(Booking);
exports.getBooking = factory.getOne(Booking);
exports.getAllBookings = factory.getAll(Booking);
exports.updateBooking = factory.updateOne(Booking);
exports.deleteBooking = factory.deleteOne(Booking);