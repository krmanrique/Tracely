import { apiFetch } from './client';
import type { ApiActividad, ApiCalificacion } from './apiTypes';

// Inscripción con estudiante y sus notas (vista del docente por asignatura)
export interface AsignaturaCalificaciones {
  id: string; // inscripcion UUID
  estudiante?: { id: string; usuario?: { nombre: string; correo: string } | null } | null;
  calificaciones?: ApiCalificacion[];
}

export async function getByAsignatura(asignaturaId: string, corte?: number): Promise<AsignaturaCalificaciones[]> {
  const suffix = corte ? `?corte=${corte}` : '';
  return apiFetch<AsignaturaCalificaciones[]>(`/calificaciones/asignatura/${asignaturaId}${suffix}`);
}

export async function bulkUpsert(
  calificaciones: { inscripcion_id: string; actividad_id: string; nota: number }[]
): Promise<{ message: string; count: number }> {
  return apiFetch('/calificaciones/bulk', {
    method: 'POST',
    body: JSON.stringify({ calificaciones }),
  });
}

export async function createActividad(payload: {
  corte_id: string;
  nombre: string;
  tipo: string;
  porcentaje_en_corte: number;
}): Promise<ApiActividad> {
  return apiFetch('/actividades', { method: 'POST', body: JSON.stringify(payload) });
}
