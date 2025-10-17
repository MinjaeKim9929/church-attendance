const getAttendanceModel = require('../models/Attendance');
const Student = require('../models/Student');
const ClassConfiguration = require('../models/ClassConfiguration');
const { getSchoolYearFromDate, getClassFromGradeAndConfig } = require('../lib/utils');

// @desc    Create a single attendance record
// @route   POST /api/attendance
// @access  Protected
const createAttendance = async (req, res) => {
	try {
		const { studentId, date, status, schoolYear } = req.body;

		// Validation
		if (!studentId || !date || !status) {
			return res.status(400).json({ message: 'Please provide all required fields' });
		}

		// Determine school year (use provided or auto-calculate)
		const year = schoolYear || getSchoolYearFromDate(new Date(date));

		// Get the Attendance model for this school year
		const Attendance = getAttendanceModel(year);

		// Get student to determine class
		const student = await Student.findById(studentId);
		if (!student) {
			return res.status(404).json({ message: 'Student not found' });
		}

		// Get class configuration for this school year
		const classConfig = await ClassConfiguration.findOne({ schoolYear: year });
		if (!classConfig) {
			return res.status(404).json({ message: `No class configuration found for school year ${year}. Please set up classes first.` });
		}

		// Calculate class from student's grade using configuration
		const studentClass = getClassFromGradeAndConfig(student.grade, classConfig);
		if (!studentClass) {
			return res.status(400).json({ message: `Student's grade (${student.grade}) is not assigned to any class for year ${year}` });
		}

		// Create attendance record
		const attendance = await Attendance.create({
			studentId,
			date: new Date(date),
			class: studentClass,
			status,
			recordedBy: req.user._id,
		});

		// Populate student and recordedBy details
		await attendance.populate('studentId', 'fullName grade');
		await attendance.populate('recordedBy', 'fullName email');

		res.status(201).json(attendance);
	} catch (err) {
		// Handle duplicate key error (student already has attendance for this date)
		if (err.code === 11000) {
			return res.status(400).json({ message: 'Attendance already recorded for this student on this date' });
		}
		res.status(500).json({ message: err.message });
	}
};

