import axios from 'axios';
import jwt from 'jsonwebtoken';
import chalk from 'chalk';

export default async function handler(req, res) {
    console.log(chalk.blue('vendasta-mylisting-proxy.js handler invoked'));

    console.log(chalk.blue(`Request received:\nMethod: ${req.method}\nHeaders: ${JSON.stringify(req.headers, null, 2)}\nBody: ${JSON.stringify(req.body, null, 2)}`));

    //await new Promise(resolve => setTimeout(resolve, 40000));
    
    if (req.method !== 'POST') {
        console.log(chalk.blue('Method not allowed.'));
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { partnerId, businessId } = req.body;
    // const FAKEbusinessId = "AG-LCJDC5MZC6";
    console.log(chalk.green('partnerId: ', partnerId));
    console.log(chalk.green('businessId: ', businessId));

    try {
        console.log(chalk.blue('Generating JWT for client assertion.'));
        const privateKey = process.env.VENDASTA_PRIVATE_KEY.replace(/\\n/g, '\n');
        
        const jwtPayload = {
            iss: process.env.VENDASTA_CLIENT_EMAIL,
            sub: process.env.VENDASTA_CLIENT_EMAIL,
            aud: process.env.VENDASTA_ASSERTION_AUD,
            exp: Math.floor(Date.now() / 1000) + 600,
            iat: Math.floor(Date.now() / 1000),
            scope: 'business-app', // Ensure the scope is included here
        };

        const token = jwt.sign(jwtPayload, privateKey, {
            algorithm: 'RS256',
            header: {
                kid: process.env.VENDASTA_PRIVATE_KEY_ID,
            },
        });

        console.log(chalk.blue('JWT generated successfully.'));
        console.log(chalk.blue('JWT Payload:'));
        console.log(chalk.blue(JSON.stringify(jwtPayload, null, 2)));
        
        console.log(chalk.blue('Exchanging JWT for access token.'));
        const response = await axios.post(process.env.VENDASTA_TOKEN_URI, new URLSearchParams({
            grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
            assertion: token,
        }), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });

        const accessToken = response.data.access_token;
        console.log(chalk.blue('Access token received:'));
        console.log(chalk.blue(accessToken));

        console.log(chalk.blue('Calling Vendasta API.'));
        const vendastaPayload = {
            partnerId: partnerId,
            businessId: businessId,
        };

        console.log(chalk.blue('Vendasta API request payload:'));
        console.log(chalk.blue(JSON.stringify(vendastaPayload, null, 2)));

        const vendastaRequestConfig = {
            method: 'post',
            url: `https://listing-products-api-${process.env.ENV}.vendasta-internal.com/listing_products.v1.PartnerSettingsService/GetConfiguration`,
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            data: vendastaPayload,
        };

        console.log(chalk.hex('#FFA500')('Vendasta API request config:'));
        console.log(chalk.hex('#FFA500')(JSON.stringify(vendastaRequestConfig, null, 2)));

        const vendastaResponse = await axios(vendastaRequestConfig);

        console.log(chalk.blue('Vendasta API call successful.'));
        console.log(chalk.blue('Vendasta API response:'));
        console.log(chalk.blue(JSON.stringify(vendastaResponse.data, null, 2)));
        const publicMyListingUrl = String(vendastaResponse.data.configuration.publicMyListingUrl);
        console.log(chalk.green('iframe URL:', publicMyListingUrl));

        sessionStorage.setItem('myListingUrl', publicMyListingUrl)

        return res.status(200).json(vendastaResponse.data);
    } catch (error) {
        console.error(chalk.blue('Error calling Vendasta API:'));
        if (error.response) {
            console.error(chalk.blue(JSON.stringify(error.response.data, null, 2)));
        } else {
            console.error(chalk.blue(error.message));
        }
        return res.status(500).json({ message: 'Failed to call Vendasta API' });
    }
}
