const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const AppError = require('../utils/appError')
const catchAsync = require('../utils/catchAsync');
const Email = require('../utils/email');

const signToken = id => {
    // The first object is the payload. Token Header will be created automatically. After Secret is the option object.
    return jwt.sign( { id : id}, process.env.JWT_SECRET, {
        expiresIn : process.env.JWT_EXPIRES_IN
    });
}
const sendCookie = (req, res, token) => {
    const cookieOptions = {
        expires : new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000), //24 to hours, 60 to minutes, 60 to seconds, 1000 to milliseconds
        // Because of below property, all the browser will do is receive the cookie, store it and then send it automatically along with every request
        httpOnly : true //This means the cookie cannot be accessed or modified in any way by browser
    }
    
    // if(process.env.NODE_ENV === 'production') cookieOptions.secure = true; //This means that cookie will only be sent on an encrypted connection, like https
    
    // For heroku the above line isn't enough, so
    if(req.secure || req.headers['x-forwarded-proto'] === 'https') cookieOptions.secure = true;

    res.cookie('jwt', token, cookieOptions)
}

exports.signup = catchAsync(async (req, res, next) => {
    // The below code poses security risk as anyone can signup as admin by mentioning their role as admin.
    // const newUser = await User.create(req.body);

    // Here we only allow the data that we actually need. Not directly use req.body
    // So even if someone manipulates to enter the role, it will not be stored below
    // Whenever adding new fields to the User in model, be sure to include them here or they would not be persisted to the database.
    const newUser = await User.create({
        name : req.body.name,
        email : req.body.email,
        role : req.body.role,
        password : req.body.password,
        passwordConfirm : req.body.passwordConfirm,
        passwordChangedAt : req.body.passwordChangedAt
    })

    // In Production the protocol and host will be different from the one used in development
    const url = `${req.protocol}://${req.get('host')}/me`;
    // console.log(url);
    await new Email(newUser, url).sendWelcome();

    const token = signToken(newUser._id) //Passing the id which will be stored in Payload
    sendCookie(req, res, token);
    newUser.password = undefined; //To hide user password after signing up a new user. In Postman.
    newUser.active = undefined; //Same as above

    res.status(200).json({
        status : 'success',
        token,
        data : {
            user : newUser
        }
    })
});

exports.login = catchAsync(async(req, res, next) => {
    const { email, password } = req.body;

    // 1) Check if email and password entered
    if(!email || !password){
        return next(new AppError('Please provide email and password', 400))
    }
    // 2) Check if user exists and password is correct
    // password is hidden in Model to not show to the client, so we need to use the below workaround where we explicitly select it.
    const user = await User.findOne({ email : email}).select('+password');
    // console.log(user)
    // correctPassword is an instance method.
    // password is the user entered value while logging in and user.password is queried from the database
    // const correct = await user.correctPassword(password, user.password);

    // Used 'OR' condition because if even one of them is wrong, then the operation cannot be performed.
    // If user doesn't exist, then there is no point in checking password. And even if user exists and password is wrong, then still the operation can't be performed.
    // Moved the correctPassword logic down here because email validation is not being correctly done.
    // Because if the email isn't right, then a user object won't be returned and thus you can't pass that user's password to correctPassword function as we don't have it.
    // In which case you'll get an error - TypeError: Cannot read properties of null (reading 'correctPassword')

    if(!user || !await user.correctPassword(password, user.password)){
        return next(new AppError('Invalid credentials. Check email and password.', 401))
    }
    
    // 3) If everything ok, send token to client
    const token = signToken(user._id);
    sendCookie(req, res, token);

    res.status(200).json({
        status : 'success',
        token
    })
})

// For Browser where jwt is stored in cookies. We create a token with nothing/some gibberish assigned to it, so user can't be logged-in no more
exports.logout = (req, res) => {
    res.cookie('jwt', 'loggedout', {
        expires : new Date(Date.now() + 10 * 1000), //10 seconds
        httpOnly : true
    });

    res.status(200).json({
        status : 'success'
    });
}

// Middleware for protecting routes from unauthorized access
exports.protect = catchAsync(async(req, res, next) => {
    let token;
    // 1) Getting the token and check if it present
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
        // In headers, we have token inside 'authorization' key and it's value is 'Bearer token-value'
        token = req.headers.authorization.split(' ')[1];
    }else if(req.cookies.jwt){ //To read json web token from cookie
        token = req.cookies.jwt;
    } 
    // console.log(token);

    // If token isn't there
    if(!token) {
        return next(new AppError('You are not logged in! Please log in to get access', 401)) //401 means Unauthorized
    }

    // 2) Validating the token
    // Passing token so algorithm can read payload
    // We need secret for it to create test signature which will be compared with the original signature
    // verify is an asynchronous function which will call the callback once it has verified but we will make it return a promise by promisifying it using a built-in function from built-in util module
    //  jwt.verify uses callbacks, which can be less convenient for asynchronous code

    // promisify is a function that takes another function as its argument.
    // In this case, we want to convert the callback-based jwt.verify function into a promise-based one
    // By wrapping jwt.verify with parentheses, we tell promisify which function to modify.
    // On the other hand, token and process.env.JWT_SECRET are the arguments that will be passed to the converted jwt.verify function (the promise-based version). 
    // These arguments themselves don't need any modification by promisify.
    // They are simply the data (token to verify and JWT_SECRET for verification) that the jwt.verify function will use.
    
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET)
    // console.log(decoded);

    // 3) Check if user still exists. In case the user was deleted after getting a token
    const currentUser = await User.findById(decoded.id) //decoded contains the id which is payload
    if(!currentUser){
        return next(new AppError('User having the token no longer exists.', 401)) //error for development mode. In production, only getting status.
    }

    //For the above and below, in production only getting status and status code and not message. If used Error object generic message appears and 500 status code

    // 4) Check if user changed password after the JWT was issued
    if(currentUser.changedPasswordAfter(decoded.iat)){    //iat - issued at 
        return next(new AppError('User recently changed password. Please log in again', 401)) //error for development mode. In production, only getting status.
    }  
    
    // Grant access to the protected route
    req.user = currentUser;
    // Making the user variable availabe in all pug templates by adding res.locals
    res.locals.user = currentUser;
    next();
})

