const mongoose = require('mongoose');

// Factory function to get Attendance model for a specific school year
// This creates dynamic collections like: attendances_25_26, attendances_26_27, etc.
const getAttendanceModel = (schoolYear) => {
	const collectionName = `attendances_${schoolYear}`;

	// Check if model already exists to avoid OverwriteModelError
	if (mongoose.models[collectionName]) {
		return mongoose.models[collectionName];
	}

	const attendanceSchema = new mongoose.Schema(
		{
			studentId: {
				type: mongoose.Schema.Types.ObjectId,
				ref: 'Student',
				required: true,
			},
			date: {
				type: Date,
				required: true,
			},
			class: {
				type: String,
				required: true,
				// No enum since classes are dynamic per year
			},
			status: {
				type: String,
				required: true,
				enum: ['Present', 'Absent'],
			},
			recordedBy: {
				type: mongoose.Schema.Types.ObjectId,
				ref: 'User',
				required: true,
			},
		},
		{ timestamps: true }
	);

	// Create compound index to ensure one attendance record per student per date
	attendanceSchema.index({ studentId: 1, date: 1 }, { unique: true });

	// Create model with dynamic collection name
	return mongoose.model(collectionName, attendanceSchema, collectionName);
};

module.exports = getAttendanceModel;
