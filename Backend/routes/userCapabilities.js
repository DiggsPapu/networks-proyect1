var express = require('express');
var userCapabilitiesController = require('../controllers/userCapabilities.js');
const router = express.Router();

// Get Define Presence Message route -- GET request
router.post(
    "/user/defPresenceMessage",  userCapabilitiesController.definePresenceMessage
);

module.exports = router;