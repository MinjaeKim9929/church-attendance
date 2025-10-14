const mongoose = require('mongoose');

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
			enum: ['JK-Gr1', 'Gr2-4', 'Gr5-6', 'Gr7-8', 'HighSchool'],
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

const Attendance = mongoose.model('Attendance', attendanceSchema);

module.exports = Attendance;
