import axios from 'axios';
import chalk from 'chalk';

export default async function handler(req, res) {

    console.log(chalk.green('vendasta-automation-proxy.js handler invoked'));

    console.log(chalk.green(`Request received:\nMethod: ${req.method}\nHeaders: ${JSON.stringify(req.headers, null, 2)}\nBody: ${JSON.stringify(req.body, null, 2)}`));

    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { email, website, company, sessionID } = req.body;

    // Determine the webhook URL based on BYPASS_MODE
    let webhookUrl;
    if (process.env.BYPASS_MODE === 'ON') {
        webhookUrl = process.env.BYPASS_WEBHOOK;
        console.log(chalk.yellow('BYPASS_MODE is ON. Using BYPASS_WEBHOOK URL.', webhookUrl));
    } else {
        webhookUrl = process.env.WEBHOOK;
        console.log(chalk.green('BYPASS_MODE is OFF. Using standard WEBHOOK URL.', webhookUrl));
    }

    const payload = {
        email,
        website,
        company: company || "BLANK COMPANY",
        sessionID
    };

    console.log('Forwarding to Vendasta Automation Proxy with the following payload:');
    console.log('Payload:', JSON.stringify(payload, null, 2));

    try {
        const response = await axios.post(webhookUrl, payload, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        console.log('Vendasta Automation Proxy successfully called.');
        console.log('Vendasta Automation Proxy Response:', response.data);
        return res.status(200).json(response.data);
    } catch (error) {
        if (error.response) {
            console.error('Vendasta Automation Proxy response error:', error.response.data);
            return res.status(error.response.status).json(error.response.data);
        } else if (error.request) {
            console.error('Vendasta Automation Proxy no response received:', error.request);
            return res.status(500).json({ message: 'No response received from Vendasta Automation Proxy' });
        } else {
            console.error('Vendasta Automation Proxy setup error:', error.message);
            return res.status(500).json({ message: error.message });
        }
    }
}
