import chalk from 'chalk';

export default async function handler(req, res) {
    console.log(chalk.blue(`Webhook received:\nMethod: ${req.method}\nHeaders: ${JSON.stringify(req.headers, null, 2)}\nBody: ${JSON.stringify(req.body, null, 2)}`));

    if (req.method !== 'POST') {
        console.log(chalk.blue('Method not allowed.'));
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { accountId } = req.body;

    try {
        // Simulate processing the webhook data
        console.log(chalk.blue(`Processing accountId: ${accountId}`));

        // Simulate retrieving URL from Vendasta API
        const url = `https://example.com/account/${accountId}`;
        console.log(chalk.blue(`Retrieved URL: ${url}`));

        // Send the URL back to the client
        return res.status(200).json({ url });
    } catch (error) {
        console.error(chalk.blue('Error processing webhook:', error.message));
        return res.status(500).json({ message: 'Failed to process webhook' });
    }
}
