// import 'core-js/stable';
// import 'regenerator-runtime/runtime';

import { login, logout } from './login';
import { displayMap } from './leaflet';

///// DOM ELEMENTS /////
const loginForm = document.getElementById('login-form');
const logoutBtn = document.querySelector('.nav__el--logout');
const leafletMap = document.getElementById('map');

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
// imports data from #map
if (leafletMap) {
  const locations = JSON.parse(leafletMap.dataset.locations);
  displayMap(locations);
}
