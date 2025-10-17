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

// Helper function to calculate school year from date
// School year runs from Sept 1 to Aug 31
// Returns format: "25_26" for 2025-2026 school year
const getSchoolYearFromDate = (date = new Date()) => {
	const d = new Date(date);
	const month = d.getMonth(); // 0-11
	const year = d.getFullYear();

	// If month is Sept (8) or later, school year starts this year
	// If month is before Sept (0-7), school year started last year
	const startYear = month >= 8 ? year : year - 1;
	const endYear = startYear + 1;

	// Format: "25_26" from years 2025-2026
	const startYearShort = startYear.toString().slice(-2);
	const endYearShort = endYear.toString().slice(-2);

	return `${startYearShort}_${endYearShort}`;
};

// Helper function to find student's class based on grade and class configuration
// This will be used by attendance controller after fetching ClassConfiguration
const getClassFromGradeAndConfig = (grade, classConfiguration) => {
	if (!classConfiguration || !classConfiguration.classes) {
		return null;
	}

	for (const classInfo of classConfiguration.classes) {
		if (classInfo.grades.includes(grade)) {
			return classInfo.className;
		}
	}

	return null;
};

module.exports = { generateToken, getSchoolYearFromDate, getClassFromGradeAndConfig };
