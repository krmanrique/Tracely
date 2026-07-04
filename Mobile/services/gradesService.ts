import { apiFetch } from './client';

export interface GradeActividad {
  id: number;
  actividad: string;
  tipo: string;
  valor: number | null;
  peso: number;
}

export interface StudentGradeCourse {
  id: number;
  nombre: string;
  codigo: string;
  creditos: number;
  color: string;
  profesor: string;
  cortes: Record<'1' | '2' | '3', GradeActividad[]>;
}

export async function getStudentGrades(studentId: number): Promise<{ courses: StudentGradeCourse[] }> {
  return apiFetch(`/grades/student/${studentId}`);
}

export interface CourseGradeRecord {
  id: number;
  estudiante_id: number;
  curso_id: number;
  corte: number;
  actividad: string;
  tipo: string;
  valor: number | null;
  peso: number;
  estudiante?: { id: number; nombre: string; email: string };
}

export async function getCourseGrades(courseId: number, corte?: number): Promise<CourseGradeRecord[]> {
  const suffix = corte ? `?corte=${corte}` : '';
  const records = await apiFetch<CourseGradeRecord[]>(`/grades/course/${courseId}${suffix}`);
  // Sequelize serializa DECIMAL como string
  return records.map((r) => ({ ...r, valor: r.valor != null ? Number(r.valor) : null }));
}

export interface GradeInput {
  estudiante_id: number;
  curso_id: number;
  corte: number;
  actividad: string;
  tipo: string;
  valor: number | null;
  peso: number;
}

export async function upsertGrade(payload: GradeInput) {
  return apiFetch('/grades', { method: 'POST', body: JSON.stringify(payload) });
}

export async function bulkUpsertGrades(grades: GradeInput[]) {
  return apiFetch('/grades/bulk', { method: 'POST', body: JSON.stringify({ grades }) });
}
