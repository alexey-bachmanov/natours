import 'core-js/stable';
import 'regenerator-runtime/runtime';

import { login, logout } from './login';
import { displayMap } from './leaflet';
import { updateData } from './updateSettings';

///// DOM ELEMENTS /////
const loginForm = document.getElementById('login-form');
const logoutBtn = document.querySelector('.nav__el--logout');
const leafletMap = document.getElementById('map');
const userDataForm = document.querySelector('.form-user-data');

///// LOGIN CODE /////
if (loginForm) {
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
  // imports data from #map
  const locations = JSON.parse(leafletMap.dataset.locations);
  displayMap(locations);
}

///// USER DATA UPDATE CODE /////
if (userDataForm) {
  userDataForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const userName = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    updateData(userName, email);
  });
}
