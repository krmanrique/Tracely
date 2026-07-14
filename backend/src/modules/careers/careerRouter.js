const express = require('express');
const Careers = require('./careerModel');
const { authenticate, authorize } = require('../../middlewares/auth');

const router = express.Router();

// GET /api/careers — listar todas las carreras
router.get('/', async (req, res) => {
  try {
    const careers = await Careers.findAll();
    res.json(careers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener carreras' });
  }
});

// GET /api/careers/:id
router.get('/:id', async (req, res) => {
  try {
    const career = await Careers.findByPk(req.params.id);
    if (!career) return res.status(404).json({ error: 'Carrera no encontrada' });
    res.json(career);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener carrera' });
  }
});

// POST /api/careers — solo admin
router.post('/', authenticate, authorize('admin'), async (req, res) => {
  try {
    const career = await Careers.create(req.body);
    res.status(201).json(career);
  } catch (err) {
    res.status(500).json({ error: 'Error al crear carrera' });
  }
});

module.exports = router;
