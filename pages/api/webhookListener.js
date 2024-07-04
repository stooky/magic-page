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

    const { accountID } = req.body;
    console.log(chalk.blue('Returned accountID.', accountID));

    if (!accountID) {
        console.log(chalk.blue('No accountID provided in the request.'));
        return res.status(400).json({ message: 'AccountID is required' });
    }

    try {
        // Set the cookie for accountID
        res.setHeader('Set-Cookie', cookie.serialize('AGID', accountID, {
            httpOnly: true,
            secure: process.env.NODE_ENV !== 'development',
            maxAge: 60 * 60,
            sameSite: 'strict',
            path: '/'
        }));

        console.log(chalk.red('Webhook accountID.', accountID));
        return res.status(200).json({ accountID });
    } catch (error) {
        console.error(chalk.red('Error with the accountID:'));
        return res.status(500).json({ message: 'Failed to understand the accountID' });
    }
}
