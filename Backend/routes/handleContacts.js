var express = require('express');
var handleContactsController = require('../controllers/handleContacts.js');
const router = express.Router();

// Get Contacts route -- GET request
router.get(
    "/handleContacts/getContacts",  handleContactsController.getContacts
);

module.exports = router;