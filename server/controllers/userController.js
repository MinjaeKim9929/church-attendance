const generateToken = require('../lib/utils');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

// Signup a new user
const signup = async (req, res) => {
	const { fullName, email, password } = req.body;

	try {
		// Validate input
		if (!fullName || !email || !password) {
			return res.status(400).json({ message: 'All fields are required' });
		}

		// Validate email format
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email)) {
			return res.status(400).json({ message: 'Invalid email format' });
		}

		// Validate password length
		if (password.length < 8) {
			return res.status(400).json({ message: 'Password must be at least 8 characters long' });
		}

		// Check if user already exists
		const existingUser = await User.findOne({ email });
		if (existingUser) {
			return res.status(400).json({ message: 'Email already registered' });
		}

		// Hash password
		const salt = await bcrypt.genSalt(12);
		const hashedPassword = await bcrypt.hash(password, salt);

		// Create new user
		const newUser = new User({
			fullName,
			email,
			password: hashedPassword,
		});

		await newUser.save();

		// Generate token
		const token = generateToken(newUser._id, res);

		// Send response (don't send password back)
		res.status(201).json({
			_id: newUser._id,
			fullName: newUser.fullName,
			email: newUser.email,
			token,
		});
	} catch (error) {
		console.error('Error in signup controller:', error.message);
		res.status(500).json({ message: 'Internal server error' });
	}
};

// Login user
const login = async (req, res) => {
	const { email, password, rememberMe } = req.body;

	try {
		// Validate input
		if (!email || !password) {
			return res.status(400).json({ message: 'All fields are required' });
		}

		// Validate email format
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email)) {
			return res.status(400).json({ message: 'Invalid email format' });
		}

		// Find user by email
		const user = await User.findOne({ email });
		if (!user) {
			return res.status(400).json({ message: 'Invalid email or password' });
		}

		// Check password
		const isPasswordCorrect = await bcrypt.compare(password, user.password);
		if (!isPasswordCorrect) {
			return res.status(400).json({ message: 'Invalid email or password' });
		}

		// Generate token
		const token = generateToken(user._id, res, rememberMe);

		// Send response (don't send password back)
		res.status(200).json({
			_id: user._id,
			fullName: user.fullName,
			email: user.email,
			token,
		});
	} catch (error) {
		console.error('Error in login controller:', error.message);
		res.status(500).json({ message: 'Internal server error' });
	}
};

// Logout user
const logout = async (req, res) => {
	try {
		// Clear the JWT cookie
		res.cookie('jwt', '', {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
			maxAge: 0, // Expire immediately
		});

		res.status(200).json({ message: 'Logged out successfully' });
	} catch (error) {
		console.error('Error in logout controller:', error.message);
		res.status(500).json({ message: 'Internal server error' });
	}
};

// Check auth function
const checkAuth = async (req, res) => {
	try {
		res.status(200).json(req.user);
	} catch (error) {
		console.error('Error in checkAuth controller:', error.message);
		res.status(500).json({ message: 'Internal server error' });
	}
};

module.exports = { signup, login, logout, checkAuth };
