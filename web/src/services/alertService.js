// services/alertService.js
// Alertas académicas del estudiante (RF-23/RF-25). No agrega endpoints
// nuevos: combina 3 endpoints que ya existen en el backend —
// GET /api/students/me (resuelve el UUID de Estudiante que espera
// alertaController, distinto del id_institucional del JWT),
// GET /api/alertas/estudiante/:estudianteUuid (historial completo,
// activas y resueltas, ya viene ordenado por fecha) y
// GET /api/calificaciones/estudiante/:id (para leer la nota proyectada
// actual de cada materia, que Alerta no guarda de forma persistente).
import { getToken } from '../context/AuthContext';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

function authHeaders() {
  return { Authorization: `Bearer ${getToken()}` };
}

export const getStudentAlerts = async (estudianteId, semestre) => {
  const headers = authHeaders();

  const meRes = await fetch(`${API}/students/me`, { headers });
  if (!meRes.ok) throw new Error('Error al cargar el perfil del estudiante');
  const me = await meRes.json();

  const [alertasRes, califRes] = await Promise.all([
    fetch(`${API}/alertas/estudiante/${me.id}`, { headers }),
    fetch(`${API}/calificaciones/estudiante/${estudianteId}${semestre ? `?semestre=${semestre}` : ''}`, { headers }),
  ]);
  if (!alertasRes.ok) throw new Error('Error al cargar las alertas');

  const alertas = await alertasRes.json();
  const calificaciones = califRes.ok ? await califRes.json() : [];
  const inscripcionPorId = Object.fromEntries(calificaciones.map((c) => [c.id, c]));

  return alertas.map((a) => {
    const insc = inscripcionPorId[a.inscripcion_id];
    const cortesPendientes = (insc?.asignatura?.cortes ?? [])
      .filter((c) => !c.corte_completo)
      .sort((x, y) => x.numero_corte - y.numero_corte);
    const pesoPendienteTotal = cortesPendientes.reduce((s, c) => s + (c.peso_porcentual ?? 0), 0);

    return {
      id: a.id,
      tipo: a.tipo,
      estado: a.estado,
      notaMinimaRequerida: a.nota_minima_requerida,
      recuperable: a.es_recuperable,
      // updatedAt refleja la última reevaluación real (cada vez que se
      // guarda una nota); createdAt es de la primera vez que la materia
      // entró en riesgo, que puede ser muy vieja y engañosa.
      fecha: a.updatedAt,
      asignaturaId: a.inscripcion?.asignatura_id ?? null,
      asignaturaNombre: a.inscripcion?.asignatura?.nombre ?? 'Materia',
      asignaturaNRC: a.inscripcion?.asignatura?.NRC ?? '',
      notaProyectada: insc?.nota_definitiva_calculada ?? null,
      cortesPendientes,
      pesoPendienteTotal,
    };
  });
};
