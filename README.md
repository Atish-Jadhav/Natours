<p align="center">
  <img src="/public/img/logo-green-round.png" alt="Natours Icon" width="200"/>
</p>

<h1 align="center">Natours</h1>

---

<h3 align="center">An awesome tour booking site built on top of NodeJS.</h3>

---

<p align="center">
  <a href="#demo">Demo</a> • 
  <a href="#key-features">Key Features</a> • 
  <a href="#demonstration">Demonstration</a> • 
  <a href="#how-to-use">How To Use</a> • 
  <a href="#api-usage">API Usage</a> • 
  <a href="#deployment">Deployment</a> • 
  <a href="#build-with">Build With</a> • 
  <a href="#to-do">To-do</a> • 
  <a href="#installation">Installation</a> • 
  <a href="#known-bugs">Known Bugs</a> • 
  <a href="#future-updates">Future Updates</a> • 
  <a href="#acknowledgement">Acknowledgement</a>
</p>

## **Key Features 📝**

- **Authentication and Authorization**
  - Sign up, Log in, Logout, Update, and reset password.
  - User profile
    - Update username, photo, email address, and password
  - A user can be either a regular user or an admin or a lead guide or a guide.
  - When a user signs up, that user by default is a regular user.

- **Tour**
  - Manage booking, check tour map, check users' reviews and rating.
  - Tours can be created by an admin user or a lead-guide.
  - Tours can be seen by every user.
  - Tours can be updated by an admin user or a lead guide.
  - Tours can be deleted by an admin user or a lead-guide.

- **Bookings**
  - Only regular users can book tours (make a payment).
  - Regular users can see all the tours they have booked.
  - An admin user or a lead guide can see every booking on the app.
  - An admin user or a lead guide can delete any booking.
  - An admin user or a lead guide can create a booking (manually, without payment).
  - An admin user or a lead guide cannot create a booking for the same user twice.
  - An admin user or a lead guide can edit any booking.

- **Reviews**
  - Only regular users can write reviews for tours that they have booked.
  - All users can see the reviews of each tour.
  - Regular users can edit and delete their own reviews.
  - Regular users cannot review the same tour twice.
  - An admin can delete any review.

- **Favorite Tours**
  - A regular user can add any of their booked tours to their list of favorite tours.
  - A regular user can remove a tour from their list of favorite tours.
  - A regular user cannot add a tour to their list of favorite tours when it is already a favorite.

- **Credit Card Payment**

## **How To Use 🤔**

- **Book a tour**
  - Login to the site.
  - Search for tours that you want to book.
  - Book a tour.
  - Proceed to the payment checkout page.
  - Enter the card details (Test Mode):
    - Card No. : 4242 4242 4242 4242
    - Expiry date: Valid date
    - CVV: Any three digit pin
  - Finished!

- **Manage your booking**
  - Check the tour you have booked on the "Manage Booking" page in your user settings. You'll be automatically redirected to this page after you have completed the booking.

- **Update your profile**
  - You can update your own username, profile photo, email, and password.

