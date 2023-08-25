import 'core-js/stable';
import 'regenerator-runtime/runtime';

import { login, logout } from './login';
import { displayMap } from './leaflet';
import { updateSettings } from './updateSettings';
import { bookTour } from './stripe';
import { showAlert } from './alerts';

///// DOM ELEMENTS /////
const loginForm = document.getElementById('login-form');
const logoutBtn = document.querySelector('.nav__el--logout');
const leafletMap = document.getElementById('map');
const userDataForm = document.querySelector('.form-user-data');
const userPasswordForm = document.querySelector('.form-user-password');
const bookBtn = document.getElementById('book-tour');

///// LOGIN CODE /////
if (loginForm) {
  // you're on the login page
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    // pull email and password
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password);
  });
}

if (logoutBtn) {
  logoutBtn.addEventListener('click', logout);
}

///// MAP CODE /////
if (leafletMap) {
  // you're on the tour details page
  // imports data from #map
  const locations = JSON.parse(leafletMap.dataset.locations);
  displayMap(locations);
}

///// USER DATA UPDATE CODE /////
if (userDataForm) {
  // you're on the user data page
  userDataForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // build a multipart/form-data object
    const form = new FormData();
    form.append('userName', document.getElementById('name').value);
    form.append('email', document.getElementById('email').value);
    // files is an array, select file 1 of 1 and append it to the form
    form.append('photo', document.getElementById('photo').files[0]);

    await updateSettings(form, 'data');
  });
  userPasswordForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // pull entered password data
    const password = document.getElementById('password-current').value;
    const passwordNew = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('password-confirm').value;

    // set button text to 'Updating...'
    document.getElementById('button-save-password').textContent = 'Updating...';

    // send the password change request
    await updateSettings(
      { password, passwordNew, passwordConfirm },
      'password'
    );

    // clear the password fields
    document.getElementById('password-current').value = '';
    document.getElementById('password').value = '';
    document.getElementById('password-confirm').value = '';

    // reset button to 'Save password' again
    document.getElementById('button-save-password').textContent =
      'Save password';
  });
}

///// STRIPE CHECKOUT CODE /////
if (bookBtn) {
  // you're on the tour details page and logged in
  bookBtn.addEventListener('click', (e) => {
    // change button text
    bookBtn.textContent = 'Processing...';
    // pull tourId from checkout button and book that tour
    bookTour(bookBtn.dataset.tourId);
  });
}

///// ALERT POPUP CODE /////
// read alert content, if any
const alertMessage = document.querySelector('body').dataset.alert;
if (alertMessage) showAlert('success', alertMessage, 20000);
