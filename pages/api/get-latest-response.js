import { getLatestZapierResponse } from './zapier-callback';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const response = getLatestZapierResponse();
        return res.status(200).json({ response });
    } catch (error) {
        console.error('Error getting latest response:', error);
        return res.status(500).json({ message: 'Failed to get latest response' });
    }
}
