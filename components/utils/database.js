const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Could not connect to database', err);
    } else {
        console.log('Connected to database');
    }
});

db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS WebsiteVisitors (
            sessionID TEXT PRIMARY KEY,
            email TEXT,
            website TEXT,
            companyName TEXT,
            myListingUrl TEXT
        )
    `, (err) => {
        if (err) {
            console.error('Could not create table', err);
        } else {
            console.log('Table created or verified');
        }
    });
});

module.exports = db;
