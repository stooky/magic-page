import axios from 'axios';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { email, website, company } = req.body;

    const webhookUrl = 'http://automations.businessapp.io/start/VMF/7badf74f-283c-48e7-9e81-5fae5935671f';

    const payload = {
        email,
        website,
        company: company || "BLANK COMPANY"
    };

    console.log('Forwarding to Vendasta Webhook with the following payload:');
    console.log('Payload:', JSON.stringify(payload, null, 2));

    try {
        const response = await axios.post(webhookUrl, payload, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        console.log('Vendasta Webhook successfully called.');
        console.log('Vendasta Webhook Response:', response.data);
        return res.status(200).json(response.data);
    } catch (error) {
        if (error.response) {
            console.error('Vendasta Webhook response error:', error.response.data);
            return res.status(error.response.status).json(error.response.data);
        } else if (error.request) {
            console.error('Vendasta Webhook no response received:', error.request);
            return res.status(500).json({ message: 'No response received from Vendasta Webhook' });
        } else {
            console.error('Vendasta Webhook setup error:', error.message);
            return res.status(500).json({ message: error.message });
        }
    }
}
