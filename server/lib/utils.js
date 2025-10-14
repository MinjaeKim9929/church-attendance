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

// Helper function to calculate class from grade
const getClassFromGrade = (grade) => {
	if (['JK', 'SK', '1'].includes(grade)) return 'JK-Gr1';
	if (['2', '3', '4'].includes(grade)) return 'Gr2-4';
	if (['5', '6'].includes(grade)) return 'Gr5-6';
	if (['7', '8'].includes(grade)) return 'Gr7-8';
	if (['9', '10', '11', '12'].includes(grade)) return 'HighSchool';
	return null;
};

module.exports = { generateToken, getClassFromGrade };
