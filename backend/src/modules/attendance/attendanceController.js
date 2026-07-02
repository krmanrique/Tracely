// src/modules/attendance/attendanceController.js
const { Attendance, Users, Courses } = require('../../models');
const { Op } = require('sequelize');

const attendanceController = {

  // GET /api/attendance/student/:studentId?semestre=2025-1
  getStudentAttendance: async (req, res) => {
    try {
      const { studentId } = req.params;

      if (req.user.rol === 'estudiante' && req.user.id !== parseInt(studentId))
        return res.status(403).json({ error: 'No autorizado' });

      const records = await Attendance.findAll({
        where: { estudiante_id: studentId },
        include: [{ model: Courses, as: 'curso', attributes: ['id', 'nombre', 'codigo', 'color'] }],
        order: [['fecha', 'DESC']],
      });

      // Agrupar por curso y calcular porcentaje
      const byCourse = {};
      records.forEach((r) => {
        const cid = r.curso_id;
        if (!byCourse[cid]) {
          byCourse[cid] = {
            ...r.curso.dataValues,
            total: 0, presentes: 0, registros: [],
          };
        }
        byCourse[cid].total++;
        if (r.presente) byCourse[cid].presentes++;
        byCourse[cid].registros.push({ fecha: r.fecha, presente: r.presente });
      });

      const courses = Object.values(byCourse).map((c) => ({
        ...c,
        attendance: c.total > 0 ? Math.round((c.presentes / c.total) * 100) : 100,
        status: c.total > 0 && (c.presentes / c.total) < 0.80 ? 'alert' : 'active',
      }));

      res.json({ courses });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Error al obtener asistencia' });
    }
  },

  // POST /api/attendance/bulk
  // El profesor guarda la asistencia del día para todo el grupo
  saveDayAttendance: async (req, res) => {
    try {
      const { curso_id, fecha, records } = req.body;
      // records: [{ estudiante_id, presente }]

      if (!Array.isArray(records) || !curso_id || !fecha)
        return res.status(400).json({ error: 'Datos incompletos' });

      const results = await Promise.all(
        records.map(async ({ estudiante_id, presente }) => {
          const [record, created] = await Attendance.findOrCreate({
            where: { estudiante_id, curso_id, fecha },
            defaults: { presente, registrado_por: req.user.id },
          });
          if (!created) await record.update({ presente });
          return record;
        })
      );

      res.json({ message: `Asistencia guardada para ${results.length} estudiantes`, fecha, curso_id });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Error al guardar asistencia' });
    }
  },

  // GET /api/attendance/course/:courseId?fecha=2025-06-30
  getCourseAttendance: async (req, res) => {
    try {
      const { courseId } = req.params;
      const { fecha } = req.query;

      const where = { curso_id: courseId };
      if (fecha) where.fecha = fecha;

      const records = await Attendance.findAll({
        where,
        include: [{ model: Users, as: 'estudiante', attributes: ['id', 'nombre'] }],
        order: [['fecha', 'DESC']],
      });

      res.json(records);
    } catch (err) {
      res.status(500).json({ error: 'Error al obtener asistencia del curso' });
    }
  },
};

module.exports = attendanceController;
