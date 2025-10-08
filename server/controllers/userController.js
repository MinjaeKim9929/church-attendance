const generateToken = require('../lib/utils');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

// Signup a new user
const signup = async (req, res) => {
	const { firstName, lastName, email, password } = req.body;
};
