import { Colors } from '../constants/theme';

export function gradeColor(val: number | null | undefined): string {
  if (val == null) return Colors.text3;
  if (val >= 4.0) return Colors.green;
  if (val >= 3.0) return Colors.orange;
  return Colors.red;
}

export function attColor(val: number | null | undefined): string {
  if (val == null) return Colors.text3;
  if (val >= 80) return Colors.green;
  if (val >= 70) return Colors.orange;
  return Colors.red;
}

export interface Actividad {
  id: string;
  label: string;
  tipo: string;
  value: number | null;
}

export interface Corte {
  id: number;
  label: string;
  weight: number;
  actividades: Actividad[];
}

export function corteAvg(actividades: Actividad[]): number | null {
  const graded = actividades.filter((a) => a.value != null);
  if (!graded.length) return null;
  return graded.reduce((s, a) => s + (a.value ?? 0), 0) / graded.length;
}

export function courseOverall(cortes: Corte[]): number | null {
  let total = 0, totalWeight = 0;
  for (const ct of cortes) {
    const avg = corteAvg(ct.actividades);
    if (avg != null) { total += avg * ct.weight; totalWeight += ct.weight; }
  }
  return totalWeight === 0 ? null : total / totalWeight;
}

export type RiskLevel = 'low' | 'medium' | 'high';

export function riskLevel(gpa: number | null, attendanceRate: number | null): RiskLevel {
  if (gpa != null && gpa < 3.0) return 'high';
  if (attendanceRate != null && attendanceRate < 70) return 'high';
  if (gpa != null && gpa < 3.5) return 'medium';
  if (attendanceRate != null && attendanceRate < 80) return 'medium';
  return 'low';
}

export type StudentStatus = 'active' | 'warning' | 'risk' | 'critical';

export function attendanceStatus(pct: number): StudentStatus {
  if (pct >= 85) return 'active';
  if (pct >= 70) return 'warning';
  if (pct >= 50) return 'risk';
  return 'critical';
}

const MONTHS_ES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

export function monthLabel(dateStr: string): string {
  const d = new Date(dateStr);
  return MONTHS_ES[d.getMonth()];
}

export function monthKey(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}
