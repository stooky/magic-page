let latestResponse = null;

export const getLatestZapierResponse = () => latestResponse;

export const clearLatestZapierResponse = () => {
    latestResponse = null;
};

export default async function handler(req, res) {
    console.log('Zapier Callback received:');
    console.log('Method:', req.method);
    console.log('Headers:', JSON.stringify(req.headers, null, 2));
    console.log('Body:', req.body);

    if (req.method !== 'POST') {
        console.log('Method not allowed:', req.method);
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        // Ensure the body is parsed correctly
        let body;
        if (typeof req.body === 'string') {
            try {
                body = JSON.parse(req.body.replace(/(\r\n|\n|\r)/gm, ""));
            } catch (error) {
                console.error('Error parsing body string:', error);
                latestResponse = { status: 'error', message: `Error parsing body string: ${error.message}`, rawBody: req.body };
                throw error;
            }
        } else {
            body = req.body;
        }
        
        const { status, message } = body;

        console.log('Extracted status:', status);
        console.log('Extracted message:', message);

        if (!status || !message) {
            throw new Error('Status or message is missing in the body');
        }

        // Save the latest response
        latestResponse = { status, message };

        return res.status(200).json({ status, message });
    } catch (error) {
        console.error('Error parsing body or saving response:', error);
        return res.status(400).json({ message: 'Invalid JSON payload' });
    }
}
