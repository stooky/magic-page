// pages/api/dbGetVisitor.js
const pool = require('../../components/utils/database');

export default async function handler(req, res) {
    if (req.method === 'GET') {
        const { sessionID } = req.query;

        try {
            const query = `
                SELECT * FROM WebsiteVisitors WHERE sessionID = $1;
            `;
            const values = [sessionID];
            const result = await pool.query(query, values);

            if (result.rows.length > 0) {
                res.status(200).json({ data: result.rows[0] });
            } else {
                res.status(404).json({ message: 'No data found' });
            }
        } catch (err) {
            console.error('Error retrieving data:', err.message);
            res.status(500).json({ error: err.message });
        }
    } else {
        res.status(405).json({ message: 'Method not allowed' });
    }
}
