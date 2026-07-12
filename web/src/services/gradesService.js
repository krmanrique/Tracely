// services/gradesService.js
import { getToken } from '../context/AuthContext';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

/**
 * Obtiene las calificaciones del estudiante por semestre.
 * Retorna array de inscripciones con asignatura, cortes, actividades y calificaciones.
 */
export const getGrades = async (estudianteId, semestre) => {
  const token = getToken();

  const res = await fetch(
    `${API}/calificaciones/estudiante/${estudianteId}?semestre=${semestre}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  if (!res.ok) throw new Error('Error al obtener calificaciones');

  const inscripciones = await res.json();

  // Transformar al formato que espera el frontend (GradesPages.jsx)
  return inscripciones.map((insc) => {
    const asig = insc.asignatura;
    const cortes = asig?.cortes ?? [];

    // Construir estructura de cortes con actividades y notas
    const cortesFormateados = cortes.map((corte) => {
      const actividades = corte.actividades?.map((act) => {
        const calificacion = insc.calificaciones?.find(
          (c) => c.actividad_id === act.id
        );
        return {
          id:        act.id,
          label:     act.nombre,
          tipo:      act.tipo,
          value:     calificacion?.nota ?? null,
          peso:      act.porcentaje_en_corte,
        };
      }) ?? [];

      return {
        id:         corte.id,
        label:      `Corte ${corte.numero_corte}`,
        weight:     corte.peso_porcentual,
        actividades,
      };
    });

    // Calcular asistencia desde inscripciones si viene
    const totalAsis    = insc.asistencias?.length ?? 0;
    const presentesAsis = insc.asistencias?.filter((a) => a.presente).length ?? 0;
    const attendance   = totalAsis > 0 ? Math.round((presentesAsis / totalAsis) * 100) : 100;

    return {
      id:         insc.asignatura_id,
      name:       asig?.nombre ?? '',
      code:       asig?.NRC ?? '',
      teacher:    asig?.docente?.usuario?.nombre ?? '',
      credits:    asig?.pensum?.creditos ?? 0,
      color:      '#4F46E5',
      attendance,
      status:     attendance >= 80 ? 'active' : 'alert',
      cortes:     cortesFormateados,
      inscripcionId: insc.id,
    };
  });
};
