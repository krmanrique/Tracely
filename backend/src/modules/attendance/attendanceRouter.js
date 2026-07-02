const express = require('express');
const attendanceController = require('./attendanceController');
const { authenticate, authorize } = require('../../middlewares/auth');

const router = express.Router();

router.get('/student/:studentId', authenticate, attendanceController.getStudentAttendance);
router.get('/course/:courseId',   authenticate, authorize('profesor', 'admin'), attendanceController.getCourseAttendance);
router.post('/bulk',              authenticate, authorize('profesor', 'admin'), attendanceController.saveDayAttendance);

module.exports = router;
