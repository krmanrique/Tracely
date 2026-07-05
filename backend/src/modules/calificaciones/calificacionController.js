// src/modules/calificaciones/calificacionController.js
const { Calificacion, Inscripcion, Actividad, Corte, Asignatura, Estudiante, Usuario } = require('../../models');

const calificacionController = {

  // GET /api/calificaciones/estudiante/:estudianteId?semestre=2025-1
  // Retorna todas las notas del estudiante agrupadas por asignatura y corte
  getByEstudiante: async (req, res) => {
    try {
      const { estudianteId } = req.params;

      // Verificar autorización
      if (req.user.rol === 'estudiante') {
        const estudiante = await Estudiante.findOne({ where: { usuario_id: req.user.id } });
        if (!estudiante || estudiante.id !== estudianteId)
          return res.status(403).json({ error: 'No autorizado' });
      }

      const inscripciones = await Inscripcion.findAll({
        where: { estudiante_id: estudianteId },
        include: [
          {
            model: Asignatura, as: 'asignatura',
            include: [{ model: Corte, as: 'cortes', include: [{ model: Actividad, as: 'actividades' }] }],
          },
          { model: Calificacion, as: 'calificaciones',
            include: [{ model: Actividad, as: 'actividad' }] },
        ],
      });

      res.json(inscripciones);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Error al obtener calificaciones' });
    }
  },

  // POST /api/calificaciones — registrar o actualizar una nota
  upsert: async (req, res) => {
    try {
      const { inscripcion_id, actividad_id, nota } = req.body;

      const [calificacion, created] = await Calificacion.findOrCreate({
        where: { inscripcion_id, actividad_id },
        defaults: { nota, fecha_registro: new Date() },
      });

      if (!created) await calificacion.update({ nota });

      res.status(created ? 201 : 200).json({
        message: created ? 'Nota registrada' : 'Nota actualizada',
        calificacion,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Error al guardar nota' });
    }
  },

  // POST /api/calificaciones/bulk — registrar notas en lote
  bulkUpsert: async (req, res) => {
    try {
      const { calificaciones } = req.body;
      if (!Array.isArray(calificaciones) || calificaciones.length === 0)
        return res.status(400).json({ error: 'Sin datos' });

      const results = await Promise.all(
        calificaciones.map(async ({ inscripcion_id, actividad_id, nota }) => {
          const [record, created] = await Calificacion.findOrCreate({
            where: { inscripcion_id, actividad_id },
            defaults: { nota },
          });
          if (!created) await record.update({ nota });
          return record;
        })
      );

      res.json({ message: `${results.length} notas procesadas`, count: results.length });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Error al procesar notas' });
    }
  },

  // GET /api/calificaciones/asignatura/:asignaturaId — todas las notas de una asignatura (docente)
  getByAsignatura: async (req, res) => {
    try {
      const { asignaturaId } = req.params;
      const { corte } = req.query;

      const inscripciones = await Inscripcion.findAll({
        where: { asignatura_id: asignaturaId },
        include: [
          { model: Estudiante, as: 'estudiante',
            include: [{ model: Usuario, as: 'usuario', attributes: ['nombre', 'correo'] }] },
          { model: Calificacion, as: 'calificaciones',
            include: [{
              model: Actividad, as: 'actividad',
              include: [{ model: Corte, as: 'corte',
                where: corte ? { numero_corte: corte } : {} }],
            }],
          },
        ],
      });

      res.json(inscripciones);
    } catch (err) {
      res.status(500).json({ error: 'Error al obtener notas' });
    }
  },
};

module.exports = calificacionController;
