const express = require('express');
const teacherController = require('./teacherController');
const { authenticate, authorize } = require('../../middlewares/auth');

const router = express.Router();

router.get('/me',            authenticate, teacherController.getMe);
router.get('/',              authenticate, authorize('admin'), teacherController.getAll);
router.get('/:id/dashboard', authenticate, teacherController.getDashboard);

module.exports = router;
