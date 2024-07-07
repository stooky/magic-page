// api/db-insert-visitor.js

const express = require('express');
const db = require('../../components/utils/database');

const handler = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { sessionID, email, website, companyName } = req.body;

    try {
        db.run(`INSERT INTO WebsiteVisitors (sessionID, email, website, companyName, myListingUrl) VALUES (?, ?, ?, ?, ?)`, 
               [sessionID, email, website, companyName, 'EMPTY'], 
               function(err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.json({ message: 'Data inserted', id: this.lastID });
        });
    } catch (error) {
        res.status(500).json({ error: 'Database insertion failed' });
    }
};

module.exports = handler;
