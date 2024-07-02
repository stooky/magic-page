// /pages/api/webhookListener.js
import getVendastaAccessToken from '../../lib/getVendastaAccessToken';
import axios from 'axios';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { accountID } = req.body;

    if (!accountID) {
        return res.status(400).json({ message: 'Account ID is required' });
    }

    try {
        const accessToken = await getVendastaAccessToken();
        const url = `https://api.vendasta.com/endpoint/${accountID}`; // Replace with actual Vendasta API endpoint
        const apiResponse = await axios.get(url, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        const myListingURL = apiResponse.data.url;
        return res.status(200).json({ myListingURL });
    } catch (error) {
        console.error('Error calling Vendasta API:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}
