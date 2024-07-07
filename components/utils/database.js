// db.js
const { Pool } = require('pg');

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

module.exports = pool;

// Example route to test the database connection
const dbTestRouter = express.Router();
dbTestRouter.get('/db-test', async (req, res) => {
    try {
        const client = await pool.connect();
        const result = await client.query('SELECT NOW()');
        res.json(result.rows);
        client.release();
    } catch (err) {
        console.error(err);
        res.status(500).send('Error connecting to the database');
    }
});