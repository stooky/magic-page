import axios from 'axios';

export default async function handler(req, res) {
    console.log('Request received:');
    console.log('Method:', req.method);
    console.log('Headers:', JSON.stringify(req.headers, null, 2));
    console.log('Body:', JSON.stringify(req.body, null, 2));

    if (req.method !== 'POST') {
        console.log('Method not allowed:', req.method);
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { email, website, webhookListener } = req.body;

    console.log('Extracted email:', email);
    console.log('Extracted website:', website);
    console.log('Extracted webhookListener:', webhookListener);

    const webhookUrl = `${process.env.NEXT_PUBLIC_ZAP_URL}`; // Replace with your Zapier webhook URL

    try {
        const response = await axios.post(webhookUrl, { email, website, webhookListener }, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        console.log('Zapier webhook response status:', response.status);
        console.log('Zapier webhook response headers:', JSON.stringify(response.headers, null, 2));
        console.log('Zapier webhook response data:', JSON.stringify(response.data, null, 2));

        return res.status(200).json(response.data);
    } catch (error) {
        if (error.response) {
            console.error('Error response data:', JSON.stringify(error.response.data, null, 2));
            console.error('Error response status:', error.response.status);
            console.error('Error response headers:', JSON.stringify(error.response.headers, null, 2));
        } else if (error.request) {
            console.error('Error request:', JSON.stringify(error.request, null, 2));
        } else {
            console.error('Error message:', error.message);
        }
        console.error('Error config:', JSON.stringify(error.config, null, 2));

        return res.status(500).json({ message: 'Failed to call Zapier webhook' });
    }
}
