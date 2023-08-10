// import 'core-js/stable';
// import 'regenerator-runtime/runtime';

import { login } from './login';
import { displayMap } from './leaflet';

///// LOGIN CODE /////
document.querySelector('.form')?.addEventListener('submit', (e) => {
  e.preventDefault();
  // pull email and password
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  login(email, password);
});

///// MAP CODE /////
// imports data from #map
const leafletMap = document.getElementById('map');
if (leafletMap) {
  const locations = JSON.parse(leafletMap.dataset.locations);
  displayMap(locations);
}
