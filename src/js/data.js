import { map, addBaseLayer, clearMapLayers } from './map.js';
import { updateWorldEmissionsDisplay } from './ui.js';

export async function loadGeoJsonDataWithEmissions(currentYear) {
    try {
        const [geoJsonResponse, csvData] = await Promise.all([
            fetch('../data/countries.geojson').then(res => res.json()),
            extractCSVData('../data/annual-co2-emissions-per-country.csv')
        ]);

        const yearData = csvData.filter(row => parseInt(row.Year, 10) === currentYear);
        const worldEmissions = yearData.find(row => row.Entity === "World")?.["Annual CO₂ emissions"] || 1;

        updateWorldEmissionsDisplay(worldEmissions);

        const emissionsMap = yearData.reduce((acc, row) => {
            acc[row.Entity] = {
                emissions: parseFloat(row["Annual CO₂ emissions"]),
                percent: row.Entity === "World" ? 0 : (parseFloat(row["Annual CO₂ emissions"]) / worldEmissions) * 100
            };
            return acc;
        }, {});

        clearMapLayers();
        addBaseLayer();

        
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

function getColor(percent) {
    if (percent > 10) return '#800026';
    if (percent > 5) return '#BD0026';
    if (percent > 2) return '#E31A1C';
    if (percent > 1) return '#FC4E2A';
    if (percent > 0.5) return '#FD8D3C';
    if (percent > 0.2) return '#FEB24C';
    return '#FED976';
}
