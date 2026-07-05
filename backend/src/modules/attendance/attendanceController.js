const { Asistencia, Inscripcion, Asignatura, Estudiante, Usuario, Pensum } = require('../../models');
const { Op } = require('sequelize');

const attendanceController = {

  // GET /api/attendance/estudiante/:estudianteId?semestre=2025-1
  // Lo que muestra el front: % asistencia por materia con estado AL DIA o ALERTA
  getByEstudiante: async (req, res) => {
    try {
      const { estudianteId } = req.params;
      const { semestre } = req.query;

      const whereAsignatura = semestre ? { semestre_academico: semestre } : {};

      const inscripciones = await Inscripcion.findAll({
        where: { estudiante_id: estudianteId },
        include: [
          {
            model: Asignatura, as: 'asignatura',
            where: whereAsignatura,
            include: [
              { model: Pensum, as: 'pensum', attributes: ['nombre_asignatura', 'creditos'] },
              { model: Docente, as: 'docente',
                include: [{ model: Usuario, as: 'usuario', attributes: ['nombre'] }] },
            ],
          },
          { model: Asistencia, as: 'asistencias' },
        ],
      });

      // Calcular % por materia
      const result = inscripciones.map((insc) => {
        const total    = insc.asistencias.length;
        const presentes = insc.asistencias.filter(a => a.presente).length;
        const pct      = total > 0 ? Math.round((presentes / total) * 100) : 100;

        return {
          id:         insc.asignatura.id,
          name:       insc.asignatura.nombre,
          code:       insc.asignatura.NRC,
          teacher:    insc.asignatura.docente?.usuario?.nombre ?? '',
          credits:    insc.asignatura.pensum?.creditos ?? 0,
          color:      '#4F46E5',
          attendance: pct,
          status:     pct >= 80 ? 'active' : 'alert',
          total,
          presentes,
        };
      });

      res.json({ courses: result });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Error al obtener asistencia' });
    }
  },

  // GET /api/attendance/asignatura/:asignaturaId?fecha=2025-07-05
  // Docente consulta asistencia de su grupo en una fecha
  getByAsignatura: async (req, res) => {
    try {
      const { asignaturaId } = req.params;
      const { fecha } = req.query;

      const inscripciones = await Inscripcion.findAll({
        where: { asignatura_id: asignaturaId },
        include: [
          {
            model: Estudiante, as: 'estudiante',
            include: [{ model: Usuario, as: 'usuario', attributes: ['nombre', 'id_institucional'] }],
          },
          {
            model: Asistencia, as: 'asistencias',
            where: fecha ? { fecha } : {},
            required: false,
          },
        ],
      });

      res.json(inscripciones);
    } catch (err) {
      res.status(500).json({ error: 'Error al obtener asistencia del grupo' });
    }
  },

  // POST /api/attendance/bulk
  // Docente guarda asistencia del dia para todo el grupo
  // Body: { asignatura_id, fecha, records: [{ inscripcion_id, presente }] }
  saveDayAttendance: async (req, res) => {
    try {
      const { asignatura_id, fecha, records } = req.body;

      if (!Array.isArray(records) || !asignatura_id || !fecha)
        return res.status(400).json({ error: 'Datos incompletos' });

      const results = await Promise.all(
        records.map(async ({ inscripcion_id, presente }) => {
          const [record, created] = await Asistencia.findOrCreate({
            where: { inscripcion_id, fecha },
            defaults: { presente, registrado_por: req.user.id },
          });
          if (!created) await record.update({ presente });
          return record;
        })
      );

      // Verificar si algún estudiante bajó del 80% y crear alerta
      // (lógica básica — se puede expandir con Nodemailer aquí)
      res.json({ message: `Asistencia guardada para ${results.length} estudiantes`, fecha });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Error al guardar asistencia' });
    }
  },
};

module.exports = attendanceController;
