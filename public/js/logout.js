/* eslint-disable */

// import { showAlert } from './alerts.js';

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

// export const logout = async () => {
//     try{
//         const result = await axios({
//             method: 'GET',
//             url: 'http://127.0.0.1:3000/api/v1/users/logout'
//         });
//         // Need to refresh the page or the page will keep showing logged in user
//         if(result.data.status = 'success') 
//             location.reload(true); //true will set reload from server and not browser cache
//     }catch(err){
//         console.log(err)
//         showAlert('error', 'Error logging out! Try again.')
//     }
// }

// document.querySelector('.nav__el.nav__el--logout').addEventListener('click', logout);
