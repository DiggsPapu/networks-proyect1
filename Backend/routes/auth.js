var express = require('express');
var authController = require('../controllers/auth.js');
const router = express.Router();

// Login route -- POST request
router.post(
    "/login",authController.Login
);
// Register route -- POST request
router.post(
    "/register",  (req, res)=>{
        res.status(200).send("hola")
    }
);

module.exports = router;