// pages/api/dbInsertVisitor.js
const pool = require('../../components/utils/database');

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { sessionID, email, website, companyName, myListingUrl, screenshotUrl } = req.body;

        try {
            const query = `
                INSERT INTO WebsiteVisitors (sessionID, email, website, companyName, myListingUrl, screenshotUrl)
                VALUES ($1, $2, $3, $4, $5, $6) RETURNING *;
            `;
            const values = [sessionID, email, website, companyName, myListingUrl, screenshotUrl];
            const result = await pool.query(query, values);

            res.status(200).json({ message: 'Data inserted', data: result.rows[0] });
        } catch (err) {
            console.error('Error inserting data:', err.message);
            res.status(500).json({ error: err.message });
        }
    } else {
        res.status(405).json({ message: 'Method not allowed' });
    }
}
