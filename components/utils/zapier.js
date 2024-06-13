import axios from 'axios';

export const callZapierWebhook = async (email, website) => {
    const apiUrl = '/api/zapier-proxy'; // Your API route

    const payload = {
        email,
        website
    };

    console.log('Calling Zapier Webhook with the following details:');
    console.log('Email:', email);
    console.log('Website:', website);

    try {
        const response = await axios.post(apiUrl, payload, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        console.log('Zapier Webhook Response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error calling Zapier webhook:', error);
        throw error;
    }
};
