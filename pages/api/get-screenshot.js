import fetch from 'node-fetch';

export default async function handler(req, res) {
    const { url } = req.query;

    if (!url) {
        console.error("Website URL is required");
        return res.status(400).json({ error: "Website URL is required" });
    }

    const token = process.env.SCREENSHOTAPI_TOKEN;
    
    if (!token) {
        console.error("ScreenshotAPI token is not set");
        return res.status(500).json({ error: "ScreenshotAPI token is not set" });
    }

    console.log("Requesting screenshot for URL:", url);

    try {
        const apiUrl = `https://shot.screenshotapi.net/screenshot?token=${token}&url=${encodeURIComponent(url)}&output=json&file_type=png`;
        console.log("API URL:", apiUrl);

        const response = await fetch(apiUrl);
        const data = await response.json();

        if (response.ok) {
            console.log("Screenshot URL:", data.screenshot);
            return res.status(200).json({ screenshotUrl: data.screenshot });
        } else {
            console.error("Error fetching screenshot:", data.error);
            return res.status(500).json({ error: data.error });
        }
    } catch (error) {
        console.error("Failed to fetch screenshot:", error);
        return res.status(500).json({ error: "Failed to fetch screenshot" });
    }
}
