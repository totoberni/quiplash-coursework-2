// server/routes/authRoutes.js

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// **Define Registration Endpoint at /player/register**
router.post('/player/register', authController.registerHTTP);

// **Define Login Endpoint at /player/login**
router.post('/player/login', authController.loginHTTP);

module.exports = router;