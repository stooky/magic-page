import axios from 'axios';

export const callZapierWebhook = async (email, website) => {
    const webhookUrl = 'https://hooks.zapier.com/hooks/catch/15076287/3vv4bs9/'; // Replace with your Zapier webhook URL

    const payload = {
        email,
        website
    };

    console.log('Calling Zapier Webhook with the following details:');
    console.log('Email:', email);
    console.log('Website:', website);

    try {
        const response = await axios.post(webhookUrl, payload, {
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
