// dbconnect.js
const { Pool } = require('pg');

// Define connection configuration
const pool = new Pool({
    user: 'postgres',      // Your PostgreSQL username
    host: 'localhost',          // Your database server
    database: 'gradproject',  // Your database name
    password: '4TaeMaish!',  // Your PostgreSQL password
    port: 5432                  // Default PostgreSQL port
});

// Export the pool object for reuse in other files
module.exports = pool;
