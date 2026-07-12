// src/modules/alertas/alertaController.js
const { Alerta, Inscripcion, Estudiante, Asignatura, Usuario } = require('../../models');

const alertaController = {

  // GET /api/alertas/estudiante/:estudianteId — alertas activas del estudiante
  getByEstudiante: async (req, res) => {
    try {
      const inscripciones = await Inscripcion.findAll({
        where: { estudiante_id: req.params.estudianteId },
        attributes: ['id'],
      });

      const ids = inscripciones.map(i => i.id);
      const alertas = await Alerta.findAll({
        where: { inscripcion_id: ids },
        include: [{
          model: Inscripcion, as: 'inscripcion',
          include: [{ model: Asignatura, as: 'asignatura', attributes: ['nombre', 'NRC'] }],
        }],
        order: [['createdAt', 'DESC']],
      });

      res.json(alertas);
    } catch (err) {
      res.status(500).json({ error: 'Error al obtener alertas' });
    }
  },

  // POST /api/alertas — crear alerta (sistema automático o admin)
  create: async (req, res) => {
    try {
      const alerta = await Alerta.create(req.body);
      res.status(201).json(alerta);
    } catch (err) {
      res.status(500).json({ error: 'Error al crear alerta' });
    }
  },

  // PUT /api/alertas/:id/resolver
  resolver: async (req, res) => {
    try {
      const alerta = await Alerta.findByPk(req.params.id);
      if (!alerta) return res.status(404).json({ error: 'Alerta no encontrada' });
      await alerta.update({ estado: 'resuelta' });
      res.json({ message: 'Alerta resuelta', alerta });
    } catch (err) {
      res.status(500).json({ error: 'Error al resolver alerta' });
    }
  },
};

module.exports = alertaController;
