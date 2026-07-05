const express = require('express');
const studentController = require('./studentController');
const { authenticate, authorize } = require('../../middlewares/auth');

const router = express.Router();

router.get('/me',             authenticate, studentController.getMe);
router.get('/',               authenticate, authorize('admin'), studentController.getAll);
router.get('/:id/dashboard',  authenticate, studentController.getDashboard);

module.exports = router;
