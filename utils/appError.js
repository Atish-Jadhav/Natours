class AppError extends Error {
    constructor(message, statusCode) {
        super(message); //message is the only parameter the built-in error accepts
        // we didn't write this.message = message because whatever we are going to pass to parent class, which is Error. So whatever we pass into it is message property 
        // So by doing the above parent call, we already set the message property to our incoming message

        this.statusCode = statusCode;
        //If statusCode is in 400 series, status will be fail. Else it will be error. We are converting statusCode to string.
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true;

        // When a new object is created, and a constructor function is called, then that function call is not gonna appear in the stack trace, and will not pollute it.
        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = AppError;