const AppError = require('../utils/appError');

const handleCastErrorDB = err => {
    //path is the name of field for which the value was entered in wrong format
    const message = `Invalid ${err.path} : ${err.value}.`
    return new AppError(message, 400); //400 stands for Bad Request
}

const handleDuplicateFieldsDB = err => {
    const message = `Duplicate field value: ${err.keyValue.name}. Please use another value.`
    return new AppError(message, 400);
}

const handleValidationErrorDB = err => {
    //If mutiple validation errors, then we have an error object containing errors object which contains mutiple errors. And each different error is an object inside errors
    const errors = Object.values(err.errors).map(el => el.message);
    const message = `Invalid input data. ${errors.join('. ')}.`
    return new AppError(message, 400);
}

const handleJWTError = () => new AppError('Invalid token. Please log in again.', 401)

const handleJWTExpiredError = () => new AppError('Your token has expired! Please log in again.', 401)

const sendErrorDev = (err, req, res) => {
    // originalURL does not include host. For API
    if(req.originalUrl.startsWith('/api')) {
        return res.status(err.statusCode).json({
            status : err.status,
            error : err,
            message : err.message,
            stack : err.stack //Detailed occurence of error
          })
    }
    // For Rendered Website
    return res.status(err.statusCode).render('error', {
        title : 'Something went wrong!',
        msg : err.message
    })
    
}

const sendErrorProd = (err, req, res) => {
    // originalURL does not include host. For the API
    if(req.originalUrl.startsWith('/api')) {
        // Operational, predictable/trusted error: send message to client
        if(err.isOperational){
            return res.status(err.statusCode).json({
                status : err.status,
                message : err.message,
            })
        }
        // Programming or other unknown error: don't leak details to the client 
        // 1) Log error
        console.error('ERROR :', err);

        // 2) Send generic message
        return res.status(500).json({
            status : 'error',
            message : 'Something went wrong.'
        })
    }
    // For the Rendered Website. Here the error message not being displayed(generic message being displayed.) on the page or in console. 
    // FIXED by manually copying error.message = err.message
    // Operational, predictable/trusted error: send message to client
    if(err.isOperational){
        return res.status(err.statusCode).render('error', {
            title : 'Something went wrong!',
            msg : err.message
        })
    }
    // Programming or other unknown error: don't leak details to the client 

    // 1) Log error
    console.error('ERROR :', err);

    // 2) Send generic message
    return res.status(err.statusCode).render('error', {
        title : 'Something went wrong!',
        msg : 'Please try again later'
    })
    
}

// Error Handling Middleware
module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500 //500 as default for errors that don't have status code
    err.status = err.status || 'error'

    if(process.env.NODE_ENV === 'development'){
        sendErrorDev(err, req, res); //Passing error and response object to sendErrorDev
    } else if(process.env.NODE_ENV === 'production'){
        let error = { ...err }; //Creating a deep copy of err
        // Don't forget the below line or expected errors won't be shown in production environment
        error.message = err.message; //Did manually because message property in err was not being copied to error
        if(err.name === 'CastError'){ //For Entering invalid value for a field
            error = handleCastErrorDB(error); //handleCastErrorDB will return a new error created with AppError that will be marked as operational by default
        }

        if(error.code === 11000){ //For duplicate value
            error = handleDuplicateFieldsDB(error)
        }

        // CastError and ValidationError are not working because error.name is getting undefined.
        // console.log(`ERROR.ERRORS.NAME : ${err.name}`). Using err.name as we get the required result above and below.
        // Figure out what's wrong later
        if(err.name === 'ValidationError') { //Mongoose Validation errors
            error = handleValidationErrorDB(error)
        }

        if(err.name === 'JsonWebTokenError'){
            error = handleJWTError()
        }

        if(err.name === 'TokenExpiredError'){
            error = handleJWTExpiredError()
        }

        sendErrorProd(error, req, res);
    }
  
    
}