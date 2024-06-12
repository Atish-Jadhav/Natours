/* eslint-disable */
import { displayMap } from './mapbox';
import { login, logout } from './login';
import { signup } from './signup';
import { updateSettings } from './updateSettings';
import { bookTour } from './stripe';
// import { showAlert } from './alerts';

// DOM ELEMENTS
const mapBox = document.getElementById('map'); 
const loginForm = document.querySelector('.form--login');
const signupForm = document.querySelector('.form--signup');
const logoutBtn = document.querySelector('.nav__el.nav__el--logout');
const userDataForm = document.querySelector('.form-user-data');
const userPasswordForm = document.querySelector('.form-user-password');
const bookBtn = document.getElementById('book-tour')

// DELEGATION
if(mapBox){
    const locations = JSON.parse(mapBox.dataset.locations);
    // console.log(locations);
    displayMap(locations);
}

if(loginForm)
    loginForm.addEventListener('submit', e => {
        e.preventDefault(); //This prevents the form from loading any other page

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        login(email, password);
    });

if(signupForm)
    signupForm.addEventListener('submit', e => {
        e.preventDefault(); //This prevents the form from loading any other page
        
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const passwordConfirm = document.getElementById('passwordConfirm').value
        const role = document.getElementById('role').value
        signup(name, email, password, passwordConfirm, role);
        });

if(logoutBtn) logoutBtn.addEventListener('click', logout);

if(userDataForm) 
    userDataForm.addEventListener('submit', e => {
        e.preventDefault(); //This prevents the form from loading any other page
        const form = new FormData();
        // Because of photo we do it like this
        form.append('name', document.getElementById('name').value);
        form.append('email', document.getElementById('email').value);
        form.append('photo', document.getElementById('photo').files[0]);
        // console.log(form);

        // const name = document.getElementById('name').value;
        // const email = document.getElementById('email').value;
        // updateSettings({name, email}, 'data');
        updateSettings(form, 'data');

    })

if(userPasswordForm) 
    userPasswordForm.addEventListener('submit', async e => {
        e.preventDefault(); //This prevents the form from loading any other page
        // Password updating takes time due to encryption process so while password updates, show this nice UI
        document.querySelector('.btn--save-password').textContent = 'Updating...'

        const passwordCurrent = document.getElementById('password-current').value;
        const password = document.getElementById('password').value;
        const passwordConfirm = document.getElementById('password-confirm').value;
        await updateSettings({passwordCurrent, password, passwordConfirm}, 'password');

        // After updatiion has been done, change the button text back to original
        document.querySelector('.btn--save-password').textContent = 'Save password'

        // To clear the password fields after password has been updated
        document.getElementById('password-current').value = ''
        document.getElementById('password').value = ''
        document.getElementById('password-confirm').value = ''

    });

if(bookBtn)
    bookBtn.addEventListener('click', e => {
        // e.target is the element that was clicked/triggered this event listener
        // In pug in data attribute it is written as tour-id, in javascript whenever there is a -, it will automatically be converted to camel case
        e.target.textContent = 'Processing...'
        const tourID = e.target.dataset.tourId;
        bookTour(tourID);
});

// const alertMessage = document.querySelector('body').dataset.alert;
// if(alert) showAlert('success', alertMessage, 20);  