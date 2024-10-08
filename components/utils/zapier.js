import axios from 'axios';

export const callZapierWebhook = async (email, website, webhookListener) => {
    const apiUrl = '/api/zapier-proxy'; // Your API route

    const payload = {
        email,
        website,
        webhookListener
    };

    console.log('Calling Zapier Webhook with the following details:');
    console.log('Email:', email);
    console.log('Website:', website);
    console.log('Payload:', JSON.stringify(payload, null, 2));

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