- **API Usage**
  - Before using the API, you need to set the variables in Postman depending on your environment (development or production). Simply add:
    - `{{URL}}` with your hostname as value (Eg. http://127.0.0.1:3000 or http://www.example.com)
    - `{{password}}` with your user password as value.
  - Check Natours API Documentation - https://documenter.getpostman.com/view/34163254/2sA3QwdW8j for more info.

- **API Features:**
  - Tours List 👉🏻 [Natours Tours List](https://natours-atish-bd789b37e279.herokuapp.com/api/v1/tours)
  - Tours State 👉🏻 [Natours Tours State](https://natours-atish-bd789b37e279.herokuapp.com/tours/tour-stats)
  - Get Top 5 Cheap Tours 👉🏻 [Top 5 Cheap Tours](https://natours-atish-bd789b37e279.herokuapp.com/api/v1/tours/top-5-cheap)
  - Get Tours Within Radius 👉🏻 [Tours Within Radius](https://natours-atish-bd789b37e279.herokuapp.com/api/v1/tours/tours-within/200/center/34.098453,-118.096327/unit/mi)

## **Deployment 🌍**

The website is deployed with git into Heroku. Below are the steps taken:

```sh
git init
git add -A
git commit -m "Commit message"
heroku login
heroku create
heroku config:set CONFIG_KEY=CONFIG_VALUE
parcel build 
git push heroku master
heroku open
```

You can also change your website URL by running this command:

```sh
heroku apps:rename natours-users
```

## **Build With 🏗️**

- **NodeJS** - JS runtime environment
- **Express** - The web framework used
- **Mongoose** - Object Data Modelling (ODM) library
- **MongoDB Atlas** - Cloud database service
- **Pug** - High performance template engine
- **JSON Web Token** - Security token
- **ParcelJS** - Blazing fast, zero configuration web application bundler
- **Stripe** - Online payment API and Making payments on the app.
- **Postman** - API testing
- **Mailtrap & SendGrid** - Email delivery platform
- **Heroku** - Cloud platform
- **Mapbox** - Displaying the different locations of each tour.

## **To-do 🗒️**

- **Review and rating**
  - Allow users to add a review directly at the website after they have taken a tour

- **Booking**
  - Prevent duplicate bookings after a user has booked that exact tour, implement favorite tours

- **Advanced authentication features**
  - Signup, confirm user email, log in with refresh token, two-factor authentication

- **And More!** There's always room for improvement!

## **Setting Up Your Local Environment ⚙️**

If you wish to play around with the code base in your local environment, do the following:

- Clone this repo to your local machine.
- Using the terminal, navigate to the cloned repo.
- Install all the necessary dependencies, as stipulated in the package.json file.
- If you don't already have one, set up accounts with: MONGODB, MAPBOX, STRIPE, SENDGRID, and MAILTRAP. Please ensure to have at least basic knowledge of how these services work.
- In your .env file, set environment variables for the following:
  - DATABASE=your Mongodb database URL
  - DATABASE_PASSWORD=your MongoDB password
  - SECRET=your JSON web token secret
  - JWT_EXPIRES_IN=90d
  - JWT_COOKIE_EXPIRES_IN=90
  - EMAIL_USERNAME=your mailtrap username
  - EMAIL_PASSWORD=your mailtrap password
  - EMAIL_HOST=smtp.mailtrap.io
  - EMAIL_PORT=2525
  - EMAIL_FROM=your real-life email address
  - STRIPE_SECRET_KEY=your stripe secret key
  - STRIPE_WEBHOOK_SECRET=your stripe webhook secret

- Start the server.
- Your app should be running just fine.

Demo-.env file :

```sh
DATABASE=your Mongodb database URL
DATABASE_PASSWORD=your MongoDB password
SECRET=your JSON web token secret
JWT_EXPIRES_IN=90d
JWT_COOKIE_EXPIRES_IN=90
EMAIL_USERNAME=your mailtrap username
EMAIL_PASSWORD=your mailtrap password
EMAIL_HOST=smtp.mailtrap.io
EMAIL_PORT=2525
EMAIL_FROM=your real-life email address
STRIPE_SECRET_KEY=your stripe secret key
STRIPE_WEBHOOK_SECRET=your stripe webhook secret
```

## **Installation 🛠️**

You can fork the app or you can git-clone the app into your local machine. Once done, please install all the dependencies by running:

```sh
$ npm i
```

Set your env variables and set "source": "./public/js/index.js",
"main": "./public/js/bundle.js", below 'description' key. Don't put 'app.js' in main or the latest version of bundle will overwrite it. Also, "start:prod" to "cross-env NODE_ENV=production node server.js". Finally, start the server:

```sh
$ npm run watch
$ npm run build
$ npm run dev (for development)
$ npm run start:prod (for production)
$ npm run debug (for debug)
$ npm start
```

Setting up ESLint and Prettier in VS Code 👇🏻

```sh
$ npm i eslint prettier eslint-config-prettier eslint-plugin-prettier eslint-config-airbnb eslint-plugin-node eslint-plugin-import eslint-plugin-jsx-a11y eslint-plugin-react --save-dev
```

## **Contributing 💡**

Pull requests are welcome but please open an issue and discuss what you will do before 😊

## **Known Bugs 🚨**

Feel free to email me at atish691999@gmail.com
