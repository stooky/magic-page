const chalk = require('chalk'); // Use require instead of import
const sqlite3 = require('sqlite3').verbose();
const path = require('path');


const dbPath = path.resolve(__dirname, 'database.sqlite');
console.log(chalk.yellow('Database file location:', dbPath)); // Log the database file location


const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.log(chalk.yellow('Could not connect to database', err));
    } else {
        console.log(chalk.yellow('Connected to database'));
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
            console.log(chalk.yellow('Could not create table', err));
        } else {
            console.log(chalk.yellow('Table created or verified'));
        }
    });
});

module.exports = db;
