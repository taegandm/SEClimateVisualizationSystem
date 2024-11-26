// js/map.js

// Initialize the map
const map = L.map('map', {
    zoom: 4,               // Initial zoom level
    minZoom: 3              // Minimum zoom level
}).setView([51.505, -0.09], 4); // Centered on US

//var bounds = L.latLngBounds([[65.8747, -169.6289], [65.8747, -169.6289]]);
//map.setMaxBounds(bounds);

// Add OpenStreetMap tiles
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Add Marker Functionality
let addMarkerEnabled = false; // Toggle state
let addShapeEnabled = false;  // Toggle state
var coordinates = [];
var tempMarkers = [];
var tempMarkerSize = 0.001

function onMapClick(e) {
    // Marker Function
    if (addMarkerEnabled) {
        const { lat, lng } = e.latlng; // Extract latitude and longitude
        L.marker([lat, lng]).addTo(map)
            .bindPopup(`Latitude: ${lat.toFixed(4)}, Longitude: ${lng.toFixed(4)}`)
            .openPopup();
    }

    // Shape Function
    if (addShapeEnabled) {
        const { lat, lng } = e.latlng; // Extract latitude and longitude
        coordinates.push([lat, lng]); // Append to coordinate list
        console.log(coordinates);   // Log selected coordinates

        // Add a temporary marker (small blue square)
        const tempMarker = L.rectangle(
            [[lat - tempMarkerSize, lng - tempMarkerSize], [lat + tempMarkerSize, lng + tempMarkerSize]],
            { color: 'blue', fillColor: 'blue', fillOpacity: 1 }
        ).addTo(map);
        tempMarkers.push(tempMarker); // Store temporary marker
        console.log(coordinates);   // Log selected coordinates
    }
    
}

// Add click event listener to the map
map.on('click', onMapClick);

const toggleMarkerButton = document.getElementById('toggleMarkerButton');
const toggleShapeButton = document.getElementById('toggleShapeButton');

// Toggle marker button functionality
toggleMarkerButton.addEventListener('click', () => {
    if (addShapeEnabled) toggleShapeFunctionality();
    toggleMarkerFunctionality()
});

// Toggle shape button functionality
toggleShapeButton.addEventListener('click', () => {
    if(addMarkerEnabled) toggleMarkerFunctionality();
    if(addShapeEnabled && coordinates.length > 0) {
        coordinates.push(coordinates[0]);

        // Create a polygon and add it to the map
        var polygon = L.polygon(coordinates, {
            color: 'blue',       // Outline color
            fillColor: 'lightblue', // Fill color for the inside
            fillOpacity: 0.5       // Transparency of the fill
        }).addTo(map);

        // Remove all temporary markers
        tempMarkers.forEach(marker => map.removeLayer(marker));
        tempMarkers = [];
    }
    coordinates = []
    toggleShapeFunctionality()
});     

// Toggle marker display and permission
function toggleMarkerFunctionality() {
    addMarkerEnabled = !addMarkerEnabled; // Toggle state
    toggleMarkerButton.classList.toggle('active', addMarkerEnabled); // Toggle button style
    toggleMarkerButton.textContent = addMarkerEnabled ? 'Stop Adding Markers' : 'Add Marker'; // Update button text
}

// Toggle shape display and permission
function toggleShapeFunctionality() {
    addShapeEnabled = !addShapeEnabled; // Toggle state
    toggleShapeButton.classList.toggle('active', addShapeEnabled); // Toggle button style
    toggleShapeButton.textContent = addShapeEnabled ? 'Stop Adding Shape' : 'Add Shape'; // Update button text
}   

// Temporary temperature data
const data = [
    [25, 51.505, -0.09],
    [30, 51.51, -0.1],
    [15, 51.52, -0.12]
];

// Add temperature markers
data.forEach(([temperature, lat, lng]) => {
    // Create a custom icon with temperature value
    const tempIcon = L.divIcon({
        className: 'temperature-icon',
        html: `<div>${temperature}°C</div>`,
        iconSize: [40, 30],
        iconAnchor: [15, 15]
    });

    // Add the marker to the map
    L.marker([lat, lng], { icon: tempIcon }).addTo(map);
});