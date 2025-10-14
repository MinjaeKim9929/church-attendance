const express = require('express');
const {
	createAttendance,
	bulkCreateAttendance,
	getAttendanceByClassAndDate,
	getAttendanceByClass,
	getAttendanceByStudent,
	getAttendanceByDate,
	updateAttendance,
	deleteAttendance,
	getClassAttendanceStats,
} = require('../controllers/attendanceController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All routes are protected
// Bulk operations
router.post('/bulk', protect, bulkCreateAttendance);

// Class-based queries
router.get('/class/:className/date/:date', protect, getAttendanceByClassAndDate);
router.get('/class/:className', protect, getAttendanceByClass);
router.get('/stats/class/:className', protect, getClassAttendanceStats);

// Student-based queries
router.get('/student/:studentId', protect, getAttendanceByStudent);

// Date-based queries
router.get('/date/:date', protect, getAttendanceByDate);

// Single record CRUD
router.post('/', protect, createAttendance);
router.put('/:id', protect, updateAttendance);
router.delete('/:id', protect, deleteAttendance);

module.exports = router;
