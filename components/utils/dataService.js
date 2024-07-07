const db = require('./database');

async function insertData(sessionID, email, website, companyName) {
    return new Promise((resolve, reject) => {
        db.run(
            `INSERT INTO WebsiteVisitors (sessionID, email, website, companyName) VALUES (?, ?, ?, ?)`,
            [sessionID, email, website, companyName],
            function (err) {
                if (err) {
                    return reject(err);
                }
                resolve({ message: 'Data inserted', id: this.lastID });
            }
        );
    });
}

async function updateData(sessionID, myListingUrl) {
    return new Promise((resolve, reject) => {
        db.run(
            `UPDATE WebsiteVisitors SET myListingUrl = ? WHERE sessionID = ?`,
            [myListingUrl, sessionID],
            function (err) {
                if (err) {
                    return reject(err);
                }
                resolve({ message: 'Data updated', changes: this.changes });
            }
        );
    });
}

async function getData(sessionID) {
    return new Promise((resolve, reject) => {
        db.get(
            `SELECT myListingUrl FROM WebsiteVisitors WHERE sessionID = ?`,
            [sessionID],
            (err, row) => {
                if (err) {
                    return reject(err);
                }
                resolve(row ? row.myListingUrl : null);
            }
        );
    });
}

module.exports = {
    insertData,
    updateData,
    getData
};
