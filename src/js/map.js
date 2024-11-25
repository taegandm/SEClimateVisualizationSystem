// js/map.js
document.addEventListener("DOMContentLoaded", () => {
    const map = L.map('map').setView([0, 0], 2);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Example marker
    L.marker([51.5, -0.09]).addTo(map)
        .bindPopup('Sample Climate Data Location')
        .openPopup();
});