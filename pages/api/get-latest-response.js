import { getLatestZapierResponse } from './zapier-callback';

export default async function handler(req, res) {
    console.log('get-latest-response API called:');
    console.log('Method:', req.method);

    if (req.method !== 'GET') {
        console.log('Method not allowed:', req.method);
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        console.log('Fetching the latest Zapier response...');
        const response = getLatestZapierResponse();
        
        if (response) {
            console.log('Latest response found:', JSON.stringify(response, null, 2));
        } else {
            console.log('No latest response found.');
        }

        return res.status(200).json({ response });
    } catch (error) {
        console.error('Error getting latest response:', error);
        return res.status(500).json({ message: 'Failed to get latest response' });
    }
}
