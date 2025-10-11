const jwt = require('jsonwebtoken');

const generateToken = (userId, res, rememberMe = false) => {
	const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
		expiresIn: rememberMe ? '30d' : '2h',
	});

	res.cookie('jwt', token, {
		httpOnly: true,
		secure: process.env.NODE_ENV === 'production',
		sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
		maxAge: rememberMe ? 30 * 24 * 60 * 60 * 1000 : 2 * 60 * 60 * 1000,
	});

	return token;
};

module.exports = generateToken;