// This is for rendered pages on front-end. No errors to be displayed
exports.isLoggedIn = async(req, res, next) => {
    try{
        // On front-end token will always only be sent through the cookie and never the authorization header.
    if(req.cookies.jwt){ //To read json web token from cookie
        // 1) Verify token
        const decoded = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET)

        // 2) Check if user still exists. In case the user was deleted after getting a token
        const currentUser = await User.findById(decoded.id) //decoded contains the id which is payload
        if(!currentUser){
            return next() //No error to be displayed. Simply move on to the next middleware
        }

        // 3) Check if user changed password after the JWT was issued
        if(currentUser.changedPasswordAfter(decoded.iat)){    //iat - issued at 
            return next()
        }

        // Above are all the verification steps
        // There is a logged in user
        // Each and every pug template will have access to response.locals
        res.locals.user = currentUser;
        return next();
    }
    }catch(err){
        return next(); //In case there are no cookie, next middleware be called. As there are no cookie, there is no logged-in user
    } 
    next();
}

// Middleware for authorization. We cannot pass arguments to a middleware function but here we need arguments for roles. So the workaround.
// The return function will get access to roles parameter
exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        //roles['admin', 'lead-guide']
        // We are getting req.user from protect middleware as it is being run before the restrictTo. In protect, we assign the information of current user to req.user.
        if(!roles.includes(req.user.role)){ //For roles that do not have permission
            return next(new AppError('You do not have permission to perform this operation.', 403)); //403 means forbidden
        }
        next();
    }
}

// Forgot password 
exports.forgotPassword = catchAsync(async(req, res, next) => {
    // 1) Get used based on emails
    const user = await User.findOne({ email : req.body.email });
    if(!user){
        return next(new AppError('There is no user with that email address.', 404));
    }
    // 2)Generate the random token
    const resetToken = user.createPasswordResetToken();
    //saving the changes made in above instance method. saving changes of passwordResetExpires
    await user.save({ validateBeforeSave : false}); //This will deactivate all the validators specified in our schema

    // 3)Send it to user's email
    // At host not 3000 because we are going to eventually use this in production
    const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;

    // const message = `Forgot your password? Submit a PATCH request with your new password and confirm password
    // to : ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;

    // While sending an email, if an error occurs, we don't simply want to send an error message back to the client.
    // We also need to reset the Password token and it's expiry time
    try{
        // await sendEmail({
        //     email : user.email,
        //     subject : 'Your password reset token valid for only ten minutes',
        //     message
        // });

        // New Implementation with Email as class
        await new Email(user, resetURL).sendPasswordReset();
    
        // Remember we don't send resetToken here because anyone can get a hold of someone's email id and then enter forgot password and wait for reset token.
        // We send it to user's email, which only the user has access to.
        res.status(200).json({
            status : 'success',
            message: 'Token sent to email!'
        })
    }catch(err){
        console.log(err.message);
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({ validateBeforeSave : false}) //The above only modifies the data. We need to save it too.
    
        return next(new AppError('There was a problem sending the email. Please try again later.', 500)); //500 internal error
    }

})

// Reset password
exports.resetPassword = catchAsync(async (req, res, next) => {
    // 1) Get user based on the token

    // Hashing the received unencrypted token to compare it with the encrypted one stored in the database
    // req.params used because we are passing the token in the request of resetPassword
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex'); 

    // hashed token stored in the database in passwordResetToken property
    // We only want user whose passwordResetExpires is greater than the current time. 
    // If it is less, it means the reset token has expired and we can't change password
    const user = await User.findOne({ 
        passwordResetToken : hashedToken, 
        passwordResetExpires : { $gt: Date.now() } //MongoDB will do the conversion of timestamp returned by Date.now()
    });

    // 2) If token has not expired and there is user, then set the new password
    if(!user){
        return next(new AppError('Token is invalid or has expired.', 400))
    }

    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    // After setting the password, we don't need reset token and it's expiry time
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save(); //Saving the changes. We also don't turn off the validators as we want to validate the entered data

    // 3) Update changedPasswordAt property for the user

    // 4) Log the user in and send the JWT
    const token = signToken(user._id);
    sendCookie(req, res, token);

    res.status(200).json({
        status : 'success',
        token
    });
    
});

exports.updatePassword = catchAsync(async (req, res, next) => {
    // 1) Get user from collection
    // As to update the password, the user must be logged in already, we are using req.user to get the current user
    //To select password, we need to explicitly mentioned it as in schema we have set the select : false to not show it to client.
    const user = await User.findById(req.user.id).select('+password'); 

    // 2)Check if posted current password is correct

    if(!(await user.correctPassword(req.body.passwordCurrent, user.password))){
        return next(new AppError('Your current password is incorrect. Please try again.', 401));
    }

    // 3) If yes, update the password
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm
    await user.save(); //Saving the changes
    // Do not User.findByIdandUpdate. The many middlewares defined will not run as they are defined for save operation and also neither custom validators will work.

    // 4) Log user in, send JWT
    const token = signToken(user._id);
    sendCookie(req, res, token);

    res.status(200).json({
        status : 'success',
        token
    });
})