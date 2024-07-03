import { clearLatestZapierResponse } from './zapier-callback';

export default async function handler(req, res) {
    console.log('clear-response API called:');
    console.log('Method:', req.method);

    if (req.method !== 'POST') {
        console.log('Method not allowed:', req.method);
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        clearLatestZapierResponse();
        return res.status(200).json({ message: 'Response cleared' });
    } catch (error) {
        console.error('Error clearing response:', error);
        return res.status(500).json({ message: 'Failed to clear response' });
    }
}
