const express = require('express');
const {
	createOrUpdateClassConfig,
	getClassConfig,
	getAllClassConfigs,
	deleteClassConfig,
	getCurrentSchoolYear,
} = require('../controllers/classConfigurationController');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

// Public routes (all authenticated users can read)
router.get('/current/year', protect, getCurrentSchoolYear);
router.get('/:schoolYear', protect, getClassConfig);
router.get('/', protect, getAllClassConfigs);

// Admin-only routes (creating, updating, deleting)
router.post('/', protect, adminOnly, createOrUpdateClassConfig);
router.delete('/:schoolYear', protect, adminOnly, deleteClassConfig);

module.exports = router;
