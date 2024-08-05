var express = require('express');
var authController = require('../controllers/auth.js');

const router = express.Router();

// Login route -- POST request
router.post(
    "/register",
    check("userName")
        .not()
        .isEmpty()
        .withMessage("You user name is required")
        .trim()
        .escape(),
    check("password")
        .notEmpty()
        .isLength({ min: 8 })
        .withMessage("Must be at least 8 chars long"),
    Validate,
    authController.Login
);
// Register route -- POST request
router.post(
    "/register",
    check("userName")
        .not()
        .isEmpty()
        .withMessage("You user name is required")
        .trim()
        .escape(),
    check("password")
        .notEmpty()
        .isLength({ min: 8 })
        .withMessage("Must be at least 8 chars long"),
    Validate,
    authController.Register
);

module.exports = router;