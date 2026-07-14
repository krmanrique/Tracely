require('dotenv').config();
const express   = require('express');
const cors      = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerDoc = require('./config/swagger');
const { sequelize } = require('./models');

// ── Routers ────────────────────────────────────────────────────
const userRouter         = require('./modules/users/userRouter');
const careerRouter       = require('./modules/careers/careerRouter');
const semesterRouter     = require('./modules/semesters/semesterRouter');
const studentRouter      = require('./modules/students/studentRouter');
const teacherRouter      = require('./modules/teachers/teacherRouter');
const pensumRouter       = require('./modules/pensum/pensumRouter');
const subjectRouter      = require('./modules/subjects/subjectRouter');
const corteRouter        = require('./modules/cortes/corteRouter');
const actividadRouter    = require('./modules/actividades/actividadRouter');
const inscripcionRouter  = require('./modules/inscripciones/inscripcionRouter');
const calificacionRouter = require('./modules/calificaciones/calificacionRouter');
const attendanceRouter   = require('./modules/attendance/attendanceRouter');
const alertaRouter       = require('./modules/alertas/alertaRouter');
const adminRouter        = require('./modules/admin/adminRouter');

const app  = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDoc));

app.get('/api/status', (req, res) =>
  res.json({ status: 'ok', timestamp: new Date().toISOString(), version: '2.0.0' })
);

// ── Rutas ──────────────────────────────────────────────────────
app.use('/api/users',          userRouter);
app.use('/api/careers',        careerRouter);
app.use('/api/semesters',      semesterRouter);
app.use('/api/students',       studentRouter);
app.use('/api/teachers',       teacherRouter);
app.use('/api/pensum',         pensumRouter);
app.use('/api/subjects',       subjectRouter);
app.use('/api/cortes',         corteRouter);
app.use('/api/actividades',    actividadRouter);
app.use('/api/inscripciones',  inscripcionRouter);
app.use('/api/calificaciones', calificacionRouter);
app.use('/api/attendance',     attendanceRouter);
app.use('/api/alertas',        alertaRouter);
app.use('/api/admin',          adminRouter);

app.use((req, res) =>
  res.status(404).json({ error: `Ruta ${req.method} ${req.path} no encontrada` })
);
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

sequelize.authenticate()
  .then(() => { console.log('✅ PostgreSQL conectado'); return sequelize.sync({ alter: false }); })
  .then(() => {
    console.log('✅ Modelos sincronizados');
    app.listen(PORT, () => {
      console.log(`🚀 http://localhost:${PORT}`);
      console.log(`📖 Swagger: http://localhost:${PORT}/api/docs`);
    });
  })
  .catch(err => { console.error('❌', err.message); process.exit(1); });

module.exports = app;
