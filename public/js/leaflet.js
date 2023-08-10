export const displayMap = (locations) => {
  // create map and center view
  const map = L.map('map', {
    zoomControl: false,
    dragging: false,
  }).setView([51.505, -0.09], 13);

  // load map tile layer
  L.tileLayer(
    'https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png',
    {
      maxZoom: 19,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }
  ).addTo(map);

  // create marker icon
  var greenIcon = L.icon({
    iconUrl: '/img/pin.png',
    iconSize: [32, 40], // size of the icon
    iconAnchor: [16, 45], // point of the icon which will correspond to marker's location
    popupAnchor: [0, -50], // point from which the popup should open relative to the iconAnchor
  });

  // create a map marker for every location
  const points = [];
  locations.forEach((loc) => {
    points.push([loc.coordinates[1], loc.coordinates[0]]);
    L.marker([loc.coordinates[1], loc.coordinates[0]], { icon: greenIcon })
      .addTo(map)
      .bindPopup(`<p>Day ${loc.day}: ${loc.description}</p>`, {
        autoClose: false,
      })
      .openPopup();
  });

  // set bounds
  const bounds = L.latLngBounds(points).pad(0.5);
  map.fitBounds(bounds);

  // disble scroll wheel
  map.scrollWheelZoom.disable();
};
