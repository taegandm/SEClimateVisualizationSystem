import { populateYearDropdown } from './ui.js';
import { loadGeoJsonDataWithEmissions } from './data.js';
import { addBaseLayer, setMapBounds } from './map.js';

document.addEventListener('DOMContentLoaded', () => {
    addBaseLayer();
    setMapBounds(); // Restrict map panning
    populateYearDropdown();
    loadGeoJsonDataWithEmissions(2023); // Default year
});

