const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
	{
		fullName: {
			type: String,
			required: true,
		},
		email: {
			type: String,
			required: true,
			unique: true,
		},
		password: {
			type: String,
			required: true,
			minlength: 6,
		},
		role: {
			type: String,
			enum: ['admin', 'teacher'],
			default: 'teacher',
		},
		assignedClassIndex: {
			type: Number,
			default: null, // null means no class assigned (admin), or index of class in ClassConfiguration.classes array
		},
		phone: {
			type: String,
			default: '',
		},
		preferences: {
			theme: {
				type: String,
				enum: ['light', 'dark', 'auto'],
				default: 'light',
			},
			language: {
				type: String,
				enum: ['en', 'ko'],
				default: 'ko',
			},
		},
		isActive: {
			type: Boolean,
			default: true,
		},
	},
	{ timestamps: true }
);

const User = mongoose.model('User', userSchema);

module.exports = User;
