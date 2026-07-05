const express = require('express');
const calificacionController = require('./calificacionController');
const { authenticate, authorize } = require('../../middlewares/auth');

const router = express.Router();

router.get('/estudiante/:estudianteId', authenticate, calificacionController.getByEstudiante);
router.get('/asignatura/:asignaturaId', authenticate, authorize('docente', 'admin'), calificacionController.getByAsignatura);
router.post('/',       authenticate, authorize('docente', 'admin'), calificacionController.upsert);
router.post('/bulk',   authenticate, authorize('docente', 'admin'), calificacionController.bulkUpsert);

module.exports = router;
