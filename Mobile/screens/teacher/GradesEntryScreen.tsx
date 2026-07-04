import React, { useEffect, useState, useCallback } from 'react';
import {
  ScrollView, View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import Card from '../../components/ui/Card';
import { Colors, Font, Space, Radius } from '../../constants/theme';
import * as coursesService from '../../services/coursesService';
import * as gradesService from '../../services/gradesService';
import type { Course } from '../../services/coursesService';
import type { CourseGradeRecord } from '../../services/gradesService';

const CORTES = [1, 2, 3] as const;

export default function GradesEntryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const courseId = Number(id);

  const [course, setCourse] = useState<Course | null>(null);
  const [corte, setCorte] = useState<1 | 2 | 3>(1);
  const [actividad, setActividad] = useState('');
  const [tipo, setTipo] = useState('Taller');
  const [peso, setPeso] = useState('');
  const [values, setValues] = useState<Record<number, string>>({});
  const [existing, setExisting] = useState<CourseGradeRecord[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadCourse = useCallback(async () => {
    const c = await coursesService.getCourse(courseId);
    setCourse(c);
  }, [courseId]);

  const loadExisting = useCallback(async () => {
    const records = await gradesService.getCourseGrades(courseId, corte);
    setExisting(records);
  }, [courseId, corte]);

  useEffect(() => {
    setLoading(true);
    Promise.all([loadCourse(), loadExisting()])
      .catch((e) => setError(e?.message ?? 'No se pudo cargar la información'))
      .finally(() => setLoading(false));
  }, [loadCourse, loadExisting]);

  useEffect(() => {
    loadExisting().catch((e) => setError(e?.message ?? 'No se pudo cargar las notas'));
  }, [corte, loadExisting]);

  if (loading) {
    return (
      <View style={styles.empty}>
        <ActivityIndicator size="large" color={Colors.accent} />
      </View>
    );
  }

  const students = course?.estudiantes ?? [];

  const handleSave = async () => {
    setError('');
    setSuccess('');
    if (!actividad.trim()) {
      setError('Ponle un nombre a la actividad.');
      return;
    }
    const pesoNum = parseFloat(peso);
    if (!pesoNum || pesoNum <= 0) {
      setError('El peso debe ser un número mayor a 0.');
      return;
    }

    const grades = students
      .map((s) => {
        const raw = values[s.id];
        if (raw == null || raw.trim() === '') return null;
        const valor = parseFloat(raw);
        if (Number.isNaN(valor)) return null;
        return {
          estudiante_id: s.id, curso_id: courseId, corte,
          actividad: actividad.trim(), tipo, valor, peso: pesoNum,
        };
      })
      .filter((g): g is NonNullable<typeof g> => g != null);

    if (grades.length === 0) {
      setError('Ingresa al menos una nota.');
      return;
    }

    setSaving(true);
    try {
      await gradesService.bulkUpsertGrades(grades);
      setSuccess(`${grades.length} nota(s) guardadas`);
      setValues({});
      setActividad('');
      setPeso('');
      await loadExisting();
    } catch (e: any) {
      setError(e?.message ?? 'No se pudieron guardar las notas');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      {course && (
        <Text style={styles.courseTitle}>{course.nombre} · {course.codigo}{course.grupo ? ` ${course.grupo}` : ''}</Text>
      )}

      <View style={styles.corteRow}>
        {CORTES.map((c) => (
          <TouchableOpacity
            key={c}
            style={[styles.cortePill, corte === c && styles.cortePillActive]}
            onPress={() => setCorte(c)}
          >
            <Text style={[styles.cortePillText, corte === c && styles.cortePillTextActive]}>Corte {c}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Card>
        <Text style={styles.sectionTitle}>Nueva actividad</Text>

        {error !== '' && <Text style={styles.errorText}>{error}</Text>}
        {success !== '' && <Text style={styles.successText}>{success}</Text>}

        <View style={styles.field}>
          <Text style={styles.label}>Nombre de la actividad</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej: Taller ER, Quiz 1, Parcial C1..."
            placeholderTextColor={Colors.text3}
            value={actividad}
            onChangeText={setActividad}
          />
        </View>

        <View style={styles.fieldRow}>
          <View style={[styles.field, { flex: 1 }]}>
            <Text style={styles.label}>Tipo</Text>
            <TextInput
              style={styles.input}
              placeholder="Taller, Quiz, Parcial..."
              placeholderTextColor={Colors.text3}
              value={tipo}
              onChangeText={setTipo}
            />
          </View>
          <View style={[styles.field, { width: 90 }]}>
            <Text style={styles.label}>Peso %</Text>
            <TextInput
              style={styles.input}
              placeholder="20"
              placeholderTextColor={Colors.text3}
              keyboardType="numeric"
              value={peso}
              onChangeText={setPeso}
            />
          </View>
        </View>

        <Text style={[styles.label, { marginTop: Space.sm }]}>Notas por estudiante</Text>
        {students.length === 0 ? (
          <Text style={styles.emptyText}>Sin estudiantes inscritos</Text>
        ) : (
          students.map((s) => (
            <View key={s.id} style={styles.studentRow}>
              <Text style={styles.studentName} numberOfLines={1}>{s.nombre}</Text>
              <TextInput
                style={styles.gradeInput}
                placeholder="—"
                placeholderTextColor={Colors.text3}
                keyboardType="decimal-pad"
                value={values[s.id] ?? ''}
                onChangeText={(t) => setValues((v) => ({ ...v, [s.id]: t }))}
              />
            </View>
          ))
        )}

        <TouchableOpacity style={[styles.saveBtn, saving && { opacity: 0.7 }]} onPress={handleSave} disabled={saving}>
          {saving ? <ActivityIndicator color={Colors.white} /> : <Text style={styles.saveBtnText}>Guardar notas</Text>}
        </TouchableOpacity>
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>Notas registradas — Corte {corte}</Text>
        {existing.length === 0 ? (
          <Text style={styles.emptyText}>Sin notas registradas en este corte</Text>
        ) : (
          existing.map((g) => (
            <View key={g.id} style={styles.existingRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.existingStudent}>{g.estudiante?.nombre ?? `#${g.estudiante_id}`}</Text>
                <Text style={styles.existingActividad}>{g.actividad} · {g.tipo} · {g.peso}%</Text>
              </View>
              <Text style={styles.existingValor}>{g.valor != null ? g.valor.toFixed(1) : '—'}</Text>
            </View>
          ))
        )}
      </Card>

      <View style={{ height: Space.xl }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: Colors.bg },
  content: { padding: Space.lg, gap: Space.md },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40, backgroundColor: Colors.bg },
  emptyText: { fontSize: Font.sm, color: Colors.text3, paddingVertical: Space.sm },

  courseTitle: { fontSize: Font.md, fontWeight: '700', color: Colors.text },

  corteRow: { flexDirection: 'row', gap: Space.sm },
  cortePill: {
    flex: 1, alignItems: 'center', paddingVertical: Space.sm,
    backgroundColor: Colors.bg3, borderRadius: Radius.md, borderWidth: 1.5, borderColor: 'transparent',
  },
  cortePillActive: { backgroundColor: 'rgba(79,70,229,0.08)', borderColor: Colors.accent },
  cortePillText: { fontSize: Font.sm, fontWeight: '600', color: Colors.text2 },
  cortePillTextActive: { color: Colors.accent },

  sectionTitle: { fontSize: Font.md, fontWeight: '700', color: Colors.text, marginBottom: Space.md },
  errorText: { color: Colors.red, fontSize: Font.sm, marginBottom: Space.sm },
  successText: { color: Colors.green, fontSize: Font.sm, marginBottom: Space.sm },

  field: { gap: Space.xs, marginBottom: Space.sm },
  fieldRow: { flexDirection: 'row', gap: Space.sm },
  label: { fontSize: Font.xs, fontWeight: '700', color: Colors.text3, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: {
    backgroundColor: Colors.bg3, borderRadius: Radius.sm, paddingHorizontal: Space.md,
    paddingVertical: Space.sm, fontSize: Font.base, color: Colors.text,
  },

  studentRow: {
    flexDirection: 'row', alignItems: 'center', gap: Space.sm,
    paddingVertical: Space.sm, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  studentName: { flex: 1, fontSize: Font.sm, color: Colors.text },
  gradeInput: {
    width: 60, textAlign: 'center', backgroundColor: Colors.bg3, borderRadius: Radius.sm,
    paddingVertical: Space.xs, fontSize: Font.base, fontWeight: '700', color: Colors.text,
  },

  saveBtn: {
    marginTop: Space.md, backgroundColor: Colors.accent, borderRadius: Radius.md,
    padding: Space.md, alignItems: 'center',
  },
  saveBtnText: { fontSize: Font.base, fontWeight: '700', color: Colors.white },

  existingRow: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: Space.sm,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  existingStudent: { fontSize: Font.sm, fontWeight: '600', color: Colors.text },
  existingActividad: { fontSize: Font.xs, color: Colors.text3, marginTop: 2 },
  existingValor: { fontSize: Font.lg, fontWeight: '700', color: Colors.text },
});
