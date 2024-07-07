const express = require('express');
const router = express.Router();


router.post('/', async (req, res) => {
    const { sessionID, myListingUrl } = req.body;
    try {
        const result = await dataService.updateData(sessionID, myListingUrl);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
