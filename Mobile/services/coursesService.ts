import { apiFetch } from './client';

export interface Semester {
  id: number;
  codigo: string;
  nombre?: string;
}

export interface CourseStudent {
  id: number;
  nombre: string;
  email: string;
}

export interface Course {
  id: number;
  codigo: string;
  nombre: string;
  grupo: string | null;
  creditos: number;
  color: string;
  profesor_id: number;
  carrera_id: number | null;
  semestre_id: number;
  profesor?: { id: number; nombre: string };
  semestre?: Semester;
  estudiantes?: CourseStudent[];
}

export async function getCourses(params?: { semestre_id?: number; profesor_id?: number }): Promise<Course[]> {
  const qs = new URLSearchParams();
  if (params?.semestre_id) qs.set('semestre_id', String(params.semestre_id));
  if (params?.profesor_id) qs.set('profesor_id', String(params.profesor_id));
  const suffix = qs.toString() ? `?${qs.toString()}` : '';
  return apiFetch<Course[]>(`/courses${suffix}`);
}

export async function getCourse(id: number): Promise<Course> {
  return apiFetch<Course>(`/courses/${id}`);
}
