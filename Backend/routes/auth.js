var express = require('express');
var authController = require('../controllers/auth.js');
const router = express.Router();

// Login route -- POST request
router.post(
    "/auth/login",authController.Login
);
// Register route -- POST request
router.post(
    "/auth/register",  authController.Register
);
// Register route -- POST request
router.get(
    "/auth/deleteAccount",  authController.DeleteAccount
);
// Logout route -- GET request
router.get(
    "/auth/logout",  authController.Loggout
);

module.exports = router;