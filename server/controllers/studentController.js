const Student = require('../models/Student');

// @desc    Create a new student
// @route   POST /api/students
// @access  Protected
const createStudent = async (req, res) => {
	try {
		const { fullName, christianName, nameDayMonth, grade, gender, motherName, motherContact, fatherName, fatherContact } = req.body;

		// Validation
		if (!fullName || !grade || !gender) {
			return res.status(400).json({ message: 'Please provide all required fields' });
		}

		const student = await Student.create({
			fullName,
			christianName,
			nameDayMonth,
			grade,
			gender,
			motherName,
			motherContact,
			fatherName,
			fatherContact,
		});

		res.status(201).json(student);
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
};

// @desc    Get all students
// @route   GET /api/students
// @access  Protected
const getStudents = async (req, res) => {
	try {
		const students = await Student.find().sort({ createdAt: -1 });
		res.status(200).json(students);
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
};

// @desc    Get single student by ID
// @route   GET /api/students/:id
// @access  Protected
const getStudentById = async (req, res) => {
	try {
		const student = await Student.findById(req.params.id);

		if (!student) {
			return res.status(404).json({ message: 'Student not found' });
		}

		res.status(200).json(student);
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
};

// @desc    Update student
// @route   PUT /api/students/:id
// @access  Protected
const updateStudent = async (req, res) => {
	try {
		const { fullName, christianName, nameDayMonth, grade, gender, motherName, motherContact, fatherName, fatherContact } = req.body;

		const student = await Student.findById(req.params.id);

		if (!student) {
			return res.status(404).json({ message: 'Student not found' });
		}

		student.fullName = fullName || student.fullName;
		student.christianName = christianName !== undefined ? christianName : student.christianName;
		student.nameDayMonth = nameDayMonth !== undefined ? nameDayMonth : student.nameDayMonth;
		student.grade = grade || student.grade;
		student.gender = gender || student.gender;
		student.motherName = motherName !== undefined ? motherName : student.motherName;
		student.motherContact = motherContact !== undefined ? motherContact : student.motherContact;
		student.fatherName = fatherName !== undefined ? fatherName : student.fatherName;
		student.fatherContact = fatherContact !== undefined ? fatherContact : student.fatherContact;

		const updatedStudent = await student.save();

		res.status(200).json(updatedStudent);
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
};

// @desc    Delete student
// @route   DELETE /api/students/:id
// @access  Protected
const deleteStudent = async (req, res) => {
	try {
		const student = await Student.findById(req.params.id);

		if (!student) {
			return res.status(404).json({ message: 'Student not found' });
		}

		await Student.findByIdAndDelete(req.params.id);

		res.status(200).json({ message: 'Student deleted successfully' });
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
};

module.exports = {
	createStudent,
	getStudents,
	getStudentById,
	updateStudent,
	deleteStudent,
};
