export default async function handler(req, res) {
    console.log('Zapier Callback received:');
    console.log('Method:', req.method);
    console.log('Headers:', JSON.stringify(req.headers, null, 2));
    console.log('Body:', JSON.stringify(req.body, null, 2));

    if (req.method !== 'POST') {
        console.log('Method not allowed:', req.method);
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { status, message } = req.body;

    console.log('Extracted status:', status);
    console.log('Extracted message:', message);

    // Process the callback data as needed
    return res.status(200).json({ status, message });
}
