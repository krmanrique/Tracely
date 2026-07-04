import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from './AuthContext';
import { Colors } from '../constants/theme';
import { courseOverall, riskLevel, attendanceStatus, monthLabel, monthKey, todayISO, RiskLevel, StudentStatus, Actividad as ActividadType, Corte as CorteType } from '../utils/helpers';
import * as coursesService from '../services/coursesService';
import * as gradesService from '../services/gradesService';
import * as attendanceService from '../services/attendanceService';
import type { Course } from '../services/coursesService';

export interface Notif {
  id: string;
  type: 'alert' | 'warning' | 'info' | 'success';
  courseId: number | null;
  message: string;
  time: string;
  read: boolean;
}

export interface StudentCourse {
  id: number;
  name: string;
  code: string;
  teacher: string;
  attendance: number;
  credits: number;
  status: 'active' | 'alert';
  color: string;
  cortes: CorteType[];
}

export interface StudentSemData {
  semester: string;
  gpa: number | null;
  attendanceRate: number | null;
  riskLevel: RiskLevel;
  courses: StudentCourse[];
  notifications: Notif[];
  attendanceHistory: { month: string; rate: number }[];
}

export interface TeacherStudent {
  id: number;
  name: string;
  email: string;
  attendance: number;
  absences: number;
  status: StudentStatus;
}

export interface TeacherCourse {
  id: number;
  name: string;
  code: string;
  group: string | null;
  color: string;
  credits: number;
  students: TeacherStudent[];
  todayAttendance: Record<number, boolean>;
}

export interface TeacherSemData {
  courses: TeacherCourse[];
}

interface Profile {
  name: string;
  idLabel: string;
  sub: string;
  initials: string;
  avatarColor: string;
}

interface DataContextType {
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  semestre: string | null;
  setSemestre: (s: string) => void;
  semestres: string[];
  studentSemData: StudentSemData | null;
  teacherSemData: TeacherSemData | null;
  unread: number;
  profile: Profile;
  saveTodayAttendance: (courseId: number, records: { estudiante_id: number; presente: boolean }[]) => Promise<void>;
}

const DataContext = createContext<DataContextType | null>(null);

function buildActividades(list: gradesService.GradeActividad[]): ActividadType[] {
  return list.map((a) => ({ id: String(a.id), label: a.actividad, tipo: a.tipo, value: a.valor }));
}

function buildCortes(grade: gradesService.StudentGradeCourse | undefined): CorteType[] {
  const weights = [30, 30, 40];
  const labels = ['Corte 1', 'Corte 2', 'Corte 3'];
  return [1, 2, 3].map((n, idx) => ({
    id: n,
    label: labels[idx],
    weight: weights[idx],
    actividades: buildActividades(grade?.cortes?.[String(n) as '1' | '2' | '3'] ?? []),
  }));
}

function buildStudentSemesters(
  courseMeta: Map<number, Course>,
  enrolledIds: number[],
  gradeCourses: gradesService.StudentGradeCourse[],
  attCourses: attendanceService.StudentAttendanceCourse[]
): Record<string, StudentCourse[] & { registros?: never }> {
  const gradeById = new Map(gradeCourses.map((c) => [c.id, c]));
  const attById = new Map(attCourses.map((c) => [c.id, c]));
  // Materias inscritas aunque no tengan notas/asistencia todavía
  const allIds = new Set<number>([...enrolledIds, ...gradeById.keys(), ...attById.keys()]);

  const bySemester: Record<string, StudentCourse[]> = {};

  for (const id of allIds) {
    const meta = courseMeta.get(id);
    const g = gradeById.get(id);
    const a = attById.get(id);
    const semestreCodigo = meta?.semestre?.codigo ?? 'Sin semestre';
    const attendance = a?.attendance ?? 100;

    const course: StudentCourse = {
      id,
      name: g?.nombre ?? a?.nombre ?? meta?.nombre ?? '—',
      code: g?.codigo ?? a?.codigo ?? meta?.codigo ?? '',
      teacher: g?.profesor ?? meta?.profesor?.nombre ?? '',
      attendance,
      credits: g?.creditos ?? meta?.creditos ?? 0,
      status: a?.status ?? (attendance < 80 ? 'alert' : 'active'),
      color: g?.color ?? a?.color ?? meta?.color ?? Colors.accent,
      cortes: buildCortes(g),
    };

    (bySemester[semestreCodigo] ??= []).push(course);
  }

  return bySemester;
}

