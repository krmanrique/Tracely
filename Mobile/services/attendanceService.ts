import { apiFetch } from './client';

export interface StudentAttendanceCourse {
  id: number;
  nombre: string;
  codigo: string;
  color: string;
  total: number;
  presentes: number;
  registros: { fecha: string; presente: boolean }[];
  attendance: number;
  status: 'active' | 'alert';
}

export async function getStudentAttendance(studentId: number): Promise<{ courses: StudentAttendanceCourse[] }> {
  return apiFetch(`/attendance/student/${studentId}`);
}

export interface CourseAttendanceRecord {
  id: number;
  estudiante_id: number;
  curso_id: number;
  fecha: string;
  presente: boolean;
  estudiante?: { id: number; nombre: string };
}

export async function getCourseAttendance(courseId: number, fecha?: string): Promise<CourseAttendanceRecord[]> {
  const suffix = fecha ? `?fecha=${fecha}` : '';
  return apiFetch(`/attendance/course/${courseId}${suffix}`);
}

export async function saveDayAttendance(payload: {
  curso_id: number;
  fecha: string;
  records: { estudiante_id: number; presente: boolean }[];
}) {
  return apiFetch('/attendance/bulk', { method: 'POST', body: JSON.stringify(payload) });
}
