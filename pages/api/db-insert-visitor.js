// pages/api/db-insert-visitor.js
const db = require('../../components/utils/database');

module.exports = function handler(req, res) {
    if (req.method === 'POST') {
        const { sessionID, email, website, companyName, myListingUrl } = req.body;

        db.run(`INSERT INTO WebsiteVisitors (sessionID, email, website, companyName, myListingUrl) VALUES (?, ?, ?, ?, ?)`, [sessionID, email, website, companyName, myListingUrl], function(err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.json({ message: 'Data inserted', id: this.lastID });
        });
    } else {
        res.status(405).json({ message: 'Method not allowed' });
    }
};
