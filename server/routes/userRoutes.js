const express = require('express');
const { signup, login, logout, checkAuth, getSettings, updateSettings, updatePassword, getAllUsers } = require('../controllers/userController');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', logout);

// Protected routes
router.get('/me', protect, checkAuth);

// Settings routes
router.get('/settings', protect, getSettings);
router.put('/settings', protect, updateSettings);
router.put('/settings/password', protect, updatePassword);

// Admin only routes
router.get('/users', protect, adminOnly, getAllUsers);

module.exports = router;
