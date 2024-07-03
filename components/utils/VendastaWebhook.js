import axios from 'axios';

export const callVendastaWebhook = async (email, website, companyName) => {
    const webhookUrl = 'http://automations.businessapp.io/start/VMF/7badf74f-283c-48e7-9e81-5fae5935671f';
    
    const payload = {
        email,
        website,
        company: companyName || "BLANK COMPANY"
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
        if (error.response) {
            console.error('Vendasta Webhook response error:', error.response.data);
        } else if (error.request) {
            console.error('Vendasta Webhook no response received:', error.request);
        } else {
            console.error('Vendasta Webhook setup error:', error.message);
        }
        throw error;
    }
};
