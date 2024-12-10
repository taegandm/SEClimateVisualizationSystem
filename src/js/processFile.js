const fs = require('fs');
const csv = require('csv-parser');

export function extractCSVData(filePath) {
    return new Promise((resolve, reject) => {
        const results = [];

        fs.createReadStream(filePath)
            .pipe(csv()) // Use csv-parser to parse the CSV data
            .on('data', (row) => {
                results.push(row); // Push each row (as an object) to the results array
            })
            .on('end', () => {
                resolve(results); // Resolve the Promise with the results
            })
            .on('error', (error) => {
                reject(error); // Reject the Promise if an error occurs
            });
    });
}

export function extractGeoJsonData(filePath) {
    try {
        // Read the GeoJSON file
        const geoJsonData = fs.readFileSync(filePath, 'utf8');

        // Parse the GeoJSON data
        const geoJson = JSON.parse(geoJsonData);

        // Ensure it's a valid GeoJSON FeatureCollection
        if (geoJson.type !== 'FeatureCollection' || !Array.isArray(geoJson.features)) {
            throw new Error('Invalid GeoJSON format');
        }

        // Extract the features
        const features = geoJson.features.map(feature => ({
            type: feature.type,
            geometry: feature.geometry,
            properties: feature.properties
        }));

        // Return the extracted features
        return features;
    } catch (error) {
        console.error('Error reading or parsing GeoJSON file:', error);
        return null;
    }
}