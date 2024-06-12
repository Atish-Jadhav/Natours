/* eslint-disable */

// Getting the location data from tour.pug where it is stored as string. It is contained in locations property.
// const locations = JSON.parse(document.getElementById('map').dataset.locations);
// console.log(locations);

export const displayMap = (locations) => {
	mapboxgl.accessToken = 'pk.eyJ1IjoiYXRpc2gzODY2IiwiYSI6ImNseDF3Z2l2azBna28ybHF1MTNyZnQ2NDAifQ.SzSWQRFfPtb-Oh8cmob_HQ';
const map = new mapboxgl.Map({
	container: 'map', // container ID. This will put the map on an element with the id map and we have it in tour.pug
	style: 'mapbox://styles/atish3866/clx30d48c005r01qqanzj9rr4', // style URL
	scrollZoom: false
	// center: [-118.113491, 34.111745], // starting position [lng, lat]
	// zoom: 10, // starting zoom
	// interactive: false
});

// This will be the area that will be displayed on the map
const bounds = new mapboxgl.LngLatBounds();

locations.forEach(loc => {
	// Create Marker on locations
	const el = document.createElement('div');
	// In CSS, we have a class of marker
	el.className = 'marker';

	// Add a marker inside the mapbox
	new mapboxgl.Marker({
		element : el,
		// Bottom of the element, which in this case is pin, is going to be located at the exact GPS location 
		anchor: 'bottom'
	}).setLngLat(loc.coordinates).addTo(map); //In locations document embedded in tours document, locations has coordinates property.

	// Add a popup
	new mapboxgl.Popup({
		// As markers overlap
		offset : 30
	}).setLngLat(loc.coordinates).setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`).addTo(map);

	// Extend map bounds to include current location
	bounds.extend(loc.coordinates);
})//The map in addTo is the map variable above

map.fitBounds(bounds, {
	padding : {
			// Specifying padding because of unique style of tour page
			top : 200,
			bottom : 150,
			left : 100,
			right : 100
	}
});
}

// mapboxgl.accessToken = 'pk.eyJ1IjoiYXRpc2gzODY2IiwiYSI6ImNseDF3Z2l2azBna28ybHF1MTNyZnQ2NDAifQ.SzSWQRFfPtb-Oh8cmob_HQ';
// const map = new mapboxgl.Map({
// 	container: 'map', // container ID. This will put the map on an element with the id map and we have it in tour.pug
// 	style: 'mapbox://styles/atish3866/clx30d48c005r01qqanzj9rr4', // style URL
// 	scrollZoom: false
// 	// center: [-118.113491, 34.111745], // starting position [lng, lat]
// 	// zoom: 10, // starting zoom
// 	// interactive: false
// });

// // This will be the area that will be displayed on the map
// const bounds = new mapboxgl.LngLatBounds();

// locations.forEach(loc => {
// 	// Create Marker on locations
// 	const el = document.createElement('div');
// 	// In CSS, we have a class of marker
// 	el.className = 'marker';

// 	// Add a marker inside the mapbox
// 	new mapboxgl.Marker({
// 		element : el,
// 		// Bottom of the element, which in this case is pin, is going to be located at the exact GPS location 
// 		anchor: 'bottom'
// 	}).setLngLat(loc.coordinates).addTo(map); //In locations document embedded in tours document, locations has coordinates property.

// 	// Add a popup
// 	new mapboxgl.Popup({
// 		// As markers overlap
// 		offset : 30
// 	}).setLngLat(loc.coordinates).setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`).addTo(map);

// 	// Extend map bounds to include current location
// 	bounds.extend(loc.coordinates);
// })//The map in addTo is the map variable above

// map.fitBounds(bounds, {
// 	padding : {
// 			// Specifying padding because of unique style of tour page
// 			top : 200,
// 			bottom : 150,
// 			left : 100,
// 			right : 100
// 	}
// });