/* eslint-disable */

import { showAlert } from './alerts';

// const hideAlert =() => {
//   const el = document.querySelector('.alert');
//   if(el) el.parentElement.removeChild(el);
// }

// // type is 'success' or 'error'
// const showAlert = (type, msg) => {

//   hideAlert();
//   // Don't remove the double quotes or it won't work.
//   const markup = `<div class="alert alert--${type}">${msg}</div>`;
//   document.querySelector('body').insertAdjacentHTML('afterbegin', markup)
//   window.setTimeout(hideAlert, 5000); //5 seconds
// }

export const signup = async (name, email, password, passwordConfirm, role) => {
  try {
    const res = await axios({
      method: "POST",
      url: "/api/v1/users/signup",
      data: {
        name : name,
        email : email,
        password : password,
        passwordConfirm : passwordConfirm,
        role : role
      }
    });

    if (res.data.status === "success") {
      showAlert("success", "Signed up successfully!");
      window.setTimeout(() => {
        location.assign("/");
      }, 3000);
    }
  } catch (err) {
    // console.log(err.response.data);
    showAlert("error", err.response.data.message);
  }
};

// document.querySelector('.form--signup').addEventListener('submit', e => {
//   e.preventDefault(); //This prevents the form from loading any other page

//   const name = document.getElementById('name').value;
//   const email = document.getElementById('email').value;
//   const password = document.getElementById('password').value;
//   const passwordConfirm = document.getElementById('passwordConfirm').value
//   const role = document.getElementById('role').value
//   signup(name, email, password, passwordConfirm, role);
// });