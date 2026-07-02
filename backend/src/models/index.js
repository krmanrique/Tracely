// src/models/index.js
// Importa todos los modelos y define las asociaciones entre ellos

const sequelize   = require('../config/database');
const Users       = require('../modules/users/userModel');
const Careers     = require('../modules/careers/careerModel');
const Semesters   = require('../modules/semesters/semesterModel');
const Courses     = require('../modules/courses/courseModel');
const Enrollments = require('../modules/enrollments/enrollmentModel');
const Grades      = require('../modules/grades/gradeModel');
const Attendance  = require('../modules/attendance/attendanceModel');

// ── Asociaciones ───────────────────────────────────────────────
// Carrera <-> Usuarios
Careers.hasMany(Users,   { foreignKey: 'carrera_id', as: 'estudiantes' });
Users.belongsTo(Careers, { foreignKey: 'carrera_id', as: 'carrera' });

// Carrera <-> Cursos
Careers.hasMany(Courses,  { foreignKey: 'carrera_id', as: 'cursos' });
Courses.belongsTo(Careers,{ foreignKey: 'carrera_id', as: 'carrera' });

// Profesor <-> Cursos
Users.hasMany(Courses,   { foreignKey: 'profesor_id', as: 'cursos_dictados' });
Courses.belongsTo(Users, { foreignKey: 'profesor_id', as: 'profesor' });

// Semestre <-> Cursos
Semesters.hasMany(Courses,  { foreignKey: 'semestre_id', as: 'cursos' });
Courses.belongsTo(Semesters,{ foreignKey: 'semestre_id', as: 'semestre' });

// Cursos <-> Estudiantes (muchos a muchos via Enrollments)
Courses.belongsToMany(Users, { through: Enrollments, foreignKey: 'curso_id',     as: 'estudiantes' });
Users.belongsToMany(Courses, { through: Enrollments, foreignKey: 'estudiante_id', as: 'cursos_inscritos' });
Enrollments.belongsTo(Users,   { foreignKey: 'estudiante_id', as: 'estudiante' });
Enrollments.belongsTo(Courses, { foreignKey: 'curso_id',      as: 'curso' });

// Notas
Grades.belongsTo(Enrollments, { foreignKey: 'inscripcion_id', as: 'inscripcion' });
Grades.belongsTo(Courses,     { foreignKey: 'curso_id',       as: 'curso' });
Grades.belongsTo(Users,       { foreignKey: 'estudiante_id',  as: 'estudiante' });
Enrollments.hasMany(Grades,   { foreignKey: 'inscripcion_id', as: 'notas' });

// Asistencia
Attendance.belongsTo(Users,   { foreignKey: 'estudiante_id', as: 'estudiante' });
Attendance.belongsTo(Courses, { foreignKey: 'curso_id',      as: 'curso' });
Courses.hasMany(Attendance,   { foreignKey: 'curso_id',      as: 'asistencias' });

module.exports = {
  sequelize,
  Users,
  Careers,
  Semesters,
  Courses,
  Enrollments,
  Grades,
  Attendance,
};
