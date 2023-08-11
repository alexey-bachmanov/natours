import 'core-js/stable';
import 'regenerator-runtime/runtime';

import { login, logout } from './login';
import { displayMap } from './leaflet';
import { updateSettings } from './updateSettings';

///// DOM ELEMENTS /////
const loginForm = document.getElementById('login-form');
const logoutBtn = document.querySelector('.nav__el--logout');
const leafletMap = document.getElementById('map');
const userDataForm = document.querySelector('.form-user-data');
const userPasswordForm = document.querySelector('.form-user-password');

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
  userDataForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const userName = document.getElementById('name').value;
    const email = document.getElementById('email').value;

    updateSettings({ userName, email }, 'data');
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
