const mysql = require('mysql2');

// Create a connection pool
const pool = mysql.createPool({
  host: 'localhost',      // MySQL server hostname
  user: 'root',           // MySQL username
  password: 'Incorrect03!', // MySQL password
  database: 'client_info', // Database name
  waitForConnections: true,
  connectionLimit: 10,    // Maximum number of connections
  queueLimit: 0,
});

// Export the pool for use in other files
module.exports = pool.promise();
