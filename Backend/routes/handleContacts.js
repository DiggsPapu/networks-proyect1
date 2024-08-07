var express = require('express');
var handleContactsController = require('../controllers/handleContacts.js');
const router = express.Router();

// Get Contacts route -- GET request
router.get(
    "/handleContacts/getContacts",  handleContactsController.getContacts
);
// Add Contact route -- POST request
router.post(
    "/handleContacts/addContact",  handleContactsController.addContact
);

module.exports = router;