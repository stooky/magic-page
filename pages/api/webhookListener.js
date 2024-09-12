import axios from 'axios';
import chalk from 'chalk';
import cookie from 'cookie';


export default async function handler(req, res) {
    console.log(chalk.blue('webhookListener.js handler invoked')); // Log at the top

    console.log(chalk.blue(`Request received:\nMethod: ${req.method}\nHeaders: ${JSON.stringify(req.headers, null, 2)}\nBody: ${JSON.stringify(req.body, null, 2)}`));

    if (req.method !== 'POST') {
        console.log(chalk.blue('Method not allowed.'));
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { businessId, sessionId } = req.body;
    const partnerId = process.env.VENDASTA_PARTNER_ID;

    console.log(chalk.blue('Returned businessId.', businessId));

    if (!businessId) {
        console.log(chalk.blue('No businessId provided in the request.'));
        return res.status(400).json({ message: 'businessId is required' });
    }


    console.log(chalk.red('Calling Vendasta MyListing API'));
    console.log(chalk.green('businessId :', businessId));
    console.log(chalk.green('partnerId :', partnerId));
    console.log(chalk.green('sessionId :', sessionId));
    const vendastaResponse = await fetch(`https://${process.env.DOMAIN}/api/vendasta-mylisting-proxy`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ partnerId, businessId, sessionId })
    });
    
    const vendastaData = await vendastaResponse.json();
    console.log('Vendasta MyListingAPI Response:', vendastaData);
    
    
    try {
        console.log(chalk.red('WebhookListener from Vendasta businessId.', businessId));
        return res.status(200).json({ businessId });
    } catch (error) {
        console.error(chalk.red('Error with the businessId:'));
        return res.status(500).json({ message: 'Failed to understand the businessId' });
    }
}
