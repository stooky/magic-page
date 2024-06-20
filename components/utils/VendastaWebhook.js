import axios from 'axios';

export const callVendastaWebhook = async (email, website) => {
    const webhookUrl = 'http://automations.businessapp.io/start/VMF/7badf74f-283c-48e7-9e81-5fae5935671f';

    const payload = {
        email,
        website
    };

    console.log('Calling Vendasta Webhook with the following payload:');
    console.log('Payload:', JSON.stringify(payload, null, 2));

    try {
        const response = await axios.post(webhookUrl, payload, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        console.log('Vendasta Webhook successfully called.');
        console.log('Vendasta Webhook Response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error calling Vendasta webhook:', error);
        throw error;
    }
};
