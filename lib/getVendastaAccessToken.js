// /lib/getVendastaAccessToken.js
const jwt = require('jsonwebtoken');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Load the service account key file
const keyFilePath = path.join(process.cwd(), 'client-credentials.json');
const keyFile = JSON.parse(fs.readFileSync(keyFilePath, 'utf8'));

async function getVendastaAccessToken() {
    const privateKey = keyFile.private_key;
    const payload = {
        aud: keyFile.assertionPayloadData.aud,
        iss: keyFile.assertionPayloadData.iss,
        sub: keyFile.assertionPayloadData.sub,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + (10 * 60), // 10 minutes
        scope: 'business-app'
    };

    const token = jwt.sign(payload, privateKey, { algorithm: 'RS256', header: { alg: 'RS256', kid: keyFile.private_key_id } });

    const response = await axios.post(keyFile.token_uri, new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: token
    }), {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    });

    return response.data.access_token;
}

module.exports = getVendastaAccessToken;
