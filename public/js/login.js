/* eslint-disable */

import { showAlert } from './alerts';

// const hideAlert =() => {
//     const el = document.querySelector('.alert');
//     if(el) el.parentElement.removeChild(el);
// }

// // type is 'success' or 'error'
// const showAlert = (type, msg) => {

//     hideAlert();
//     // Don't remove the double quotes or it won't work.
//     const markup = `<div class="alert alert--${type}">${msg}</div>`;
//     document.querySelector('body').insertAdjacentHTML('afterbegin', markup)
//     window.setTimeout(hideAlert, 5000); //5 seconds
// }

export const login = async (email, password) => {
    try{
        const result = await axios({
            method : 'POST',
            url : '/api/v1/users/login',
            data : {
                // We expect email and password and the key names are also email and password. Check the endpoint in Postman and then the body.
                email : email,
                password : password
            }
        });

        // The 'data' is the JSON response
        if(result.data.status === 'success') {
            showAlert('success', 'Logged in successfully')
            window.setTimeout(() => {
                // To load another page
                location.assign('/');
            }, 1500); //1.5 seconds
        }
    }catch(err){
        showAlert('error', err.response.data.message);
    }
}

export const logout = async () => {
    try{
        const result = await axios({
            method: 'GET',
            url: '/api/v1/users/logout'
        });
        // Need to refresh the page or the page will keep showing logged in user
        if(result.data.status = 'success') location.reload(true); //true will set reload from server and not browser cache
    }catch(err){
        console.log(err.message)
        showAlert('error', 'Error logging out! Try again.')
    }
}

// document.querySelector('.form').addEventListener('submit', e => {
//     e.preventDefault(); //This prevents the form from loading any other page

//     const email = document.getElementById('email').value;
//     const password = document.getElementById('password').value;
//     login(email, password);
// });

// document.querySelector('.nav__el.nav__el--logout').addEventListener('click', logout);


