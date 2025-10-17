const ClassConfiguration = require('../models/ClassConfiguration');
const { getSchoolYearFromDate } = require('../lib/utils');

// @desc    Create or update class configuration for a school year
// @route   POST /api/class-config
// @access  Protected
const createOrUpdateClassConfig = async (req, res) => {
	try {
		const { schoolYear, classes } = req.body;

		// Use provided schoolYear or auto-calculate from current date
		const year = schoolYear || getSchoolYearFromDate();

		// Validation
		if (!classes || !Array.isArray(classes) || classes.length === 0) {
			return res.status(400).json({ message: 'Please provide classes array' });
		}

		// Validate each class
		for (const classInfo of classes) {
			if (!classInfo.className || !classInfo.grades || !Array.isArray(classInfo.grades)) {
				return res.status(400).json({ message: 'Each class must have className and grades array' });
			}
		}

		// Check if configuration exists for this year
		const existingConfig = await ClassConfiguration.findOne({ schoolYear: year });

		if (existingConfig) {
			// Update existing configuration
			existingConfig.classes = classes;
			const updatedConfig = await existingConfig.save();
			return res.status(200).json(updatedConfig);
		} else {
			// Create new configuration
			const newConfig = await ClassConfiguration.create({
				schoolYear: year,
				classes,
			});
			return res.status(201).json(newConfig);
		}
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
};

// @desc    Get class configuration for a school year
// @route   GET /api/class-config/:schoolYear
// @access  Protected
const getClassConfig = async (req, res) => {
	try {
		const { schoolYear } = req.params;

		// Use provided schoolYear or auto-calculate from current date
		const year = schoolYear === 'current' ? getSchoolYearFromDate() : schoolYear;

		const config = await ClassConfiguration.findOne({ schoolYear: year });

		if (!config) {
			return res.status(404).json({ message: `No class configuration found for school year ${year}` });
		}

		res.status(200).json(config);
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
};

// @desc    Get all class configurations
// @route   GET /api/class-config
// @access  Protected
const getAllClassConfigs = async (req, res) => {
	try {
		const configs = await ClassConfiguration.find().sort({ schoolYear: -1 });
		res.status(200).json(configs);
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
};

// @desc    Delete class configuration for a school year
// @route   DELETE /api/class-config/:schoolYear
// @access  Protected
const deleteClassConfig = async (req, res) => {
	try {
		const { schoolYear } = req.params;

		const config = await ClassConfiguration.findOne({ schoolYear });

		if (!config) {
			return res.status(404).json({ message: `No class configuration found for school year ${schoolYear}` });
		}

		await ClassConfiguration.findByIdAndDelete(config._id);

		res.status(200).json({ message: `Class configuration for ${schoolYear} deleted successfully` });
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
};

// @desc    Get current school year
// @route   GET /api/class-config/current/year
// @access  Protected
const getCurrentSchoolYear = async (req, res) => {
	try {
		const currentYear = getSchoolYearFromDate();
		res.status(200).json({ schoolYear: currentYear });
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
};

module.exports = {
	createOrUpdateClassConfig,
	getClassConfig,
	getAllClassConfigs,
	deleteClassConfig,
	getCurrentSchoolYear,
};
