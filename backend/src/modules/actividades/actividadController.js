const { Actividad, Corte } = require('../../models');

const actividadController = {

  // GET /api/actividades/corte/:corteId
  getByCorte: async (req, res) => {
    try {
      const actividades = await Actividad.findAll({
        where: { corte_id: req.params.corteId },
        order: [['createdAt', 'ASC']],
      });
      res.json(actividades);
    } catch (err) {
      res.status(500).json({ error: 'Error al obtener actividades' });
    }
  },

  // POST /api/actividades
  create: async (req, res) => {
    try {
      const actividad = await Actividad.create(req.body);
      res.status(201).json(actividad);
    } catch (err) {
      res.status(500).json({ error: 'Error al crear actividad' });
    }
  },

  // PUT /api/actividades/:id
  update: async (req, res) => {
    try {
      const actividad = await Actividad.findByPk(req.params.id);
      if (!actividad) return res.status(404).json({ error: 'Actividad no encontrada' });
      await actividad.update(req.body);
      res.json(actividad);
    } catch (err) {
      res.status(500).json({ error: 'Error al actualizar actividad' });
    }
  },

  // DELETE /api/actividades/:id
  delete: async (req, res) => {
    try {
      const deleted = await Actividad.destroy({ where: { id: req.params.id } });
      if (!deleted) return res.status(404).json({ error: 'No encontrada' });
      res.json({ message: 'Actividad eliminada' });
    } catch (err) {
      res.status(500).json({ error: 'Error al eliminar actividad' });
    }
  },
};

module.exports = actividadController;
