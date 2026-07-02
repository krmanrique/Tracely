require('dotenv').config();
const express    = require('express');
const cors       = require('cors');
const swaggerUi  = require('swagger-ui-express');
const swaggerDoc = require('./config/swagger');
const { sequelize } = require('./models');

// ── Routers ────────────────────────────────────────────────────
const userRouter       = require('./modules/users/userRouter');
const careerRouter     = require('./modules/careers/careerRouter');
const courseRouter     = require('./modules/courses/courseRouter');
const gradeRouter      = require('./modules/grades/gradeRouter');
const attendanceRouter = require('./modules/attendance/attendanceRouter');

const app  = express();
const PORT = process.env.PORT || 3000;

// ── Middlewares globales ───────────────────────────────────────
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());

// ── Swagger ────────────────────────────────────────────────────
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDoc));

// ── Health check ───────────────────────────────────────────────
app.get('/api/status', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), version: '1.0.0' });
});

// ── Rutas de la API ────────────────────────────────────────────
app.use('/api/users',      userRouter);
app.use('/api/careers',    careerRouter);
app.use('/api/courses',    courseRouter);
app.use('/api/grades',     gradeRouter);
app.use('/api/attendance', attendanceRouter);

// ── 404 global ─────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: `Ruta ${req.method} ${req.path} no encontrada` });
});

// ── Error handler global ───────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Error no manejado:', err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

// ── Conectar BD y levantar servidor ───────────────────────────
sequelize.authenticate()
  .then(() => {
    console.log('✅ Conexión a PostgreSQL exitosa');
    return sequelize.sync({ alter: false }); // en producción: alter: false
  })
  .then(() => {
    console.log('✅ Modelos sincronizados');
    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
      console.log(`📖 Swagger docs en http://localhost:${PORT}/api/docs`);
    });
  })
  .catch((err) => {
    console.error('❌ Error al conectar la base de datos:', err.message);
    process.exit(1);
  });

module.exports = app;
