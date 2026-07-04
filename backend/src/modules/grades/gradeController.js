// src/modules/grades/gradeController.js
const { Grades, Enrollments, Courses, Users } = require('../../models');

const gradeController = {

  // GET /api/grades/student/:studentId?semestre=2025-1
  // Retorna todas las notas del estudiante agrupadas por curso y corte
  getStudentGrades: async (req, res) => {
    try {
      const { studentId } = req.params;
      const { semestre } = req.query;

      // Solo el propio estudiante o un admin/profesor puede ver las notas
      if (req.user.rol === 'estudiante' && req.user.id !== parseInt(studentId))
        return res.status(403).json({ error: 'No autorizado' });

      const where = { estudiante_id: studentId };

      const grades = await Grades.findAll({
        where,
        include: [
          { model: Courses, as: 'curso', where: semestre ? {} : undefined,
            include: [{ model: Users, as: 'profesor', attributes: ['id', 'nombre'] }] },
        ],
        order: [['curso_id', 'ASC'], ['corte', 'ASC']],
      });

      // Agrupar por curso
      const byCourse = {};
      grades.forEach((g) => {
        const cid = g.curso_id;
        if (!byCourse[cid]) {
          byCourse[cid] = {
            id: g.curso.id,
            nombre: g.curso.nombre,
            codigo: g.curso.codigo,
            creditos: g.curso.creditos,
            color: g.curso.color,
            profesor: g.curso.profesor?.nombre ?? '',
            cortes: { 1: [], 2: [], 3: [] },
          };
        }
        byCourse[cid].cortes[g.corte].push({
          id: g.id,
          actividad: g.actividad,
          tipo: g.tipo,
          valor: g.valor !== null ? parseFloat(g.valor) : null,
          peso: g.peso,
        });
      });

      res.json({ courses: Object.values(byCourse) });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Error al obtener notas' });
    }
  },

  // POST /api/grades
  // El profesor registra/actualiza una nota
  upsertGrade: async (req, res) => {
    try {
      const { estudiante_id, curso_id, corte, actividad, tipo, valor, peso } = req.body;

      const enrollment = await Enrollments.findOne({ where: { estudiante_id, curso_id } });
      if (!enrollment)
        return res.status(400).json({ error: 'El estudiante no está inscrito en este curso' });

      const [grade, created] = await Grades.findOrCreate({
        where: { estudiante_id, curso_id, corte, actividad },
        defaults: { tipo, valor, peso, inscripcion_id: enrollment.id },
      });

      if (!created) await grade.update({ valor, tipo, peso });

      res.status(created ? 201 : 200).json({
        message: created ? 'Nota registrada' : 'Nota actualizada',
        grade,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Error al guardar nota' });
    }
  },

  // POST /api/grades/bulk
  // El profesor sube un lote de notas (ej: desde Excel)
  bulkUpsert: async (req, res) => {
    try {
      const { grades } = req.body; // array de { estudiante_id, curso_id, corte, actividad, tipo, valor, peso }

      if (!Array.isArray(grades) || grades.length === 0)
        return res.status(400).json({ error: 'Sin datos' });

      const results = await Promise.all(
        grades.map(async (g) => {
          const enrollment = await Enrollments.findOne({
            where: { estudiante_id: g.estudiante_id, curso_id: g.curso_id },
          });
          if (!enrollment) return null; // estudiante no inscrito: se omite

          const [record, created] = await Grades.findOrCreate({
            where: { estudiante_id: g.estudiante_id, curso_id: g.curso_id, corte: g.corte, actividad: g.actividad },
            defaults: { ...g, inscripcion_id: enrollment.id },
          });
          if (!created) await record.update({ valor: g.valor });
          return record;
        })
      ).then((r) => r.filter(Boolean));

      res.json({ message: `${results.length} notas procesadas`, count: results.length });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Error al procesar notas' });
    }
  },

  // GET /api/grades/course/:courseId
  // El profesor ve todas las notas de su curso
  getCourseGrades: async (req, res) => {
    try {
      const { courseId } = req.params;
      const { corte } = req.query;

      const where = { curso_id: courseId };
      if (corte) where.corte = corte;

      const grades = await Grades.findAll({
        where,
        include: [{ model: Users, as: 'estudiante', attributes: ['id', 'nombre', 'email'] }],
        order: [['estudiante_id', 'ASC'], ['corte', 'ASC']],
      });

      res.json(grades);
    } catch (err) {
      res.status(500).json({ error: 'Error al obtener notas del curso' });
    }
  },
};

module.exports = gradeController;
