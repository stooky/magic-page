import axios from 'axios';
import jwt from 'jsonwebtoken';
import chalk from 'chalk';

export default async function handler(req, res) {
    console.log(chalk.blue('vendasta-mylisting-proxy.js handler invoked'));

    // ... (existing code)

    try {
        // ... (JWT generation code)

        console.log(chalk.blue('Calling Vendasta MyListing API.'));
        const vendastaPayload = {
            partnerId: process.env.VENDASTA_PARTNER_ID,
            businessId: process.env.VENDASTA_BUSINESS_ID,
        };

        console.log(chalk.blue('Vendasta MyListing API request payload:'));
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

        console.log(chalk.hex('#FFA500')('Vendasta MyListing API request config:'));
        console.log(chalk.hex('#FFA500')(JSON.stringify(vendastaRequestConfig, null, 2)));

        const vendastaResponse = await axios(vendastaRequestConfig);

        console.log(chalk.blue('Vendasta MyListing API call successful.'));
        console.log(chalk.blue('Vendasta MyListing API response:'));
        console.log(chalk.blue(JSON.stringify(vendastaResponse.data, null, 2)));

        return res.status(200).json(vendastaResponse.data);
    } catch (error) {
        console.error(chalk.blue('Error calling Vendasta MyListing API:'));
        if (error.response) {
            console.error(chalk.blue(error.response.data));
            if (error.response.data.includes('<')) {
                console.error(chalk.blue('Received an HTML response:'));
                console.error(chalk.blue(error.response.data));
            }
        } else {
            console.error(chalk.blue(error.message));
        }
        return res.status(500).json({ message: 'Failed to call Vendasta MyListing API' });
    }
}
