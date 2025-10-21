const mongoose = require('mongoose');

const classConfigurationSchema = new mongoose.Schema(
	{
		schoolYear: {
			type: String,
			required: true,
			unique: true,
			match: /^\d{2}_\d{2}$/, // Format: "25_26"
		},
		classes: [
			{
				className: {
					type: String,
					required: true,
				},
				selectionMode: {
					type: String,
					enum: ['grades', 'students'],
					default: 'grades',
				},
				grades: {
					type: [String],
					enum: ['JK', 'SK', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
				},
				students: {
					type: [mongoose.Schema.Types.ObjectId],
					ref: 'Student',
				},
				teachers: {
					type: [mongoose.Schema.Types.ObjectId],
					ref: 'User',
				},
			},
		],
	},
	{ timestamps: true }
);

const ClassConfiguration = mongoose.model('ClassConfiguration', classConfigurationSchema);

module.exports = ClassConfiguration;
