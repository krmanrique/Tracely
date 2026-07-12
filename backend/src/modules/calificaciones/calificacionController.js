const { Calificacion, Inscripcion, Actividad, Corte, Asignatura, Estudiante, Usuario, Pensum, Docente } = require('../../models');

const calificacionController = {

  // GET /api/calificaciones/estudiante/:estudianteId?semestre=2025-1
  // estudianteId = id_institucional del usuario (ej: "2021-0342")
  getByEstudiante: async (req, res) => {
    try {
      const { estudianteId } = req.params;
      const { semestre }     = req.query;

      // Verificar que el usuario autenticado solo vea sus propias notas
      if (req.user.rol === 'estudiante' && req.user.id !== estudianteId)
        return res.status(403).json({ error: 'No autorizado' });

      // Buscar el perfil estudiante por id_institucional
      const estudiante = await Estudiante.findOne({ where: { usuario_id: estudianteId } });
      if (!estudiante) return res.json([]);

      const whereAsignatura = semestre ? { semestre_academico: semestre } : {};

      const inscripciones = await Inscripcion.findAll({
        where: { estudiante_id: estudiante.id },
        include: [
          {
            model: Asignatura, as: 'asignatura',
            where: whereAsignatura,
            required: true,
            include: [
              { model: Pensum,  as: 'pensum',  attributes: ['nombre_asignatura', 'creditos'] },
              {
                model: Docente, as: 'docente',
                include: [{ model: Usuario, as: 'usuario', attributes: ['nombre'] }],
              },
              {
                model: Corte, as: 'cortes',
                include: [{ model: Actividad, as: 'actividades' }],
              },
            ],
          },
          {
            model: Calificacion, as: 'calificaciones',
            include: [{ model: Actividad, as: 'actividad' }],
          },
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

      const [cal, created] = await Calificacion.findOrCreate({
        where: { inscripcion_id, actividad_id },
        defaults: { nota, fecha_registro: new Date() },
      });
      if (!created) await cal.update({ nota });

      res.status(created ? 201 : 200).json({
        message: created ? 'Nota registrada' : 'Nota actualizada',
        calificacion: cal,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Error al guardar nota' });
    }
  },

  // POST /api/calificaciones/bulk
  bulkUpsert: async (req, res) => {
    try {
      const { calificaciones } = req.body;
      if (!Array.isArray(calificaciones) || calificaciones.length === 0)
        return res.status(400).json({ error: 'Sin datos' });

      const results = await Promise.all(
        calificaciones.map(async ({ inscripcion_id, actividad_id, nota }) => {
          const [r, created] = await Calificacion.findOrCreate({
            where: { inscripcion_id, actividad_id },
            defaults: { nota },
          });
          if (!created) await r.update({ nota });
          return r;
        })
      );

      res.json({ message: `${results.length} notas procesadas`, count: results.length });
    } catch (err) {
      res.status(500).json({ error: 'Error al procesar notas' });
    }
  },

  // GET /api/calificaciones/asignatura/:asignaturaId
  getByAsignatura: async (req, res) => {
    try {
      const { asignaturaId } = req.params;
      const { corte }        = req.query;

      const inscripciones = await Inscripcion.findAll({
        where: { asignatura_id: asignaturaId },
        include: [
          {
            model: Estudiante, as: 'estudiante',
            include: [{ model: Usuario, as: 'usuario', attributes: ['nombre', 'correo'] }],
          },
          {
            model: Calificacion, as: 'calificaciones',
            include: [{
              model: Actividad, as: 'actividad',
              include: [{
                model: Corte, as: 'corte',
                where: corte ? { numero_corte: corte } : {},
              }],
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
