const { Estudiante, Usuario, Carrera, Inscripcion, Asignatura, Asistencia, Calificacion, Alerta } = require('../../models');

const studentController = {

  // GET /api/students/me — perfil completo del estudiante autenticado
  getMe: async (req, res) => {
    try {
      const estudiante = await Estudiante.findOne({
        where: { usuario_id: req.user.id },
        include: [
          { model: Usuario, as: 'usuario', attributes: ['nombre', 'correo', 'id_institucional'] },
          { model: Carrera, as: 'carrera', attributes: ['nombre', 'codigo'] },
        ],
      });
      if (!estudiante) return res.status(404).json({ error: 'Perfil de estudiante no encontrado' });
      res.json(estudiante);
    } catch (err) {
      res.status(500).json({ error: 'Error al obtener perfil' });
    }
  },

  // GET /api/students/:id/dashboard?semestre=2025-1
  // Datos completos para el dashboard del estudiante (stats, materias, notificaciones)
  getDashboard: async (req, res) => {
    try {
      const { id } = req.params;
      const { semestre } = req.query;

      const whereAsignatura = semestre ? { semestre_academico: semestre } : {};

      const inscripciones = await Inscripcion.findAll({
        where: { estudiante_id: id },
        include: [
          {
            model: Asignatura, as: 'asignatura',
            where: whereAsignatura,
            required: false,
          },
          { model: Calificacion, as: 'calificaciones' },
          { model: Asistencia,   as: 'asistencias' },
          { model: Alerta, as: 'alertas', where: { estado: 'activa' }, required: false },
        ],
      });

      // Calcular stats generales
      let totalCreditos = 0;
      let sumaGpa = 0;
      let contGpa = 0;
      let sumaAtt = 0;
      let alertasCount = 0;

      const courses = inscripciones.map((insc) => {
        const total     = insc.asistencias.length;
        const presentes = insc.asistencias.filter(a => a.presente).length;
        const att       = total > 0 ? Math.round((presentes / total) * 100) : 100;
        const notas     = insc.calificaciones.filter(c => c.nota !== null).map(c => c.nota);
        const gpa       = notas.length > 0 ? (notas.reduce((a, b) => a + b, 0) / notas.length) : null;

        if (gpa !== null) { sumaGpa += gpa; contGpa++; }
        sumaAtt += att;
        alertasCount += insc.alertas?.length ?? 0;

        return {
          id:         insc.asignatura?.id,
          name:       insc.asignatura?.nombre,
          code:       insc.asignatura?.NRC,
          attendance: att,
          gpa,
          status:     att >= 80 ? 'active' : 'alert',
        };
      });

      res.json({
        gpa:            contGpa > 0 ? Math.round((sumaGpa / contGpa) * 10) / 10 : null,
        attendanceRate: inscripciones.length > 0 ? Math.round(sumaAtt / inscripciones.length) : null,
        totalMaterias:  inscripciones.length,
        alertas:        alertasCount,
        courses,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Error al obtener dashboard' });
    }
  },

  // GET /api/students — solo admin
  getAll: async (req, res) => {
    try {
      const estudiantes = await Estudiante.findAll({
        include: [
          { model: Usuario, as: 'usuario', attributes: ['nombre', 'correo', 'id_institucional'] },
          { model: Carrera, as: 'carrera', attributes: ['nombre'] },
        ],
      });
      res.json(estudiantes);
    } catch (err) {
      res.status(500).json({ error: 'Error al obtener estudiantes' });
    }
  },
};

module.exports = studentController;
