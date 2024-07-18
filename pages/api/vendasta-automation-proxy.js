import axios from 'axios';
import chalk from 'chalk';

export default async function handler(req, res) {

    console.log(chalk.green('vendasta-automation-proxy.js handler invoked'));

    console.log(chalk.green(`Request received:\nMethod: ${req.method}\nHeaders: ${JSON.stringify(req.headers, null, 2)}\nBody: ${JSON.stringify(req.body, null, 2)}`));

    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { email, website, company, sessionID } = req.body;

    // const webhookUrl = 'http://automations.businessapp.io/start/VMF/7badf74f-283c-48e7-9e81-5fae5935671f';
    // BYPASS - const webhookUrl = 'http://automations.businessapp.io/start/VMF/b7d26d34-fd9f-4392-bb26-aef39ed912a9';
    // const webhookUrl = 'http://automations.businessapp.io/start/VUNI/dcbead72-2c5f-45dc-af42-f8fa603df905';
    const webhookUrl = process.env.WEBHOOK;

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
