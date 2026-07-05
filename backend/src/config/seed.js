require('dotenv').config();
const bcrypt = require('bcrypt');
const {
  sequelize, Usuario, Carrera, Semestre, Estudiante, Docente,
  Pensum, Asignatura, Corte, Actividad, Inscripcion,
} = require('../models');

async function seed() {
  try {
    await sequelize.authenticate();
    console.log('✅ Conectado a la BD');

    await sequelize.sync({ force: true });
    console.log('✅ Tablas recreadas');

    const hash = (p) => bcrypt.hash(p, 10);

    // ── Semestres ─────────────────────────────────────────────
    const [sem2025_1, sem2024_2] = await Semestre.bulkCreate([
      { codigo: '2025-1', nombre: 'Primer Semestre 2025', fecha_inicio: '2025-02-01', fecha_fin: '2025-06-30', activo: true },
      { codigo: '2024-2', nombre: 'Segundo Semestre 2024', fecha_inicio: '2024-08-01', fecha_fin: '2024-12-15', activo: false },
      { codigo: '2024-1', nombre: 'Primer Semestre 2024', fecha_inicio: '2024-02-01', fecha_fin: '2024-06-30', activo: false },
    ]);
    console.log('✅ Semestres creados');

    // ── Usuarios ──────────────────────────────────────────────
    await Usuario.bulkCreate([
      { id_institucional: 'ADM-001',  nombre: 'Admin UNICATÓLICA',  correo: 'admin@unicatolica.edu.co',          contrasena_hash: await hash('admin123'), rol: 'admin' },
      { id_institucional: 'DOC-0112', nombre: 'Dr. Carlos Ramírez', correo: 'c.ramirez@unicatolica.edu.co',      contrasena_hash: await hash('prof123'),  rol: 'docente' },
      { id_institucional: '2021-0342',nombre: 'Michael Sanchez',    correo: 'michael.sanchez@unicatolica.edu.co',contrasena_hash: await hash('est123'),   rol: 'estudiante' },
      { id_institucional: '2021-0199',nombre: 'Valentina Torres',   correo: 'v.torres@unicatolica.edu.co',       contrasena_hash: await hash('est123'),   rol: 'estudiante' },
      { id_institucional: '2022-0411',nombre: 'Andrés Mejía',       correo: 'a.mejia@unicatolica.edu.co',        contrasena_hash: await hash('est123'),   rol: 'estudiante' },
    ]);
    console.log('✅ Usuarios creados');

    // ── Carreras ──────────────────────────────────────────────
    const [sistemas] = await Carrera.bulkCreate([
      { nombre: 'Tecnología en Desarrollo de Software', codigo: 'TDS', total_creditos: 120 },
      { nombre: 'Administración de Empresas',           codigo: 'ADM', total_creditos: 150 },
    ]);
    console.log('✅ Carreras creadas');

    // ── Perfiles docente y estudiantes ────────────────────────
    const docente = await Docente.create({ usuario_id: 'DOC-0112' });
    const [est1, est2, est3] = await Estudiante.bulkCreate([
      { usuario_id: '2021-0342', carrera_id: sistemas.id, semestre_actual: 6 },
      { usuario_id: '2021-0199', carrera_id: sistemas.id, semestre_actual: 6 },
      { usuario_id: '2022-0411', carrera_id: sistemas.id, semestre_actual: 4 },
    ]);
    console.log('✅ Perfiles creados');

    // ── Pensum ────────────────────────────────────────────────
    const [p_bd2, p_redes] = await Pensum.bulkCreate([
      { carrera_id: sistemas.id, nombre_asignatura: 'Bases de Datos II',      semestre: 6, creditos: 4 },
      { carrera_id: sistemas.id, nombre_asignatura: 'Redes de Computadores',  semestre: 6, creditos: 3 },
      { carrera_id: sistemas.id, nombre_asignatura: 'Ingeniería de Software',  semestre: 6, creditos: 4 },
    ]);
    console.log('✅ Pensum creado');

    // ── Asignaturas ───────────────────────────────────────────
    const [asig_bd2, asig_redes] = await Asignatura.bulkCreate([
      { docente_id: docente.id, pensum_id: p_bd2.id,   nombre: 'Bases de Datos II',     NRC: 'IS401-G1-2025-1', semestre_academico: '2025-1' },
      { docente_id: docente.id, pensum_id: p_redes.id, nombre: 'Redes de Computadores', NRC: 'IS410-G1-2025-1', semestre_academico: '2025-1' },
    ]);
    console.log('✅ Asignaturas creadas');

    // ── Cortes de BD II ───────────────────────────────────────
    const [c1, c2, c3] = await Corte.bulkCreate([
      { asignatura_id: asig_bd2.id, numero_corte: 1, peso_porcentual: 30 },
      { asignatura_id: asig_bd2.id, numero_corte: 2, peso_porcentual: 30 },
      { asignatura_id: asig_bd2.id, numero_corte: 3, peso_porcentual: 40 },
    ]);

    // ── Actividades del Corte 1 ───────────────────────────────
    await Actividad.bulkCreate([
      { corte_id: c1.id, nombre: 'Taller ER',  tipo: 'taller',  porcentaje_en_corte: 30 },
      { corte_id: c1.id, nombre: 'Quiz 1',     tipo: 'quiz',    porcentaje_en_corte: 30 },
      { corte_id: c1.id, nombre: 'Parcial C1', tipo: 'parcial', porcentaje_en_corte: 40 },
      { corte_id: c2.id, nombre: 'Taller SQL', tipo: 'taller',  porcentaje_en_corte: 30 },
      { corte_id: c2.id, nombre: 'Quiz 2',     tipo: 'quiz',    porcentaje_en_corte: 30 },
      { corte_id: c2.id, nombre: 'Parcial C2', tipo: 'parcial', porcentaje_en_corte: 40 },
      { corte_id: c3.id, nombre: 'Proyecto Final', tipo: 'proyecto', porcentaje_en_corte: 60 },
      { corte_id: c3.id, nombre: 'Examen Final',   tipo: 'parcial',  porcentaje_en_corte: 40 },
    ]);
    console.log('✅ Cortes y actividades creados');

    // ── Inscripciones ─────────────────────────────────────────
    await Inscripcion.bulkCreate([
      { estudiante_id: est1.id, asignatura_id: asig_bd2.id,   estado: 'activa' },
      { estudiante_id: est2.id, asignatura_id: asig_bd2.id,   estado: 'activa' },
      { estudiante_id: est3.id, asignatura_id: asig_bd2.id,   estado: 'activa' },
      { estudiante_id: est1.id, asignatura_id: asig_redes.id, estado: 'activa' },
      { estudiante_id: est2.id, asignatura_id: asig_redes.id, estado: 'activa' },
    ]);
    console.log('✅ Inscripciones creadas');

    console.log('\n🎉 Seed completado. Credenciales:');
    console.log('  Admin:      ADM-001    / admin123');
    console.log('  Docente:    DOC-0112   / prof123');
    console.log('  Estudiante: 2021-0342  / est123');

  } catch (err) {
    console.error('❌ Error en seed:', err);
  } finally {
    await sequelize.close();
  }
}

seed();