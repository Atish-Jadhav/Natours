const mongoose = require('mongoose')
const dotenv = require('dotenv');

// Handling uncaught exceptions. This needs to be here to catch uncaught exceptions. This will catch them even if they occur inside the app file.
// Example of uncaught exception - console.log(x);
process.on('uncaughtException', err => {
    console.log('Uncaught Exception. Shutting down.')
    console.log(err.name, err.message);
    process.exit(1); //0 for success, 1 for uncaught exception
})

dotenv.config({ path: './config.env' }); //Environment variables need to be read before requiring app file. Or the environment variables values won't be available in app file.
const app = require('./app');

const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);
mongoose.connect(DB).then(connection => {
    // console.log(connection.connections)
    console.log("Database connection was successful!")
})


// console.log(process.env)
const port = process.env.PORT || 3000;
const server = app.listen(port, () => console.log('Listening for incoming requests ...'));

//Handling Unhandled Rejection - like connecting to the database. 
// We could directly catch it above but below is global method to catch all unhandled rejections.
// Using the concept of event listeners.
process.on('unhandledRejection', err => {
    console.log('Unhandled Rejection. Shutting down.')
    console.log(err.name, err.message);
    server.close(() => {
        process.exit(1); //0 for success, 1 for uncaught exception
    }) //Closing the server first to shut down gracefully. If not closed server first, app will crash. It will look the same as when closed directly with process.exit() showing app crashed.
})

// console.log(x);

// This is heroku configuration. Heroku sends sigterm signals every 24 hours to shut down application to keep it in healthy state.
// To manage that shutdown gracefully and not leave any request hanging, we do the following
process.on('SIGTERM', () => {
    console.log('SIGTERM RECEIVED. Shutting down gracefully.');
    server.close(() => { //This allows all the pending requests to still process until the end.
        console.log('Process terminated!')
    })
})