const express = require('express');
const { signup, login, logout, checkAuth } = require('../controllers/userController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', logout);

// Protected routes
router.get('/me', protect, checkAuth);

module.exports = router;