function buildAttendanceHistory(attCourses: attendanceService.StudentAttendanceCourse[], courseMeta: Map<number, Course>) {
  const bySemester: Record<string, { fecha: string; presente: boolean }[]> = {};
  for (const c of attCourses) {
    const semestreCodigo = courseMeta.get(c.id)?.semestre?.codigo ?? 'Sin semestre';
    (bySemester[semestreCodigo] ??= []).push(...c.registros);
  }

  const result: Record<string, { month: string; rate: number }[]> = {};
  for (const [sem, regs] of Object.entries(bySemester)) {
    const byMonth = new Map<string, { label: string; total: number; present: number }>();
    for (const r of regs) {
      const key = monthKey(r.fecha);
      const entry = byMonth.get(key) ?? { label: monthLabel(r.fecha), total: 0, present: 0 };
      entry.total++;
      if (r.presente) entry.present++;
      byMonth.set(key, entry);
    }
    result[sem] = [...byMonth.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([, v]) => ({ month: v.label, rate: Math.round((v.present / v.total) * 100) }));
  }
  return result;
}

function buildNotifications(courses: StudentCourse[]): Notif[] {
  const notifications: Notif[] = [];
  courses
    .filter((c) => c.attendance < 80)
    .forEach((c) => {
      notifications.push({
        id: `att-${c.id}`,
        type: c.attendance < 70 ? 'alert' : 'warning',
        courseId: c.id,
        message: `Asistencia baja en ${c.name} (${c.attendance}%)`,
        time: '',
        read: false,
      });
    });

  const pending = courses.reduce(
    (sum, c) => sum + c.cortes.reduce((s, ct) => s + ct.actividades.filter((a) => a.value == null).length, 0),
    0
  );
  if (pending > 0) {
    notifications.push({
      id: 'pending',
      type: 'info',
      courseId: null,
      message: `Tienes ${pending} actividad(es) pendientes por calificar`,
      time: '',
      read: false,
    });
  }
  return notifications;
}

