// dataService.js
const db = require('./database');  // Import the database module

// Insert data into the database
function insertData(uniqueID, MyListingURL) {
    return new Promise((resolve, reject) => {
        db.run(`INSERT INTO data (uniqueID, MyListingURL) VALUES (?, ?)`, [uniqueID, MyListingURL], function(err) {
            if (err) {
                reject(err);
            } else {
                resolve({ message: 'Data inserted', id: this.lastID });
            }
        });
    });
}

// Retrieve data from the database by uniqueID
function getData(uniqueID) {
    return new Promise((resolve, reject) => {
        db.get(`SELECT MyListingURL FROM data WHERE uniqueID = ?`, [uniqueID], (err, row) => {
            if (err) {
                reject(err);
            } else {
                resolve(row ? row.MyListingURL : null);
            }
        });
    });
}

// Update data in the database by uniqueID
function updateData(uniqueID, MyListingURL) {
    return new Promise((resolve, reject) => {
        db.run(`UPDATE data SET MyListingURL = ? WHERE uniqueID = ?`, [MyListingURL, uniqueID], function(err) {
            if (err) {
                reject(err);
            } else {
                resolve({ message: 'Data updated', changes: this.changes });
            }
        });
    });
}

module.exports = {
    insertData,
    getData,
    updateData
};
