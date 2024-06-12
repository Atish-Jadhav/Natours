const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name : { type : String, required : [true, 'Please tell us your name'] },
    email : { 
        type : String, 
        required : [true, 'Please provide your name'], 
        unique : true,
        lowercase : true,
        validate : [ validator.isEmail, 'Please provide a valid email']
    },
    photo : { 
        type : String, 
        default : 'default.jpg'
    },
    role : {
        type : String,
        enum : ['user', 'guide', 'lead-guide', 'admin'],
        default : 'user',
    },
    password : { 
        type : String, 
        required : [true, 'Please provide a password'],
        minlength : [8, 'Password should have minimum of 8 characters'],
        select : false //Don't show to client
    },
    passwordConfirm : { 
        type : String, 
        required : [true, 'Please confirm your password'],
        validate : {
            // This only works on CREATE and SAVE
            validator : function(el){
                return el === this.password;
            },
            message : 'Password and confirm password do not match',
        }
    },
    passwordChangedAt : Date,
    passwordResetToken : String,
    passwordResetExpires : Date,
    active : {
        type : Boolean,
        default : true,
        select : false
    }
});

// Document Middleware
userSchema.pre('save', function(next) {
    // If we didn't modify the password property or the document is just created, go to next handler function
    if(!this.isModified('password') || this.isNew) return next();

    // Sometimes storing the timestamp to the datbase is slower than issuing the JSON web token.
    // In such case, passwordChangedAt will be set after the token has issued making our token invalid
    // Because we check for that use case in the code in changedPasswordAfter
    // To avoid that tricky problem, we subtract one second from passwordchangedAt
    // While this might be slightly inaccurate, it is a good measure to ensure token is issued after the passwordChangedAt time
    this.passwordChangedAt = Date.now() - 1000;
    next();
})


userSchema.pre('save', async function(next) {
    // Reasoning behind isModified is that if user only updates email, then there is no need to encrypt password again
    if(!this.isModified('password')) 
        return next();
     
    //12 is the cost power. Measure of how CPU intensive this operation will be
    // Set the cost power higher and it will take longer to perform the encryption
    this.password = await bcrypt.hash(this.password, 12); 
    // We don't need passwordConfirm in database as it is used only for validation for user's sake to check if he has entered correct password
    this.passwordConfirm = undefined; //required above only means input is required and not that it must be persisted to the database
    next()
})

// Query Middleware
userSchema.pre(/^find/, function(next) { //For all queries starting with find
    // Points to the current query
    // Show only active users
    this.find({ active : { $ne : false} }); //This roundabout way for users who don't have active property
    next();
})

// Instance Method - Are available on all the documents of a collection
// candidatePassword is the password the user passes in the request body while logging in
// As we have made password above 'select : false', we can't access it below using 'this'. We need to pass it to function
userSchema.methods.correctPassword = async function(candidatePassword, userPassword){
    // We cannot manually compare the two as userPassword is hashed
    return await bcrypt.compare(candidatePassword, userPassword); //return true if both equal
}

// JWTTimestamp tells when the JWT token was issued. In instance method, 'this' always points to current document
userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
    // If a user has changed their password only then it will have that property
    if(this.passwordChangedAt){
        // Converting passwordChangedAt to milliseconds to seconds
        const changedTimeStamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10); //getTime will get in milliseconds. 10 is the base
        // console.log(changedTimeStamp, JWTTimestamp);
        
        // Say JWT token was issued at 100 and password was changed at 200. In that case token should be invalid as password was changed after token was issued
        // If JWT token > password, false will be returned as password was changed first and issued token after that. User token is valid
        return JWTTimestamp < changedTimeStamp; //True means invalid token and false means valid token.
    }
    
    // False here means password never changed
    return false;

}

userSchema.methods.createPasswordResetToken = function(){
    //Encrypted token in the database and unecrypted one sending to user's email.

    const resetToken = crypto.randomBytes(32).toString('hex'); //32 is the number of characters. We convert it to hexadecimal string
    // encrypting resetToken so if a attacker gains access to our database, he won't be able to read the resetToken
    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex'); //storing it as hexadecimal

    // Storing it as object because it will tell us the variable name along with it's value. Doesn't work with 'this'.
    // console.log({resetToken}, this.passwordResetToken);

    this.passwordResetExpires = Date.now() + 10 * 60 * 1000; //10 minutes

    return resetToken;
}

const User = mongoose.model('User', userSchema);

module.exports = User;