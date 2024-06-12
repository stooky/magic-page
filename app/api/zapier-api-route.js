// app/api/zapier-api-route.js
import axios from 'axios';

export default async function handler(req, res) {
    console.log('API route hit'); // Log to check if route is hit
    if (req.method !== 'POST') {
        console.log('Invalid method');
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { email, website } = req.body;
    console.log('Request body:', req.body); // Log the request body

    const webhookUrl = 'https://hooks.zapier.com/hooks/catch/15076287/3vv4bs9/'; // Replace with your Zapier webhook URL

    try {
        const response = await axios.post(webhookUrl, { email, website }, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        console.log('Webhook response:', response.data); // Log the webhook response
        return res.status(200).json(response.data);
    } catch (error) {
        console.error('Error calling Zapier webhook:', error.response ? error.response.data : error.message);
        return res.status(500).json({ message: 'Failed to call Zapier webhook' });
    }
}
