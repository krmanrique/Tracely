const express = require('express');
const gradeController = require('./gradeController');
const { authenticate, authorize } = require('../../middlewares/auth');

const router = express.Router();

// Estudiante ve sus propias notas
router.get('/student/:studentId', authenticate, gradeController.getStudentGrades);

// Profesor ve notas de su curso
router.get('/course/:courseId', authenticate, authorize('profesor', 'admin'), gradeController.getCourseGrades);

// Profesor registra una nota
router.post('/', authenticate, authorize('profesor', 'admin'), gradeController.upsertGrade);

// Profesor sube notas en bloque (Excel)
router.post('/bulk', authenticate, authorize('profesor', 'admin'), gradeController.bulkUpsert);

module.exports = router;
