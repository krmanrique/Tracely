import { apiFetch } from './client';
import type { ApiAsignatura, ApiAsistencia, ApiCorte } from './apiTypes';

export interface TeacherProfile {
  id: string; // UUID del perfil docente (para /teachers/:id/dashboard)
  usuario_id: string;
  usuario?: { nombre: string; correo: string; id_institucional: string } | null;
}

export interface DashboardStudent {
  id: string; // estudiante UUID
  name: string;
  id_inst: string;
  inscripcion_id: string;
  presenteHoy: boolean | null;
}

export interface DashboardCourse {
  id: string; // asignatura UUID
  name: string;
  code: string;
  enrolled: number;
  cortes: ApiCorte[];
  students: DashboardStudent[];
}

export interface TeacherDashboard {
  courses: DashboardCourse[];
  asistenciaHoy: { presentes: number; total: number };
}

// Inscripción con historial de asistencia (para % y faltas por estudiante)
export interface AsignaturaInscripcion {
  id: string;
  estudiante?: { id: string; usuario?: { nombre: string; id_institucional: string } | null } | null;
  asistencias?: ApiAsistencia[];
}

export async function getMyProfile(): Promise<TeacherProfile> {
  return apiFetch<TeacherProfile>('/teachers/me');
}

export async function getDashboard(docenteId: string, semestre?: string): Promise<TeacherDashboard> {
  const suffix = semestre ? `?semestre=${encodeURIComponent(semestre)}` : '';
  return apiFetch<TeacherDashboard>(`/teachers/${docenteId}/dashboard${suffix}`);
}

export async function getMySubjects(docenteId: string): Promise<ApiAsignatura[]> {
  return apiFetch<ApiAsignatura[]>(`/subjects/teacher/${docenteId}`);
}

export async function getAsignaturaAttendance(asignaturaId: string): Promise<AsignaturaInscripcion[]> {
  return apiFetch<AsignaturaInscripcion[]>(`/attendance/asignatura/${asignaturaId}`);
}

export async function saveDayAttendance(payload: {
  asignatura_id: string;
  fecha: string;
  records: { inscripcion_id: string; presente: boolean }[];
}): Promise<{ message: string }> {
  return apiFetch('/attendance/bulk', { method: 'POST', body: JSON.stringify(payload) });
}
