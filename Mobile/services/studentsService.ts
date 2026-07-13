import { apiFetch } from './client';
import type { ApiAsignatura, ApiCalificacion } from './apiTypes';

export interface StudentProfile {
  id: string; // UUID del perfil estudiante (para /students/:id/dashboard)
  usuario_id: string;
  semestre_actual: number;
  carrera?: { nombre: string; codigo: string } | null;
  usuario?: { nombre: string; correo: string; id_institucional: string } | null;
}

// Inscripción cruda del estudiante con asignatura (cortes+actividades) y notas
export interface StudentInscripcion {
  id: string;
  estado: string;
  asignatura?: ApiAsignatura | null;
  calificaciones?: ApiCalificacion[];
}

export interface StudentAttendanceCourse {
  id: string; // asignatura id
  name: string;
  code: string;
  teacher: string;
  credits: number;
  color: string;
  attendance: number;
  status: 'active' | 'alert';
  total: number;
  presentes: number;
  inscripcionId: string;
}

export async function getMyProfile(): Promise<StudentProfile> {
  return apiFetch<StudentProfile>('/students/me');
}

export async function getCalificaciones(idInstitucional: string, semestre?: string): Promise<StudentInscripcion[]> {
  const suffix = semestre ? `?semestre=${encodeURIComponent(semestre)}` : '';
  return apiFetch<StudentInscripcion[]>(`/calificaciones/estudiante/${encodeURIComponent(idInstitucional)}${suffix}`);
}

export async function getAttendance(idInstitucional: string, semestre?: string): Promise<{ courses: StudentAttendanceCourse[] }> {
  const suffix = semestre ? `?semestre=${encodeURIComponent(semestre)}` : '';
  return apiFetch<{ courses: StudentAttendanceCourse[] }>(`/attendance/estudiante/${encodeURIComponent(idInstitucional)}${suffix}`);
}
