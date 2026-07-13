import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  ScrollView, View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import Card from '../../components/ui/Card';
import { Colors, Font, Space, Radius } from '../../constants/theme';
import { useData } from '../../context/DataContext';
import { toNum } from '../../services/apiTypes';
import * as calificacionesService from '../../services/calificacionesService';

interface ExistingRow {
  key: string;
  estudiante: string;
  actividad: string;
  tipo: string;
  porcentaje: number | null;
  nota: number | null;
}

export default function GradesEntryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { teacherSemData, refresh } = useData();

  const course = useMemo(
    () => teacherSemData?.courses.find((c) => c.id === id) ?? null,
    [teacherSemData, id]
  );

  const [corteNum, setCorteNum] = useState<number | null>(null);
  const [actividad, setActividad] = useState('');
  const [tipo, setTipo] = useState('taller');
  const [peso, setPeso] = useState('');
  const [values, setValues] = useState<Record<string, string>>({}); // por inscripcion_id
  const [existing, setExisting] = useState<ExistingRow[]>([]);

  const [loadingNotas, setLoadingNotas] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const cortes = course?.cortes ?? [];
  const activeCorte = cortes.find((c) => c.numero_corte === corteNum) ?? cortes[0] ?? null;

  useEffect(() => {
    if (corteNum == null && cortes.length) setCorteNum(cortes[0].numero_corte);
  }, [cortes, corteNum]);

  const loadExisting = useCallback(async () => {
    if (!course || !activeCorte) return;
    setLoadingNotas(true);
    try {
      const inscripciones = await calificacionesService.getByAsignatura(course.id, activeCorte.numero_corte);
      const rows: ExistingRow[] = [];
      for (const insc of inscripciones) {
        const nombre = insc.estudiante?.usuario?.nombre ?? '—';
        for (const cal of insc.calificaciones ?? []) {
          if (!cal.actividad) continue; // calificación de otro corte
          rows.push({
            key: cal.id,
            estudiante: nombre,
            actividad: cal.actividad.nombre,
            tipo: cal.actividad.tipo,
            porcentaje: toNum(cal.actividad.porcentaje_en_corte),
            nota: toNum(cal.nota),
          });
        }
      }
      rows.sort((a, b) => a.actividad.localeCompare(b.actividad) || a.estudiante.localeCompare(b.estudiante));
      setExisting(rows);
    } catch (e: any) {
      setError(e?.message ?? 'No se pudieron cargar las notas');
    } finally {
      setLoadingNotas(false);
    }
  }, [course, activeCorte]);

  useEffect(() => {
    loadExisting();
  }, [loadExisting]);

  if (!course) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>Curso no encontrado. Vuelve al dashboard e inténtalo de nuevo.</Text>
      </View>
    );
  }

  const students = course.students;

  const handleSave = async () => {
    setError('');
    setSuccess('');
    if (!activeCorte) {
      setError('Esta asignatura no tiene cortes configurados.');
      return;
    }
    if (!actividad.trim()) {
      setError('Ponle un nombre a la actividad.');
      return;
    }
    const pesoNum = parseFloat(peso);
    if (!pesoNum || pesoNum <= 0 || pesoNum > 100) {
      setError('El peso en el corte debe estar entre 1 y 100.');
      return;
    }

    const notas = students
      .map((s) => {
        const raw = values[s.inscripcionId];
        if (raw == null || raw.trim() === '') return null;
        const nota = parseFloat(raw);
        if (Number.isNaN(nota) || nota < 0 || nota > 5) return null;
        return { inscripcion_id: s.inscripcionId, nota };
      })
      .filter((g): g is NonNullable<typeof g> => g != null);

    if (notas.length === 0) {
      setError('Ingresa al menos una nota válida (0.0 – 5.0).');
      return;
    }

    setSaving(true);
    try {
      const nueva = await calificacionesService.createActividad({
        corte_id: activeCorte.id,
        nombre: actividad.trim(),
        tipo: tipo.trim().toLowerCase() || 'taller',
        porcentaje_en_corte: pesoNum,
      });
      await calificacionesService.bulkUpsert(
        notas.map((n) => ({ ...n, actividad_id: nueva.id }))
      );
      setSuccess(`${notas.length} nota(s) guardadas en "${nueva.nombre}"`);
      setValues({});
      setActividad('');
      setPeso('');
      await loadExisting();
      refresh(); // actualiza cortes/actividades del contexto en segundo plano
    } catch (e: any) {
      setError(e?.message ?? 'No se pudieron guardar las notas');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      <Text style={styles.courseTitle}>{course.name} · {course.code}</Text>

      <View style={styles.corteRow}>
        {cortes.map((c) => (
          <TouchableOpacity
            key={c.id}
            style={[styles.cortePill, activeCorte?.id === c.id && styles.cortePillActive]}
            onPress={() => setCorteNum(c.numero_corte)}
          >
            <Text style={[styles.cortePillText, activeCorte?.id === c.id && styles.cortePillTextActive]}>
              Corte {c.numero_corte}
            </Text>
            <Text style={styles.cortePillWeight}>{toNum(c.peso_porcentual) ?? 0}%</Text>
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
              placeholder="taller, quiz, parcial, proyecto..."
              placeholderTextColor={Colors.text3}
              value={tipo}
              onChangeText={setTipo}
            />
          </View>
          <View style={[styles.field, { width: 110 }]}>
            <Text style={styles.label}>% en corte</Text>
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
            <View key={s.inscripcionId} style={styles.studentRow}>
              <Text style={styles.studentName} numberOfLines={1}>{s.name}</Text>
              <TextInput
                style={styles.gradeInput}
                placeholder="—"
                placeholderTextColor={Colors.text3}
                keyboardType="decimal-pad"
                value={values[s.inscripcionId] ?? ''}
                onChangeText={(t) => setValues((v) => ({ ...v, [s.inscripcionId]: t }))}
              />
            </View>
          ))
        )}

        <TouchableOpacity style={[styles.saveBtn, saving && { opacity: 0.7 }]} onPress={handleSave} disabled={saving}>
          {saving ? <ActivityIndicator color={Colors.white} /> : <Text style={styles.saveBtnText}>Guardar notas</Text>}
        </TouchableOpacity>
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>Notas registradas — Corte {activeCorte?.numero_corte ?? '—'}</Text>
        {loadingNotas ? (
          <ActivityIndicator color={Colors.accent} style={{ paddingVertical: Space.md }} />
        ) : existing.length === 0 ? (
          <Text style={styles.emptyText}>Sin notas registradas en este corte</Text>
        ) : (
          existing.map((g) => (
            <View key={g.key} style={styles.existingRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.existingStudent}>{g.estudiante}</Text>
                <Text style={styles.existingActividad}>
                  {g.actividad} · {g.tipo}{g.porcentaje != null ? ` · ${g.porcentaje}%` : ''}
                </Text>
              </View>
              <Text style={styles.existingValor}>{g.nota != null ? g.nota.toFixed(1) : '—'}</Text>
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
  emptyText: { fontSize: Font.sm, color: Colors.text3, paddingVertical: Space.sm, textAlign: 'center' },

  courseTitle: { fontSize: Font.md, fontWeight: '700', color: Colors.text },

  corteRow: { flexDirection: 'row', gap: Space.sm },
  cortePill: {
    flex: 1, alignItems: 'center', paddingVertical: Space.sm,
    backgroundColor: Colors.bg3, borderRadius: Radius.md, borderWidth: 1.5, borderColor: 'transparent',
  },
  cortePillActive: { backgroundColor: 'rgba(79,70,229,0.08)', borderColor: Colors.accent },
  cortePillText: { fontSize: Font.sm, fontWeight: '600', color: Colors.text2 },
  cortePillTextActive: { color: Colors.accent },
  cortePillWeight: { fontSize: Font.xs, color: Colors.text3, marginTop: 2 },

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
