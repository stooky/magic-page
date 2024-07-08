// pages/api/dbUpdateVisitor.js
const pool = require('../../components/utils/database');

export default async function handler(req, res) {
    if (req.method === 'PUT') {
        const { sessionID, myListingUrl } = req.body;

        try {
            const query = `
                UPDATE WebsiteVisitors SET myListingUrl = $1 WHERE sessionID = $2 RETURNING *;
            `;
            const values = [myListingUrl, sessionID];
            const result = await pool.query(query, values);

            if (result.rows.length > 0) {
                res.status(200).json({ message: 'Data updated', data: result.rows[0] });
            } else {
                res.status(404).json({ message: 'No data found to update' });
            }
        } catch (err) {
            console.error('Error updating data:', err.message);
            res.status(500).json({ error: err.message });
        }
    } else {
        res.status(405).json({ message: 'Method not allowed' });
    }
}
