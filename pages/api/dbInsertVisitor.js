import axios from 'axios';
import chalk from 'chalk';
const db = require('../../components/utils/database');

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { sessionID, email, website, companyName, myListingUrl } = req.body;

        db.run(`INSERT INTO WebsiteVisitors (sessionID, email, website, companyName, myListingUrl) VALUES (?, ?, ?, ?, ?)`, [sessionID, email, website, companyName, myListingUrl], function(err) {
            if (err) {
                console.error('Error inserting data:', err.message); // Log the error
                return res.status(500).json({ error: err.message });
            }
            res.json({ message: 'Data inserted', id: this.lastID });
        });
    } else {
        res.status(405).json({ message: 'Method not allowed' });
    }
};
