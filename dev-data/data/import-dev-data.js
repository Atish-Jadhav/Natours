const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Tour = require('../../models/tourModel')
const User = require('../../models/userModel');
const Review = require('../../models/reviewModel');

dotenv.config({ path: './config.env' }); //Environment variables need to be read before requiring app file. Or the environment variables values won't be available in app file.


const DB = process.env.DATABASE.replace(
    '<PASSWORD>', 
    process.env.DATABASE_PASSWORD
);

mongoose.connect(DB).then(() => {
    console.log("Database connection was successful!")
})

// Reading the JSON File
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));
const reviews = JSON.parse(fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8'));

// Note : Before saving users into the database, comment out the password encryption middlewares (One with passwordChangedAt and passwordConfirm in it. 
// They are two specified after Document Middleware) as user JSON password is already encrypted.

//Importing Data into Database
const importData = async() => {
    try{
        await Tour.create(tours)
        await User.create(users, { validateBeforeSave : false }) //Turning validation off because JSON user file does not have confirmPassword property which gives a validation error.
        await Review.create(reviews)
        console.log("Data successfully loaded") 
    }catch(err){
        console.log(err.message)
    }
    process.exit()
}

// Delete all data from the database to avoid duplicate errors
const deleteData = async() => {
    try{
        await Tour.deleteMany()
        await User.deleteMany()
        await Review.deleteMany()
        console.log("Data successfully deleted!")
    }catch(err){
        console.log(err.message)
    }
    process.exit()
}
 

if (process.argv[2] === '--import')
    importData()
else if(process.argv[2] === '--delete')
    deleteData()

// process.argv: This is a property of the process object in Node.js. 
// It's an array that contains all the arguments passed to your script

// 1st element (process.argv[0]) is always the path to the Node.js executable itself
// 2nd element (process.argv[1]) is the path to your JavaScript file you're running
// Any additional arguments you provide on the command line will be included in the array starting from the third element (process.argv[2])
console.log(process.argv);

