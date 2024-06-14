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
        const encodedUrl = encodeURIComponent(url);
        const apiUrl = `https://shot.screenshotapi.net/screenshot?token=${token}&url=${encodedUrl}&output=image&file_type=png`;
        console.log("API URL:", apiUrl);

        const response = await fetch(apiUrl);
        if (!response.ok) {
            const errorData = await response.json();
            console.error("Error fetching screenshot:", errorData);
            return res.status(500).json({ error: errorData });
        }

        const buffer = await response.buffer();
        const base64Image = buffer.toString('base64');
        const imageUrl = `data:image/png;base64,${base64Image}`;

        console.log("Screenshot URL:", imageUrl);
        return res.status(200).json({ screenshotUrl: imageUrl });
    } catch (error) {
        console.error("Failed to fetch screenshot:", error);
        return res.status(500).json({ error: "Failed to fetch screenshot" });
    }
}
