// src/config/seed.js
// Ejecutar con: npm run seed
// Crea datos de demostración para el sistema

require('dotenv').config();
const bcrypt = require('bcrypt');
const { sequelize, Users, Careers, Semesters, Courses, Enrollments } = require('../models');

async function seed() {
  try {
    await sequelize.authenticate();
    console.log('✅ Conectado a la BD');

    // Sincronizar tablas
    await sequelize.sync({ force: true }); // ⚠️ Borra y recrea tablas
    console.log('✅ Tablas recreadas');

    // ── Carreras ─────────────────────────────────────────────
    const [sistemas, admin, contaduria] = await Careers.bulkCreate([
      { codigo: 'IS', nombre: 'Ingeniería de Sistemas', duracion_semestres: 8, activa: true },
      { codigo: 'ADM', nombre: 'Administración de Empresas', duracion_semestres: 8, activa: true },
      { codigo: 'CON', nombre: 'Contaduría Pública', duracion_semestres: 8, activa: true },
    ]);
    console.log('✅ Carreras creadas');

    // ── Semestres ─────────────────────────────────────────────
    const [sem2025_1] = await Semesters.bulkCreate([
      { codigo: '2025-1', nombre: 'Primer Semestre 2025', fecha_inicio: '2025-02-01', fecha_fin: '2025-06-30', activo: true },
      { codigo: '2024-2', nombre: 'Segundo Semestre 2024', fecha_inicio: '2024-08-01', fecha_fin: '2024-12-15', activo: false },
    ]);
    console.log('✅ Semestres creados');

    // ── Usuarios ─────────────────────────────────────────────
    const hash = async (p) => bcrypt.hash(p, 10);

    const [adminUser, prof1, est1, est2, est3] = await Users.bulkCreate([
      { nombre: 'Admin UNICATÓLICA', email: 'admin@unicatolica.edu.co', contrasena_hash: await hash('admin123'), rol: 'admin' },
      { nombre: 'Dr. Carlos Ramírez', email: 'c.ramirez@unicatolica.edu.co', contrasena_hash: await hash('prof123'), rol: 'profesor', carrera_id: sistemas.id },
      { nombre: 'Michael Sanchez', email: 'michael.sanchez@unicatolica.edu.co', contrasena_hash: await hash('est123'), rol: 'estudiante', carrera_id: sistemas.id },
      { nombre: 'Valentina Torres', email: 'v.torres@unicatolica.edu.co', contrasena_hash: await hash('est123'), rol: 'estudiante', carrera_id: sistemas.id },
      { nombre: 'Andrés Mejía', email: 'a.mejia@unicatolica.edu.co', contrasena_hash: await hash('est123'), rol: 'estudiante', carrera_id: sistemas.id },
    ], { individualHooks: false }); // bulkCreate no dispara hooks, así que se hashea arriba
    console.log('✅ Usuarios creados');

    // ── Cursos ────────────────────────────────────────────────
    const [bd2, bd1] = await Courses.bulkCreate([
      { codigo: 'IS-401', nombre: 'Bases de Datos II', grupo: 'G1', creditos: 4, color: '#4F46E5', profesor_id: prof1.id, carrera_id: sistemas.id, semestre_id: sem2025_1.id },
      { codigo: 'IS-301', nombre: 'Bases de Datos I',  grupo: 'G2', creditos: 3, color: '#059669', profesor_id: prof1.id, carrera_id: sistemas.id, semestre_id: sem2025_1.id },
    ]);
    console.log('✅ Cursos creados');

    // ── Inscripciones ─────────────────────────────────────────
    await Enrollments.bulkCreate([
      { estudiante_id: est1.id, curso_id: bd2.id, semestre_id: sem2025_1.id },
      { estudiante_id: est2.id, curso_id: bd2.id, semestre_id: sem2025_1.id },
      { estudiante_id: est3.id, curso_id: bd2.id, semestre_id: sem2025_1.id },
    ]);
    console.log('✅ Inscripciones creadas');

    console.log('\n🎉 Seed completado. Credenciales de acceso:');
    console.log('  Admin:    admin@unicatolica.edu.co / admin123   (ID:', adminUser.id, ')');
    console.log('  Profesor: c.ramirez@unicatolica.edu.co / prof123  (ID:', prof1.id, ')');
    console.log('  Estudiante: michael.sanchez@unicatolica.edu.co / est123  (ID:', est1.id, ')');

  } catch (err) {
    console.error('❌ Error en seed:', err);
  } finally {
    await sequelize.close();
  }
}

seed();
