// src/modules/subjects/subjectController.js
const { Asignatura, Docente, Pensum, Corte, Actividad, Inscripcion, Usuario } = require('../../models');

const subjectController = {

  // GET /api/subjects?semestre=2025-1
  getAll: async (req, res) => {
    try {
      const { semestre } = req.query;
      const where = semestre ? { semestre_academico: semestre } : {};
      const asignaturas = await Asignatura.findAll({
        where,
        include: [
          { model: Docente, as: 'docente', include: [{ model: Usuario, as: 'usuario', attributes: ['nombre', 'correo'] }] },
          { model: Pensum,  as: 'pensum',  attributes: ['nombre_asignatura', 'semestre', 'creditos'] },
        ],
      });
      res.json(asignaturas);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Error al obtener asignaturas' });
    }
  },

  // GET /api/subjects/:id — detalle completo con cortes y actividades
  getOne: async (req, res) => {
    try {
      const asignatura = await Asignatura.findByPk(req.params.id, {
        include: [
          { model: Docente, as: 'docente', include: [{ model: Usuario, as: 'usuario', attributes: ['nombre'] }] },
          { model: Pensum,  as: 'pensum' },
          {
            model: Corte, as: 'cortes',
            include: [{ model: Actividad, as: 'actividades' }],
          },
        ],
      });
      if (!asignatura) return res.status(404).json({ error: 'Asignatura no encontrada' });
      res.json(asignatura);
    } catch (err) {
      res.status(500).json({ error: 'Error al obtener asignatura' });
    }
  },

  // GET /api/subjects/teacher/:docenteId — asignaturas de un docente
  getByTeacher: async (req, res) => {
    try {
      const { semestre } = req.query;
      const where = { docente_id: req.params.docenteId };
      if (semestre) where.semestre_academico = semestre;

      const asignaturas = await Asignatura.findAll({
        where,
        include: [
          { model: Pensum, as: 'pensum', attributes: ['nombre_asignatura', 'creditos'] },
          { model: Corte,  as: 'cortes', include: [{ model: Actividad, as: 'actividades' }] },
        ],
      });
      res.json(asignaturas);
    } catch (err) {
      res.status(500).json({ error: 'Error al obtener asignaturas del docente' });
    }
  },

  // POST /api/subjects — crear asignatura (admin)
  create: async (req, res) => {
    try {
      const asignatura = await Asignatura.create(req.body);
      res.status(201).json(asignatura);
    } catch (err) {
      if (err.name === 'SequelizeUniqueConstraintError')
        return res.status(400).json({ error: 'El NRC ya existe' });
      res.status(500).json({ error: 'Error al crear asignatura' });
    }
  },

  // PUT /api/subjects/:id
  update: async (req, res) => {
    try {
      const asignatura = await Asignatura.findByPk(req.params.id);
      if (!asignatura) return res.status(404).json({ error: 'No encontrada' });
      await asignatura.update(req.body);
      res.json(asignatura);
    } catch (err) {
      res.status(500).json({ error: 'Error al actualizar' });
    }
  },
};

module.exports = subjectController;
