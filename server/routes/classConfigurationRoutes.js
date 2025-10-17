const express = require('express');
const {
	createOrUpdateClassConfig,
	getClassConfig,
	getAllClassConfigs,
	deleteClassConfig,
	getCurrentSchoolYear,
} = require('../controllers/classConfigurationController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All routes are protected
router.post('/', protect, createOrUpdateClassConfig);
router.get('/current/year', protect, getCurrentSchoolYear);
router.get('/:schoolYear', protect, getClassConfig);
router.get('/', protect, getAllClassConfigs);
router.delete('/:schoolYear', protect, deleteClassConfig);

module.exports = router;
