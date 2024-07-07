const { createServer } = require('https');
const http = require('http');
const { parse } = require('url');
const next = require('next');
const fs = require('fs');
const path = require('path');
const express = require('express');
const { Pool } = require('pg'); // Import the Pool class from pg

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

// PostgreSQL connection configuration using environment variables
const pool = new Pool({
    user: process.env.DB_USER,
    host: 'localhost',
    database: process.env.DB,
    password: process.env.DB_PASSWORD,
    port: 5432, // Default PostgreSQL port
});

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

const httpsOptions = {
    key: fs.readFileSync('/etc/letsencrypt/live/crkid.com-0001/privkey.pem'),
    cert: fs.readFileSync('/etc/letsencrypt/live/crkid.com-0001/fullchain.pem')
};

app.prepare().then(() => {
    const server = express();

    server.use(express.json()); // To parse JSON bodies
        
    // Use the dbTestRouter for testing
    server.use('/api', dbTestRouter);

    // Handle requests with Next.js
    server.get('*', (req, res) => {
        const parsedUrl = parse(req.url, true);
        handle(req, res, parsedUrl);
    });

    createServer(httpsOptions, (req, res) => {
        const parsedUrl = parse(req.url, true);
        handle(req, res, parsedUrl);
    }).listen(443, err => {
        if (err) throw err;
        console.log('> Ready on https://crkid.com:443');
    });

    // Create HTTP server and redirect all requests to HTTPS
    http.createServer((req, res) => {
        res.writeHead(301, { "Location": "https://" + req.headers['host'] + req.url });
        res.end();
    }).listen(80, () => {
        console.log('HTTP server running on port 80 and redirecting to HTTPS');
    });
});
