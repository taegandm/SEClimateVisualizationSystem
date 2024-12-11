import { loadGeoJsonDataWithEmissions } from './data.js';

let currentYear = 2023;

export function populateYearDropdown() {
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
        loadGeoJsonDataWithEmissions(currentYear);
    });
}

export function updateWorldEmissionsDisplay(emissions) {
    const worldEmissionsElement = document.getElementById('world-emissions');
    worldEmissionsElement.textContent = `Total World Emissions: ${parseFloat(emissions).toLocaleString()} MT CO₂`;
}

export function getCurrentYear() {
    return currentYear;
}
