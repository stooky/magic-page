const express = require('express');
const router = express.Router();


router.get('/:sessionID', async (req, res) => {
    const sessionID = req.params.sessionID;
    try {
        const myListingUrl = await dataService.getData(sessionID);
        res.json({ myListingUrl });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
