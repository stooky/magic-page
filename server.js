const { createServer } = require('https');
const http = require('http');
const { parse } = require('url');
const next = require('next');
const fs = require('fs');
const path = require('path');
const express = require('express');

// Importing the API routes
const insertVisitor = require('./pages/api/db-insert-visitor');
const updateVisitor = require('./pages/api/db-update-visitor');
const getVisitor = require('./pages/api/db-get-visitor');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const httpsOptions = {
    key: fs.readFileSync('/etc/letsencrypt/live/crkid.com-0001/privkey.pem'),
    cert: fs.readFileSync('/etc/letsencrypt/live/crkid.com-0001/fullchain.pem')
};

app.prepare().then(() => {
    const server = express();

    server.use(express.json()); // To parse JSON bodies

    // Use the API routes
    server.use('/api/insert-visitor', insertVisitor);
    server.use('/api/update-visitor', updateVisitor);
    server.use('/api/get-visitor', getVisitor);

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
