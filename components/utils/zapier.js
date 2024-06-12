// utils/zapier.js
export const callZapierWebhook = async (email, website) => {
    const apiUrl = '../../app/api/zapier-api-route'; // Your API route

    const payload = {
        email: email,
        website: website
    };

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error calling Zapier webhook:', error);
        throw error;
    }
};
