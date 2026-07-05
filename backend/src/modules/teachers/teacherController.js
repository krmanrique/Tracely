const { Docente, Usuario, Asignatura, Inscripcion, Estudiante, Corte, Actividad, Asistencia, Pensum } = require('../../models');

const teacherController = {

  // GET /api/teachers/me — perfil del docente autenticado
  getMe: async (req, res) => {
    try {
      const docente = await Docente.findOne({
        where: { usuario_id: req.user.id },
        include: [{ model: Usuario, as: 'usuario', attributes: ['nombre', 'correo', 'id_institucional'] }],
      });
      if (!docente) return res.status(404).json({ error: 'Perfil de docente no encontrado' });
      res.json(docente);
    } catch (err) {
      res.status(500).json({ error: 'Error al obtener perfil' });
    }
  },

  // GET /api/teachers/:id/dashboard?semestre=2025-1
  // Dashboard del docente: cursos, estudiantes inscritos, asistencia hoy
  getDashboard: async (req, res) => {
    try {
      const { id } = req.params;
      const { semestre } = req.query;

      const whereAsignatura = semestre
        ? { docente_id: id, semestre_academico: semestre }
        : { docente_id: id };

      const asignaturas = await Asignatura.findAll({
        where: whereAsignatura,
        include: [
          { model: Pensum, as: 'pensum', attributes: ['nombre_asignatura', 'creditos'] },
          { model: Corte,  as: 'cortes', include: [{ model: Actividad, as: 'actividades' }] },
          {
            model: Inscripcion, as: 'inscripciones',
            include: [
              { model: Estudiante, as: 'estudiante',
                include: [{ model: Usuario, as: 'usuario', attributes: ['nombre', 'id_institucional'] }] },
              { model: Asistencia, as: 'asistencias',
                where: { fecha: new Date().toISOString().split('T')[0] },
                required: false },
            ],
          },
        ],
      });

      // Calcular asistencia de hoy
      let presentesHoy = 0, totalHoy = 0;
      asignaturas.forEach(asig => {
        asig.inscripciones.forEach(insc => {
          totalHoy++;
          if (insc.asistencias?.some(a => a.presente)) presentesHoy++;
        });
      });

      const courses = asignaturas.map(asig => ({
        id:       asig.id,
        name:     asig.nombre,
        code:     asig.NRC,
        enrolled: asig.inscripciones.length,
        cortes:   asig.cortes,
        students: asig.inscripciones.map(insc => ({
          id:         insc.estudiante.id,
          name:       insc.estudiante.usuario.nombre,
          id_inst:    insc.estudiante.usuario.id_institucional,
          inscripcion_id: insc.id,
          presenteHoy: insc.asistencias?.some(a => a.presente) ?? null,
        })),
      }));

      res.json({
        courses,
        asistenciaHoy: { presentes: presentesHoy, total: totalHoy },
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Error al obtener dashboard del docente' });
    }
  },

  // GET /api/teachers — solo admin
  getAll: async (req, res) => {
    try {
      const docentes = await Docente.findAll({
        include: [{ model: Usuario, as: 'usuario', attributes: ['nombre', 'correo', 'id_institucional'] }],
      });
      res.json(docentes);
    } catch (err) {
      res.status(500).json({ error: 'Error al obtener docentes' });
    }
  },
};

module.exports = teacherController;
