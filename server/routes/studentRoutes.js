const express = require('express');
const {
	createStudent,
	getStudents,
	getStudentById,
	updateStudent,
	deleteStudent,
} = require('../controllers/studentController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All routes are protected
router.post('/', protect, createStudent);
router.get('/', protect, getStudents);
router.get('/:id', protect, getStudentById);
router.put('/:id', protect, updateStudent);
router.delete('/:id', protect, deleteStudent);

module.exports = router;