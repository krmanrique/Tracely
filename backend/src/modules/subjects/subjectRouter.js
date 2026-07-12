const express = require('express');
const subjectController = require('./subjectController');
const { authenticate, authorize } = require('../../middlewares/auth');

const router = express.Router();

router.get('/',                  authenticate, subjectController.getAll);
router.get('/teacher/:docenteId',authenticate, subjectController.getByTeacher);
router.get('/:id',               authenticate, subjectController.getOne);
router.post('/',                 authenticate, authorize('admin'), subjectController.create);
router.put('/:id',               authenticate, authorize('admin'), subjectController.update);

module.exports = router;