export function DataProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [semestre, setSemestre] = useState<string | null>(null);

  const [studentBySemester, setStudentBySemester] = useState<Record<string, StudentSemData>>({});
  const [teacherBySemester, setTeacherBySemester] = useState<Record<string, TeacherSemData>>({});

  const load = useCallback(async () => {
    if (!user || (user.role !== 'student' && user.role !== 'teacher')) return;
    setLoading(true);
    setError(null);
    try {
      if (user.role === 'student') {
        const [catalog, gradesResp, attResp] = await Promise.all([
          coursesService.getCourses(),
          gradesService.getStudentGrades(user.id),
          attendanceService.getStudentAttendance(user.id),
        ]);
        const courseMeta = new Map(catalog.map((c) => [c.id, c]));

        // No hay endpoint de "mis inscripciones": se revisa el roster de cada
        // curso del catálogo para saber en cuáles está inscrito el estudiante.
        const details = await Promise.all(catalog.map((c) => coursesService.getCourse(c.id)));
        const enrolledIds = details
          .filter((d) => (d.estudiantes ?? []).some((s) => s.id === user.id))
          .map((d) => d.id);

        const coursesBySemester = buildStudentSemesters(courseMeta, enrolledIds, gradesResp.courses, attResp.courses);
        const historyBySemester = buildAttendanceHistory(attResp.courses, courseMeta);

        const semMap: Record<string, StudentSemData> = {};
        for (const [sem, courses] of Object.entries(coursesBySemester)) {
          const overalls = courses.map((c) => courseOverall(c.cortes)).filter((v): v is number => v != null);
          const gpa = overalls.length ? overalls.reduce((s, v) => s + v, 0) / overalls.length : null;
          const attendances = courses.map((c) => c.attendance);
          const attendanceRate = attendances.length
            ? Math.round(attendances.reduce((s, v) => s + v, 0) / attendances.length)
            : null;

          semMap[sem] = {
            semester: sem,
            gpa,
            attendanceRate,
            riskLevel: riskLevel(gpa, attendanceRate),
            courses,
            notifications: buildNotifications(courses),
            attendanceHistory: historyBySemester[sem] ?? [],
          };
        }
        setStudentBySemester(semMap);
        setTeacherBySemester({});
        const keys = Object.keys(semMap).sort();
        setSemestre((prev) => (prev && semMap[prev] ? prev : keys[keys.length - 1] ?? null));
      } else {
        const courses = await coursesService.getCourses({ profesor_id: user.id });
        const detailed = await Promise.all(courses.map((c) => coursesService.getCourse(c.id)));
        const today = todayISO();

        const withAttendance = await Promise.all(
          detailed.map(async (c) => {
            const records = await attendanceService.getCourseAttendance(c.id);
            const byStudent = new Map<number, { total: number; present: number }>();
            const todayMap: Record<number, boolean> = {};
            for (const r of records) {
              const agg = byStudent.get(r.estudiante_id) ?? { total: 0, present: 0 };
              agg.total++;
              if (r.presente) agg.present++;
              byStudent.set(r.estudiante_id, agg);
              if (r.fecha === today) todayMap[r.estudiante_id] = r.presente;
            }
            const students: TeacherStudent[] = (c.estudiantes ?? []).map((s) => {
              const agg = byStudent.get(s.id);
              const pct = agg && agg.total > 0 ? Math.round((agg.present / agg.total) * 100) : 100;
              return {
                id: s.id,
                name: s.nombre,
                email: s.email,
                attendance: pct,
                absences: agg ? agg.total - agg.present : 0,
                status: attendanceStatus(pct),
              };
            });
            return {
              semestreCodigo: c.semestre?.codigo ?? 'Sin semestre',
              course: {
                id: c.id,
                name: c.nombre,
                code: c.codigo,
                group: c.grupo,
                color: c.color,
                credits: c.creditos,
                students,
                todayAttendance: todayMap,
              } as TeacherCourse,
            };
          })
        );

        const semMap: Record<string, TeacherSemData> = {};
        for (const { semestreCodigo, course } of withAttendance) {
          (semMap[semestreCodigo] ??= { courses: [] }).courses.push(course);
        }
        setTeacherBySemester(semMap);
        setStudentBySemester({});
        const keys = Object.keys(semMap).sort();
        setSemestre((prev) => (prev && semMap[prev] ? prev : keys[keys.length - 1] ?? null));
      }
    } catch (e: any) {
      setError(e?.message ?? 'No se pudieron cargar los datos');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  const saveTodayAttendance = useCallback(
    async (courseId: number, records: { estudiante_id: number; presente: boolean }[]) => {
      await attendanceService.saveDayAttendance({ curso_id: courseId, fecha: todayISO(), records });
      await load();
    },
    [load]
  );

  const semestres = useMemo(() => {
    const keys = user?.role === 'teacher' ? Object.keys(teacherBySemester) : Object.keys(studentBySemester);
    return keys.sort();
  }, [studentBySemester, teacherBySemester, user?.role]);

  const studentSemData = semestre ? studentBySemester[semestre] ?? null : null;
  const teacherSemData = semestre ? teacherBySemester[semestre] ?? null : null;
  const unread = studentSemData?.notifications.filter((n) => !n.read).length ?? 0;

  const profile: Profile = useMemo(() => {
    const name = user?.nombre ?? '';
    const initials = name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((n) => n[0])
      .join('')
      .toUpperCase();
    return {
      name,
      idLabel: user ? String(user.id) : '',
      sub: user?.carrera?.nombre ?? (user?.role === 'teacher' ? 'Docente' : 'Estudiante'),
      initials,
      avatarColor: user?.role === 'teacher' ? Colors.accent : Colors.purple,
    };
  }, [user]);

  return (
    <DataContext.Provider
      value={{
        loading,
        error,
        refresh: load,
        semestre,
        setSemestre,
        semestres,
        studentSemData,
        teacherSemData,
        unread,
        profile,
        saveTodayAttendance,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
}
