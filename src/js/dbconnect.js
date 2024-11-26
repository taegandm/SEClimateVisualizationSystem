// dbconnect.js
const { Pool } = require('pg');

// Define connection configuration
const pool = new Pool({
    user: 'your_username',      // Your PostgreSQL username
    host: 'localhost',          // Your database server
    database: 'your_database',  // Your database name
    password: 'your_password',  // Your PostgreSQL password
    port: 5432                  // Default PostgreSQL port
});

// Export the pool object for reuse in other files
module.exports = pool;
