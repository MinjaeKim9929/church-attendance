const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema(
	{
		fullName: {
			type: String,
			required: true,
		},
		grade: {
			type: String,
			required: true,
			enum: ['JK', 'SK', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
		},
		gender: {
			type: String,
			required: true,
			enum: ['남자', '여자', 'Male', 'Female'],
		},
	},
	{ timestamps: true }
);

const Student = mongoose.model('Student', studentSchema);

module.exports = Student;