// @desc    Bulk create/update attendance records (for class-based recording)
// @route   POST /api/attendance/bulk
// @access  Protected
const bulkCreateAttendance = async (req, res) => {
	try {
		const { date, attendanceRecords, schoolYear } = req.body;
		// attendanceRecords format: [{ studentId, status }, { studentId, status }, ...]

		// Validation
		if (!date || !attendanceRecords || !Array.isArray(attendanceRecords)) {
			return res.status(400).json({ message: 'Please provide date and attendance records array' });
		}

		// Determine school year (use provided or auto-calculate)
		const year = schoolYear || getSchoolYearFromDate(new Date(date));

		// Get the Attendance model for this school year
		const Attendance = getAttendanceModel(year);

		// Get class configuration for this school year
		const classConfig = await ClassConfiguration.findOne({ schoolYear: year });
		if (!classConfig) {
			return res.status(404).json({ message: `No class configuration found for school year ${year}. Please set up classes first.` });
		}

		const results = {
			created: [],
			updated: [],
			errors: [],
		};

		// Process each record
		for (const record of attendanceRecords) {
			try {
				const { studentId, status } = record;

				if (!studentId || !status) {
					results.errors.push({ studentId, message: 'Missing studentId or status' });
					continue;
				}

				// Get student to calculate class
				const student = await Student.findById(studentId);
				if (!student) {
					results.errors.push({ studentId, message: 'Student not found' });
					continue;
				}

				// Calculate class from student's grade using configuration
				const studentClass = getClassFromGradeAndConfig(student.grade, classConfig);
				if (!studentClass) {
					results.errors.push({ studentId, message: `Student's grade (${student.grade}) not assigned to any class` });
					continue;
				}

				// Check if attendance already exists for this student on this date
				const existingAttendance = await Attendance.findOne({
					studentId,
					date: new Date(date),
				});

				if (existingAttendance) {
					// Update existing record
					existingAttendance.status = status;
					existingAttendance.class = studentClass;
					existingAttendance.recordedBy = req.user._id;
					await existingAttendance.save();
					await existingAttendance.populate('studentId', 'fullName grade');
					await existingAttendance.populate('recordedBy', 'fullName email');
					results.updated.push(existingAttendance);
				} else {
					// Create new record
					const attendance = await Attendance.create({
						studentId,
						date: new Date(date),
						class: studentClass,
						status,
						recordedBy: req.user._id,
					});
					await attendance.populate('studentId', 'fullName grade');
					await attendance.populate('recordedBy', 'fullName email');
					results.created.push(attendance);
				}
			} catch (err) {
				results.errors.push({ studentId: record.studentId, message: err.message });
			}
		}

		res.status(200).json({
			message: 'Bulk attendance processed',
			schoolYear: year,
			results,
		});
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
};

// @desc    Get attendance for a specific class and date
// @route   GET /api/attendance/class/:className/date/:date
// @access  Protected
const getAttendanceByClassAndDate = async (req, res) => {
	try {
		const { className, date } = req.params;
		const { schoolYear } = req.query;

		// Determine school year (use provided or auto-calculate)
		const year = schoolYear || getSchoolYearFromDate(new Date(date));

		// Get the Attendance model for this school year
		const Attendance = getAttendanceModel(year);

		// Get class configuration for this school year
		const classConfig = await ClassConfiguration.findOne({ schoolYear: year });
		if (!classConfig) {
			return res.status(404).json({ message: `No class configuration found for school year ${year}` });
		}

		// Get all students in this class based on configuration
		const students = await Student.find();
		const classStudents = students.filter((student) => {
			return getClassFromGradeAndConfig(student.grade, classConfig) === className;
		});

		// Get attendance records for this date
		const attendanceRecords = await Attendance.find({
			date: new Date(date),
			class: className,
		})
			.populate('studentId', 'fullName grade gender')
			.populate('recordedBy', 'fullName email');

		// Create a map of attendance by studentId
		const attendanceMap = {};
		attendanceRecords.forEach((record) => {
			attendanceMap[record.studentId._id.toString()] = record;
		});

		// Build response with all students and their attendance status
		const response = classStudents.map((student) => {
			const attendance = attendanceMap[student._id.toString()];
			return {
				student: {
					_id: student._id,
					fullName: student.fullName,
					grade: student.grade,
					gender: student.gender,
				},
				attendance: attendance || null,
			};
		});

		res.status(200).json({
			schoolYear: year,
			class: className,
			date,
			students: response,
		});
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
};

// @desc    Get attendance history for a specific class
// @route   GET /api/attendance/class/:className
// @access  Protected
const getAttendanceByClass = async (req, res) => {
	try {
		const { className } = req.params;
		const { schoolYear } = req.query;

		// Determine school year (use provided or auto-calculate)
		const year = schoolYear || getSchoolYearFromDate();

		// Get the Attendance model for this school year
		const Attendance = getAttendanceModel(year);

		const attendanceRecords = await Attendance.find({ class: className })
			.populate('studentId', 'fullName grade gender')
			.populate('recordedBy', 'fullName email')
			.sort({ date: -1 });

		res.status(200).json({
			schoolYear: year,
			attendanceRecords,
		});
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
};

// @desc    Get attendance history for a specific student
// @route   GET /api/attendance/student/:studentId
// @access  Protected
const getAttendanceByStudent = async (req, res) => {
	try {
		const { studentId } = req.params;
		const { schoolYear } = req.query;

		// Determine school year (use provided or auto-calculate)
		const year = schoolYear || getSchoolYearFromDate();

		// Get the Attendance model for this school year
		const Attendance = getAttendanceModel(year);

		const attendanceRecords = await Attendance.find({ studentId })
			.populate('studentId', 'fullName grade gender')
			.populate('recordedBy', 'fullName email')
			.sort({ date: -1 });

		res.status(200).json({
			schoolYear: year,
			attendanceRecords,
		});
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
};

// @desc    Get all attendance for a specific date (all classes)
// @route   GET /api/attendance/date/:date
// @access  Protected
const getAttendanceByDate = async (req, res) => {
	try {
		const { date } = req.params;
		const { schoolYear } = req.query;

		// Determine school year (use provided or auto-calculate)
		const year = schoolYear || getSchoolYearFromDate(new Date(date));

		// Get the Attendance model for this school year
		const Attendance = getAttendanceModel(year);

		const attendanceRecords = await Attendance.find({
			date: new Date(date),
		})
			.populate('studentId', 'fullName grade gender')
			.populate('recordedBy', 'fullName email')
			.sort({ class: 1 });

		res.status(200).json({
			schoolYear: year,
			attendanceRecords,
		});
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
};

// @desc    Update attendance record
// @route   PUT /api/attendance/:schoolYear/:id
// @access  Protected
const updateAttendance = async (req, res) => {
	try {
		const { schoolYear, id } = req.params;
		const { status } = req.body;

		// Get the Attendance model for this school year
		const Attendance = getAttendanceModel(schoolYear);

		const attendance = await Attendance.findById(id);

		if (!attendance) {
			return res.status(404).json({ message: 'Attendance record not found' });
		}

		// Update fields
		if (status) attendance.status = status;
		attendance.recordedBy = req.user._id;

		const updatedAttendance = await attendance.save();
		await updatedAttendance.populate('studentId', 'fullName grade');
		await updatedAttendance.populate('recordedBy', 'fullName email');

		res.status(200).json(updatedAttendance);
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
};

// @desc    Delete attendance record
// @route   DELETE /api/attendance/:schoolYear/:id
// @access  Protected
const deleteAttendance = async (req, res) => {
	try {
		const { schoolYear, id } = req.params;

		// Get the Attendance model for this school year
		const Attendance = getAttendanceModel(schoolYear);

		const attendance = await Attendance.findById(id);

		if (!attendance) {
			return res.status(404).json({ message: 'Attendance record not found' });
		}

		await Attendance.findByIdAndDelete(id);

		res.status(200).json({ message: 'Attendance record deleted successfully' });
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
};

// @desc    Get attendance statistics for a class
// @route   GET /api/attendance/stats/class/:className
// @access  Protected
const getClassAttendanceStats = async (req, res) => {
	try {
		const { className } = req.params;
		const { schoolYear } = req.query;

		// Determine school year (use provided or auto-calculate)
		const year = schoolYear || getSchoolYearFromDate();

		// Get the Attendance model for this school year
		const Attendance = getAttendanceModel(year);

		// Get all attendance records for this class
		const attendanceRecords = await Attendance.find({ class: className });

		// Calculate statistics
		const totalRecords = attendanceRecords.length;
		const presentCount = attendanceRecords.filter((r) => r.status === 'Present').length;
		const absentCount = attendanceRecords.filter((r) => r.status === 'Absent').length;
		const attendanceRate = totalRecords > 0 ? ((presentCount / totalRecords) * 100).toFixed(2) : 0;

		// Get unique dates
		const uniqueDates = [...new Set(attendanceRecords.map((r) => r.date.toISOString().split('T')[0]))];

		res.status(200).json({
			schoolYear: year,
			class: className,
			totalRecords,
			presentCount,
			absentCount,
			attendanceRate: `${attendanceRate}%`,
			totalDates: uniqueDates.length,
		});
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
};

module.exports = {
	createAttendance,
	bulkCreateAttendance,
	getAttendanceByClassAndDate,
	getAttendanceByClass,
	getAttendanceByStudent,
	getAttendanceByDate,
	updateAttendance,
	deleteAttendance,
	getClassAttendanceStats,
};
