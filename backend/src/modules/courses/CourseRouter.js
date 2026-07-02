const express = require('express');
const { Courses, Users, Semesters } = require('../../models');
const { authenticate, authorize } = require('../../middlewares/auth');

const router = express.Router();

// GET /api/courses — listar cursos (filtrable por semestre)
router.get('/', authenticate, async (req, res) => {
  try {
    const { semestre_id, profesor_id } = req.query;
    const where = {};
    if (semestre_id)  where.semestre_id  = semestre_id;
    if (profesor_id)  where.profesor_id  = profesor_id;

    const courses = await Courses.findAll({
      where,
      include: [
        { model: Users,     as: 'profesor',  attributes: ['id', 'nombre'] },
        { model: Semesters, as: 'semestre',  attributes: ['id', 'codigo', 'nombre'] },
      ],
    });
    res.json(courses);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener cursos' });
  }
});

// GET /api/courses/:id
router.get('/:id', authenticate, async (req, res) => {
  try {
    const course = await Courses.findByPk(req.params.id, {
      include: [
        { model: Users,     as: 'profesor',    attributes: ['id', 'nombre'] },
        { model: Semesters, as: 'semestre',    attributes: ['id', 'codigo'] },
        { model: Users,     as: 'estudiantes', attributes: ['id', 'nombre', 'email'] },
      ],
    });
    if (!course) return res.status(404).json({ error: 'Curso no encontrado' });
    res.json(course);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener curso' });
  }
});

// POST /api/courses — solo admin/profesor
router.post('/', authenticate, authorize('admin', 'profesor'), async (req, res) => {
  try {
    const course = await Courses.create(req.body);
    res.status(201).json(course);
  } catch (err) {
    res.status(500).json({ error: 'Error al crear curso' });
  }
});

// PUT /api/courses/:id
router.put('/:id', authenticate, authorize('admin', 'profesor'), async (req, res) => {
  try {
    const course = await Courses.findByPk(req.params.id);
    if (!course) return res.status(404).json({ error: 'Curso no encontrado' });
    await course.update(req.body);
    res.json(course);
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar curso' });
  }
});

module.exports = router;
