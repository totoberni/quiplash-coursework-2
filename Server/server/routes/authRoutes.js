// server/routes/authRoutes.js

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Registration route
router.post('/register', authController.handleRegisterHTTP);

// Login route
router.post('/login', authController.handleLoginHTTP);

module.exports = router;