const mysql = require('mysql2/promise');

// Configure the database connection using promise-based API
const db = mysql.createPool({
    host: 'localhost',
    user: 'fashion_hub_app',
    password: 'fashionyuiop',
    database: 'fashion_hub',
});

module.exports = db;
