import axios from 'axios';
import chalk from 'chalk';

export default async function handler(req, res) {
    console.log(chalk.blue('webhookListener.js handler invoked')); // Log at the top

    console.log(chalk.blue(`Request received:\nMethod: ${req.method}\nHeaders: ${JSON.stringify(req.headers, null, 2)}\nBody: ${JSON.stringify(req.body, null, 2)}`));

    if (req.method !== 'POST') {
        console.log(chalk.blue('Method not allowed.'));
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { accountID } = req.body;

    if (!accountID) {
        console.log(chalk.blue('No accountID provided in the request.'));
        return res.status(400).json({ message: 'AccountID is required' });
    }

    try {
        console.log(chalk.blue('Fetching account details from Vendasta API.'));

        const response = await axios.get(`https://api.vendasta.com/account/${accountID}`, {
            headers: {
                Authorization: `Bearer ${process.env.VENDASTA_API_TOKEN}`, // Make sure to set this environment variable
            },
        });

        const accountData = response.data;
        console.log(chalk.blue('Account data received from Vendasta API:', accountData));

        const myListingUrl = accountData.myListingUrl;
        if (!myListingUrl) {
            console.log(chalk.blue('No myListingUrl found in the account data.'));
            return res.status(404).json({ message: 'No myListingUrl found for the given accountID' });
        }

        console.log(chalk.blue('Sending myListingUrl to the client.'));
        return res.status(200).json({ myListingUrl });
    } catch (error) {
        console.error(chalk.blue('Error fetching account details from Vendasta API:', error.response ? error.response.data : error.message));
        return res.status(500).json({ message: 'Failed to fetch account details from Vendasta API' });
    }
}
