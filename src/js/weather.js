import { map } from './map.js';

const API_KEY = 'a2bcc2d9496cae64c165352fa46e29be';

// Fetch weather data (air pollution and temperatures)
export async function fetchWeatherData(lat, lon, year) {
    try {
        const airPollutionUrl = `http://api.openweathermap.org/data/2.5/air_pollution/history?lat=${lat}&lon=${lon}&start=${getUnixStartOfYear(year)}&end=${getUnixEndOfYear(year)}&appid=${API_KEY}`;
        const airPollutionResponse = await fetch(airPollutionUrl);
        const airPollutionData = await airPollutionResponse.json();

        const temperatureUrl = `http://api.openweathermap.org/data/2.5/onecall/timemachine?lat=${lat}&lon=${lon}&dt=${getUnixMidYear(year)}&appid=${API_KEY}`;
        const temperatureResponse = await fetch(temperatureUrl);
        const temperatureData = await temperatureResponse.json();

        return {
            airPollution: airPollutionData,
            temperature: {
                max: kelvinToCelsius(temperatureData.daily?.[0]?.temp.max),
                min: kelvinToCelsius(temperatureData.daily?.[0]?.temp.min),
                avg: kelvinToCelsius(temperatureData.daily?.[0]?.temp.day),
            },
        };
    } catch (error) {
        console.error('Error fetching weather data:', error);
        return null;
    }
}

// Add weather data to GeoJSON layers
export function addWeatherToMap(geoJsonResponse, emissionsMap) {
    L.geoJSON(geoJsonResponse, {
        onEachFeature: async function (feature, layer) {
            const { ADMIN: countryName, LAT: lat, LONG: lon } = feature.properties;
            
            if (lat && lon) {
                const weatherData = await fetchWeatherData(lat, lon, currentYear);

                if (weatherData) {
                    const airPollution = weatherData.airPollution.list?.[0]?.components.pm2_5 || 'N/A';
                    const temperature = weatherData.temperature;

                    layer.bindPopup(
                        `<strong>${countryName}</strong><br>` +
                        `Emissions: ${emissionsMap[countryName]?.emissions?.toLocaleString()} MT CO₂<br>` +
                        `Percent of World: ${emissionsMap[countryName]?.percent?.toFixed(2)}%<br>` +
                        `Air Pollution (PM2.5): ${airPollution} µg/m³<br>` +
                        `Temperature (°C): Max: ${temperature.max}, Min: ${temperature.min}, Avg: ${temperature.avg}`
                    );
                }
            }
        },
    }).addTo(map);
}

// Helper functions
function kelvinToCelsius(kelvin) {
    return (kelvin - 273.15).toFixed(2);
}

function getUnixStartOfYear(year) {
    return Math.floor(new Date(`${year}-01-01T00:00:00Z`).getTime() / 1000);
}

function getUnixEndOfYear(year) {
    return Math.floor(new Date(`${year}-12-31T23:59:59Z`).getTime() / 1000);
}

function getUnixMidYear(year) {
    return Math.floor(new Date(`${year}-07-01T12:00:00Z`).getTime() / 1000);
}
