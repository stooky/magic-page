const sqlite3 = require('sqlite3').verbose();

// Open the database file or create it if it doesn't exist
const db = new sqlite3.Database('./database.sqlite', (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to the SQLite database.');
    }
});

// Create tables if they don't exist
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS data (
        uniqueID FLOAT PRIMARY KEY,
        MyListingURL TEXT
    )`, (err) => {
        if (err) {
            console.error('Error creating table:', err.message);
        } else {
            console.log('Table created or already exists.');
        }
    });
});

module.exports = db;
