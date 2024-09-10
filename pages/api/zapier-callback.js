let latestResponse = null;

export const getLatestZapierResponse = () => latestResponse;

export const clearLatestZapierResponse = () => {
    latestResponse = null;
};

// Safe JSON parse function
function safeJsonParse(rawBody) {
    try {
        // Try parsing the JSON directly
        return JSON.parse(rawBody);
    } catch (error) {
        console.log('Error parsing JSON:', error.message);

        // Identify problematic quotes and escape them
        let cleanedBody = rawBody.replace(/"([^"]*?)"/g, (match, group) => {
            // Escape only the inner quotes, not those defining JSON keys/values
            if (group.includes('\"')) {
                return match; // already escaped
            }
            return match.replace(/"/g, '\\"');  // Escape double quotes within the string
        });

        // Retry parsing after cleaning up unescaped double quotes
        try {
            return JSON.parse(cleanedBody);
        } catch (retryError) {
            console.log('Failed to parse JSON after cleaning:', retryError.message);
            return null;  // Handle the error or return the cleaned string as a fallback
        }
    }
}

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
            // Use safeJsonParse instead of direct JSON.parse
            body = safeJsonParse(req.body.replace(/(\r\n|\n|\r)/gm, ""));
            if (!body) {
                // If parsing failed even after cleaning
                latestResponse = { status: 'error', message: 'Error parsing body string', rawBody: req.body };
                return res.status(400).json({ message: 'Invalid JSON payload', rawBody: req.body });
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
