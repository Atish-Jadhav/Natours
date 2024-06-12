const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const compression =  require('compression');
const cors = require('cors');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controller/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const viewRouter = require('./routes/viewRoutes');
const bookingRouter = require('./routes/bookingRoutes');
const bookingController = require('./controller/bookingController');

const app = express();

// Trust proxy. Heroku Configuration
app.enable('trust proxy');

// Set Pug as the template engine for rendering views
app.set('view engine', 'pug');

// Set the directory where the view templates are located. / is automatically added after directory name - dirname/views
app.set('views', path.join(__dirname, 'views'));

// 1) GLOBAL MIDDLEWARES
// Implement CORS
app.use(cors()); //For simple requests like get/post

// For not-simple requests
app.options('*', cors());
// app.options('api/v1/tours/:id', cors());

// Serving static files
app.use(express.static(path.join(__dirname, 'public')));

// Set security HTTP headers
app.use(helmet());

// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Limit requests from same API
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000, //1 hour
  message: 'Too many requests from this IP, please try again in an hour!'
});
app.use('/api', limiter);

// Why do we define this route here? The reason because in the checkout handler function when we receive the body from Stripe, 
// the Stripe function that we're gonna use to actually read the body needs this body in a raw form. So basically as string and not JSON. If in JSON it is not gonna work at all.
// But the below body parser converts the body to JSON as soon as any requests hit and then the checkout handler function would not work as req.body will be in simple JSON object.
// Commented because webhook implementation not working for some reason.
// app.post('/webhook-checkout', express.raw({ type : 'application/json' }), bookingController.webhookCheckout);

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' })); //10 kb is the limit
// To parse data from url encoded form (HTML forms). extended : true will allow to send more complex data
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
// To parse cookies in incoming requests as token are being sent in cookies
app.use(cookieParser());

// Data sanitization against NoSQL query injection
// Protects against queries like "email": { "$gt": "" }, where the result of query will always be true.
app.use(mongoSanitize());

// Data sanitization against XSS
// The package shown in the tutorial doesn't work anymore. Find your own method.

// Prevent parameter pollution. Allows the listed parameters to appear multiple times in query. For all others, it isn't allowed.
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price'
    ]
  })
);

// Will compress all the texts (JSON/HTML code) sent to clients. Not going to work for images.
app.use(compression());

// Test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.headers);
  // console.log(req.cookies);
  next();
});

// 3) ROUTES
app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

// To handle invalid routes.
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
