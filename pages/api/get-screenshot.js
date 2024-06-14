import fetch from 'node-fetch';

export default async function handler(req, res) {
    const { url } = req.query;

    if (!url) {
        return res.status(400).json({ error: "Website URL is required" });
    }

    const token = process.env.SCREENSHOTAPI_TOKEN; // Make sure to set this environment variable

    try {
        const response = await fetch(`https://shot.screenshotapi.net/screenshot?token=${token}&url=${encodeURIComponent(url)}&output=json&file_type=png`);
        const data = await response.json();

        if (response.ok) {
            return res.status(200).json({ screenshotUrl: data.screenshot });
        } else {
            return res.status(500).json({ error: data.error });
        }
    } catch (error) {
        return res.status(500).json({ error: "Failed to fetch screenshot" });
    }
}
