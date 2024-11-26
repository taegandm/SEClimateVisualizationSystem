// testConnection.js
const pool = require('./dbconnect'); // Adjust the path to your dbconnect.js file

(async () => {
    try {
        const client = await pool.connect(); // Try to connect
        console.log('Database connection successful!');
        client.release(); // Release the client back to the pool
    } catch (err) {
        console.error('Database connection failed:', err.message);
    } finally {
        pool.end(); // End the pool
    }
})();
