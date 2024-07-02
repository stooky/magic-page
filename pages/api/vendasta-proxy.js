import axios from 'axios';
import jwt from 'jsonwebtoken';
import chalk from 'chalk';

export default async function handler(req, res) {
    console.log(chalk.blue('vendasta-proxy.js handler invoked')); // Log at the top

    console.log(chalk.blue(`Request received:\nMethod: ${req.method}\nHeaders: ${JSON.stringify(req.headers, null, 2)}\nBody: ${JSON.stringify(req.body, null, 2)}`));

    if (req.method !== 'POST') {
        console.log(chalk.blue('Method not allowed.'));
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { email, website, company } = req.body;

    try {
        console.log(chalk.blue('Generating JWT for client assertion.'));
        const privateKey = process.env.VENDASTA_PRIVATE_KEY.replace(/\\n/g, '\n');
        const token = jwt.sign(
            {
                iss: process.env.VENDASTA_CLIENT_EMAIL,
                sub: process.env.VENDASTA_CLIENT_EMAIL,
                aud: process.env.VENDASTA_ASSERTION_AUD,
                exp: Math.floor(Date.now() / 1000) + 600,
                iat: Math.floor(Date.now() / 1000),
            },
            privateKey,
            {
                algorithm: 'RS256',
                header: {
                    kid: process.env.VENDASTA_PRIVATE_KEY_ID,
                },
            }
        );

        console.log(chalk.blue('JWT generated successfully.'));
        console.log(chalk.blue('Exchanging JWT for access token.'));
        const response = await axios.post(process.env.VENDASTA_TOKEN_URI, null, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            params: {
                grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
                assertion: token,
            },
        });

        const accessToken = response.data.access_token;
        console.log(chalk.blue('Access token received:', accessToken));

        console.log(chalk.blue('Calling Vendasta API.'));
        const vendastaResponse = await axios.post('http://automations.businessapp.io/start/VMF/7badf74f-283c-48e7-9e81-5fae5935671f', {
            email,
            website,
            company,
        }, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
        });

        console.log(chalk.blue('Vendasta API call successful.'));
        console.log(chalk.blue('Vendasta API response:', vendastaResponse.data));
        return res.status(200).json(vendastaResponse.data);
    } catch (error) {
        console.error(chalk.blue('Error calling Vendasta API:', error.response ? error.response.data : error.message));
        return res.status(500).json({ message: 'Failed to call Vendasta API' });
    }
}
