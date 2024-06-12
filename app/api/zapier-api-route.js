import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { email, website } = req.body;

    const webhookUrl = 'https://hooks.zapier.com/hooks/catch/15076287/3vv4bs9/'; // Replace with your Zapier webhook URL

    
    try {
        const response = await axios.post(webhookUrl, { email, website }, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        return res.status(200).json(response.data);
    } catch (error) {
        console.error('Error calling Zapier webhook:', error.response ? error.response.data : error.message);
        return res.status(500).json({ message: 'Failed to call Zapier webhook' });
    }
}
