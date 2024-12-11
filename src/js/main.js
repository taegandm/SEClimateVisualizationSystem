import { populateYearDropdown } from './ui.js';
import { loadGeoJsonDataWithEmissions } from './data.js';
import { addBaseLayer } from './map.js';

document.addEventListener('DOMContentLoaded', () => {
    addBaseLayer();
    populateYearDropdown();
    loadGeoJsonDataWithEmissions(2023); // Default year
});
