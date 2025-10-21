const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
	try {
		let token;

		// Check for token in Authorization header first (better for cross-origin)
		if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
			token = req.headers.authorization.substring(7); // Remove 'Bearer ' prefix
		}
		// Fallback to cookie (for backwards compatibility)
		else if (req.cookies.jwt) {
			token = req.cookies.jwt;
		}

		if (!token) {
			return res.status(401).json({ message: 'Not authorized, no token' });
		}

		// Verify token
		const decoded = jwt.verify(token, process.env.JWT_SECRET);

		// Get user from token (without password)
		req.user = await User.findById(decoded.userId).select('-password');

		if (!req.user) {
			return res.status(401).json({ message: 'User not found' });
		}

		next();
	} catch (error) {
		console.error('Error in auth middleware:', error.message);
		res.status(401).json({ message: 'Not authorized, invalid token' });
	}
};

const adminOnly = async (req, res, next) => {
	try {
		// Check if user exists and is admin
		if (!req.user) {
			return res.status(401).json({ message: 'Not authorized, no user' });
		}

		if (req.user.role !== 'admin') {
			return res.status(403).json({ message: 'Access denied. Admin only.' });
		}

		next();
	} catch (error) {
		console.error('Error in admin middleware:', error.message);
		res.status(403).json({ message: 'Access denied' });
	}
};

module.exports = { protect, adminOnly };
