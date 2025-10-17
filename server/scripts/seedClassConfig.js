const mongoose = require('mongoose');
const dotenv = require('dotenv');
const ClassConfiguration = require('../models/ClassConfiguration');
const { getSchoolYearFromDate } = require('../lib/utils');

dotenv.config();

const seedClassConfiguration = async () => {
	try {
		// Connect to MongoDB
		await mongoose.connect(process.env.MONGO_URL);
		console.log('MongoDB connected...');

		// Get current school year
		const currentYear = getSchoolYearFromDate();
		console.log(`Setting up class configuration for school year: ${currentYear}`);

		// Define class configuration matching frontend structure
		const classConfig = {
			schoolYear: currentYear,
			classes: [
				{
					className: '유치부',
					grades: ['JK', 'SK', '1'],
				},
				{
					className: '2-4학년',
					grades: ['2', '3', '4'],
				},
				{
					className: '5-6학년',
					grades: ['5', '6'],
				},
				{
					className: '7-8학년',
					grades: ['7', '8'],
				},
				{
					className: '고등부',
					grades: ['9', '10', '11', '12'],
				},
			],
		};

		// Check if configuration already exists
		const existingConfig = await ClassConfiguration.findOne({ schoolYear: currentYear });

		if (existingConfig) {
			console.log('Class configuration already exists. Updating...');
			existingConfig.classes = classConfig.classes;
			await existingConfig.save();
			console.log('Class configuration updated successfully!');
		} else {
			console.log('Creating new class configuration...');
			await ClassConfiguration.create(classConfig);
			console.log('Class configuration created successfully!');
		}

		console.log('\nClass Configuration:');
		console.log(JSON.stringify(classConfig, null, 2));

		process.exit(0);
	} catch (error) {
		console.error('Error seeding class configuration:', error);
		process.exit(1);
	}
};

seedClassConfiguration();
