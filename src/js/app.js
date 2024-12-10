const fs = require('fs');
import { extractCSVData, extractGeoJsonData } from './processFile.js';

// Example usage:
const csvFilePath = 'data/annual-co2-emissions-per-country.csv'; // Path to your CSV file
const JSONFilePath = 'data/countries.geojson'; // Path to your GeoJSON file

const features = extractGeoJsonData(JSONFilePath);
if (features) {
    console.log('Extracted Features:', features);
}

extractCSVData(csvFilePath)
    .then((data) => {
        console.log('Extracted Data:', data);
    })
    .catch((error) => {
        console.error('Error:', error);
    });