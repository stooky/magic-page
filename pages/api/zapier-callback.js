export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    // Extract the text data from the request body
    const { largeText } = req.body;

    if (!largeText) {
        return res.status(400).json({ message: 'Missing large text data' });
    }

    try {
        // Process the large text data as needed
        console.log('Received large text data:', largeText);

        // Send a response back to Zapier or to the client-side of your application
        return res.status(200).json({ message: 'Large text data received successfully' });
    } catch (error) {
        console.error('Error processing large text data:', error);
        return res.status(500).json({ message: 'Failed to process large text data' });
    }
}
