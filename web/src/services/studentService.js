// services/studentService.js
import { getToken } from '../context/AuthContext';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

/**
 * Carga todos los datos del dashboard del estudiante desde el backend.
 * Combina calificaciones + asistencia + alertas en la estructura
 * que espera StudentDashboard.jsx
 */
export const getStudentDashboard = async (estudianteId, semestre) => {
  const token = getToken();
  const headers = { Authorization: `Bearer ${token}` };

  // Llamadas en paralelo
  const [inscRes, attRes] = await Promise.all([
    fetch(`${API}/calificaciones/estudiante/${estudianteId}?semestre=${semestre}`, { headers }),
    fetch(`${API}/attendance/estudiante/${estudianteId}?semestre=${semestre}`, { headers }),
  ]);

  if (!inscRes.ok) throw new Error('Error al cargar datos del semestre');

  const inscripciones = await inscRes.json();
  const attData       = attRes.ok ? await attRes.json() : { courses: [] };
  const attMap        = Object.fromEntries((attData.courses ?? []).map((c) => [c.id, c]));

  const colors = ['#4F46E5', '#059669', '#D97706', '#DC2626', '#7C3AED'];

  // Construir courses con estructura completa
  const courses = inscripciones.map((insc, idx) => {
    const asig     = insc.asignatura;
    const attInfo  = attMap[asig?.id] ?? {};
    const att      = attInfo.attendance ?? 100;

    const cortesFormateados = (asig?.cortes ?? []).map((corte) => ({
      id:     corte.id,
      label:  `Corte ${corte.numero_corte}`,
      weight: corte.peso_porcentual,
      actividades: (corte.actividades ?? []).map((act) => {
        const cal = insc.calificaciones?.find((c) => c.actividad_id === act.id);
        return {
          id:    act.id,
          label: act.nombre,
          tipo:  act.tipo,
          value: cal?.nota ?? null,
          peso:  act.porcentaje_en_corte,
        };
      }),
    }));

    // Calcular promedio general del curso
    let suma = 0, total = 0;
    cortesFormateados.forEach((ct) => {
      const notasCorte = ct.actividades.filter((a) => a.value != null).map((a) => a.value);
      if (notasCorte.length > 0) {
        const avgCorte = notasCorte.reduce((a, b) => a + b, 0) / notasCorte.length;
        suma  += avgCorte * (ct.weight / 100);
        total += ct.weight / 100;
      }
    });
    const gpaCorso = total > 0 ? Math.round((suma / total) * 10) / 10 : null;

    return {
      id:         asig?.id,
      name:       asig?.nombre ?? '',
      code:       asig?.NRC ?? '',
      teacher:    asig?.docente?.usuario?.nombre ?? '',
      credits:    asig?.pensum?.creditos ?? 0,
      color:      colors[idx % colors.length],
      attendance: att,
      status:     att >= 80 ? 'active' : 'alert',
      cortes:     cortesFormateados,
      gpa:        gpaCorso,
      inscripcionId: insc.id,
    };
  });

  // Stats globales
  const gpas        = courses.filter((c) => c.gpa != null).map((c) => c.gpa);
  const gpa         = gpas.length > 0 ? Math.round((gpas.reduce((a, b) => a + b, 0) / gpas.length) * 10) / 10 : null;
  const attendanceRate = courses.length > 0
    ? Math.round(courses.reduce((a, c) => a + c.attendance, 0) / courses.length)
    : null;
  const alertCourses = courses.filter((c) => c.status === 'alert');
  const riskLevel    = alertCourses.length === 0 ? 'low' : alertCourses.length <= 1 ? 'medium' : 'high';

  // Notificaciones generadas desde alertas de asistencia
  const notifications = alertCourses.map((c, i) => ({
    id:       i + 1,
    type:     c.attendance < 75 ? 'alert' : 'warning',
    courseId: c.id,
    message:  `Asistencia ${c.attendance < 75 ? 'crítica' : 'baja'} en ${c.name} (${c.attendance}%)`,
    time:     'Hoy',
    read:     false,
  }));

  // Historial de asistencia mensual (simulado desde los datos reales)
  const meses = ['Ago','Sep','Oct','Nov','Dic'];
  const attendanceHistory = meses.map((month) => ({
    month,
    rate: attendanceRate ? Math.min(100, attendanceRate + Math.floor(Math.random() * 10) - 5) : 85,
  }));

  return {
    gpa,
    attendanceRate,
    riskLevel,
    courses,
    notifications,
    attendanceHistory,
    semester: semestre,
  };
};
