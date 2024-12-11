// Initialize the map
const map = L.map('map', {
    zoom: 4,               // Initial zoom level
    minZoom: 3             // Minimum zoom level
}).setView([51.505, -0.09], 4); // Centered on US

// Add OpenStreetMap tiles
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Global variables for year and emissions data
let currentYear = 2023;
let allEmissionsData = {};

// Populate the dropdown with years
function populateYearDropdown() {
    const yearSelect = document.getElementById('yearSelect');
    for (let year = 1750; year <= 2023; year++) {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        yearSelect.appendChild(option);
    }
    yearSelect.value = currentYear;

    yearSelect.addEventListener('change', (event) => {
        currentYear = parseInt(event.target.value, 10);
        loadGeoJsonDataWithEmissions();
    });
}

// Function to load and display GeoJSON country outlines with carbon emissions
async function loadGeoJsonDataWithEmissions() {
    try {
        const [geoJsonResponse, csvData] = await Promise.all([
            fetch('../data/countries.geojson').then(res => res.json()),
            extractCSVData('../data/annual-co2-emissions-per-country.csv')
        ]);

        // Filter data for the current year
        const yearData = csvData.filter(row => parseInt(row.Year, 10) === currentYear);

        // Extract world emissions from the year data
        const worldEmissions = yearData.find(row => row.Entity === "World")?.["Annual CO₂ emissions"] || 1;

        // Map year data to an object for quick lookup
        const emissionsMap = yearData.reduce((acc, row) => {
            acc[row.Entity] = {
                emissions: parseFloat(row["Annual CO₂ emissions"]),
                percent: row.Entity === "World" ? 0 : (parseFloat(row["Annual CO₂ emissions"]) / worldEmissions) * 100
            };
            return acc;
        }, {});

        // Function to determine color based on percent contribution
        function getColor(percent) {
            if (percent > 10) return '#800026'; // Deep red
            if (percent > 5) return '#BD0026';
            if (percent > 2) return '#E31A1C';
            if (percent > 1) return '#FC4E2A';
            if (percent > 0.5) return '#FD8D3C';
            if (percent > 0.2) return '#FEB24C';
            return '#FED976'; // Yellow
        }

        // Clear existing layers
        map.eachLayer((layer) => {
            if (layer.options && !layer.options.attribution) {
                map.removeLayer(layer);
            }
        });

        // Add OpenStreetMap tiles again
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '© OpenStreetMap contributors'
        }).addTo(map);

        // Add GeoJSON data to the map
        L.geoJSON(geoJsonResponse, {
            style: function (feature) {
                const countryName = feature.properties.ADMIN;
                const data = emissionsMap[countryName];

                return {
                    color: data ? getColor(data.percent) : 'gray',
                    weight: 1,
                    fillOpacity: data ? 0.6 : 0.1
                };
            },
            onEachFeature: function (feature, layer) {
                const countryName = feature.properties.ADMIN;
                const data = emissionsMap[countryName];

                if (data) {
                    layer.bindPopup(
                        `<strong>${countryName}</strong><br>` +
                        `Emissions: ${data.emissions.toLocaleString()} MT CO₂<br>` +
                        `Percent of World: ${data.percent.toFixed(2)}%`
                    );
                } else {
                    layer.bindPopup(`<strong>${countryName}</strong><br>No emissions data available`);
                }
            }
        }).addTo(map);
    } catch (error) {
        console.error('Error loading data:', error);
    }
}

// Function to extract CSV data
async function extractCSVData(filePath) {
    try {
        const response = await fetch(filePath);
        const text = await response.text();

        const rows = text.split('\n');
        const headers = rows[0].split(',');

        return rows.slice(1).map(row => {
            const values = row.split(',');
            return headers.reduce((acc, header, index) => {
                acc[header.trim()] = values[index]?.trim() || '';
                return acc;
            }, {});
        });
    } catch (error) {
        console.error('Error reading CSV data:', error);
    }
}

// Initialize
document.body.insertAdjacentHTML('afterbegin', '<select id="yearSelect"></select>');
populateYearDropdown();
loadGeoJsonDataWithEmissions();
