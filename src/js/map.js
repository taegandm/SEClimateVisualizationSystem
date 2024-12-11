// Initialize the map
export const map = L.map('map', {
    zoom: 4,               // Initial zoom level
    minZoom: 3             // Minimum zoom level
}).setView([51.505, -0.09], 4); // Centered on US

// Add OpenStreetMap tiles
export function addBaseLayer() {
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);
}

// Clear non-base layers from the map
export function clearMapLayers() {
    map.eachLayer((layer) => {
        if (layer.options && !layer.options.attribution) {
            map.removeLayer(layer);
        }
    });
}
