var express = require('express');
var userCapabilitiesController = require('../controllers/userCapabilities.js');
const router = express.Router();

// Get Define Presence Message route -- GET request
router.post(
    "/user/defPresenceMessage",  userCapabilitiesController.definePresenceMessage
);
router.post(
    "/user/sendMessage",  userCapabilitiesController.sendMessage
);
router.post(
    "/user/sendImage",  userCapabilitiesController.sendImage
);

module.exports = router;