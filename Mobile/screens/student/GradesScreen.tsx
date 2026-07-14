import React, { useState } from 'react';
import {
  ScrollView, View, Text, TouchableOpacity, StyleSheet, ActivityIndicator,
} from 'react-native';
import Card from '../../components/ui/Card';
import { Badge, TipoChip } from '../../components/ui/Badge';
import { useData } from '../../context/DataContext';
import { Colors, Font, Space, Radius } from '../../constants/theme';
import { gradeColor, corteAvg, courseOverall } from '../../utils/helpers';

export default function GradesScreen() {
  const { studentSemData: semData, loading } = useData();
  const courses = semData?.courses ?? [];
  const [selectedId, setSelectedId] = useState<string>(courses[0]?.id ?? '');
  const [activeCorte, setActiveCorte] = useState(1);

  if (loading && !semData) {
    return (
      <View style={styles.empty}>
        <ActivityIndicator size="large" color={Colors.accent} />
      </View>
    );
  }

  if (!courses.length) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyIcon}>📭</Text>
        <Text style={styles.emptyText}>No hay materias para este semestre</Text>
      </View>
    );
  }

  const course = courses.find((c) => c.id === selectedId) ?? courses[0];
  const corte = course.cortes.find((c) => c.id === activeCorte) ?? course.cortes[0];
  const cvg = corte.notaCorte ?? corteAvg(corte.actividades);
  const overall = course.notaDefinitiva ?? courseOverall(course.cortes);

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll} contentContainerStyle={styles.chipRow}>
        {courses.map((c) => {
          const ov = c.notaDefinitiva ?? courseOverall(c.cortes);
          const isActive = selectedId === c.id;
          return (
            <TouchableOpacity
              key={c.id}
              onPress={() => { setSelectedId(c.id); setActiveCorte(1); }}
              style={[styles.chip, isActive && styles.chipActive, isActive && { borderColor: c.color }]}
            >
              <View style={[styles.chipDot, { backgroundColor: c.color }]} />
              <View>
                <Text style={[styles.chipName, isActive && { color: Colors.text }]}>{c.name}</Text>
                <Text style={styles.chipCode}>{c.code}</Text>
              </View>
              <Text style={[styles.chipGrade, { color: gradeColor(ov) }]}>
                {ov != null ? ov.toFixed(1) : '—'}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <Card>
        <View style={styles.courseHeader}>
          <View style={[styles.courseDot, { backgroundColor: course.color }]} />
          <View style={{ flex: 1 }}>
            <Text style={styles.courseName}>{course.name}</Text>
            <Text style={styles.courseTeacher}>{course.teacher} · {course.code}</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={[styles.overallGrade, { color: gradeColor(overall) }]}>
              {overall != null ? overall.toFixed(2) : '—'}
            </Text>
            <Text style={styles.overallLabel}>acumulado</Text>
          </View>
        </View>

        <View style={styles.corteRow}>
          {course.cortes.map((ct) => {
            const avg = ct.notaCorte ?? corteAvg(ct.actividades);
            const isActive = activeCorte === ct.id;
            return (
              <TouchableOpacity
                key={ct.id}
                onPress={() => setActiveCorte(ct.id)}
                style={[styles.cortePill, isActive && styles.cortePillActive]}
              >
                <Text style={[styles.cortePillLabel, isActive && { color: Colors.accent }]}>{ct.label}</Text>
                <Text style={[styles.cortePillGrade, { color: gradeColor(avg) }]}>
                  {avg != null ? avg.toFixed(1) : '—'}
                </Text>
                <Text style={styles.cortePillWeight}>{ct.weight}%</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </Card>

      <Card>
        <View style={styles.corteHeader}>
          <Text style={styles.sectionTitle}>{corte.label}</Text>
          <Text style={styles.corteWeight}>{corte.weight}% de la nota final</Text>
        </View>

        {corte.actividades.length === 0 ? (
          <View style={styles.emptyInline}>
            <Text style={styles.emptyText}>Sin actividades en este corte</Text>
          </View>
        ) : (
          corte.actividades.map((act) => (
            <View key={act.id} style={styles.actRow}>
              <TipoChip tipo={act.tipo} />
              <Text style={styles.actLabel} numberOfLines={1}>{act.label}</Text>
              {act.value != null ? (
                <Text style={[styles.actGrade, { color: gradeColor(act.value) }]}>{act.value.toFixed(1)}</Text>
              ) : (
                <Text style={styles.actPending}>Pendiente</Text>
              )}
            </View>
          ))
        )}

        {corte.actividades.length > 0 && (
          <View style={styles.corteFooter}>
            <View>
              <Text style={styles.footerLabel}>Promedio {corte.label}</Text>
              <Text style={[styles.footerVal, { color: gradeColor(cvg) }]}>
                {cvg != null ? cvg.toFixed(2) : '—'}
              </Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.footerLabel}>Peso final</Text>
              <Text style={styles.footerVal}>{corte.weight}%</Text>
            </View>
          </View>
        )}
      </Card>

      <Card>
        <Text style={[styles.sectionTitle, { marginBottom: Space.md }]}>Resumen por Corte</Text>
        {course.cortes.map((ct) => {
          const avg = ct.notaCorte ?? corteAvg(ct.actividades);
          const done = ct.actividades.filter((a) => a.value != null).length;
          return (
            <View key={ct.id} style={styles.summaryRow}>
              <View style={[styles.corteNum, activeCorte === ct.id && styles.corteNumActive]}>
                <Text style={[styles.corteNumText, activeCorte === ct.id && { color: Colors.accent }]}>{ct.id}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.summaryLabel}>{ct.label} <Text style={styles.summaryWeight}>({ct.weight}%)</Text></Text>
                <Text style={styles.summaryDone}>{done}/{ct.actividades.length} evaluaciones</Text>
              </View>
              <Text style={[styles.summaryGrade, { color: gradeColor(avg) }]}>
                {avg != null ? avg.toFixed(1) : '—'}
              </Text>
            </View>
          );
        })}
        <View style={styles.summaryTotal}>
          <Text style={styles.summaryTotalLabel}>Nota acumulada</Text>
          <Text style={[styles.summaryTotalVal, { color: gradeColor(overall) }]}>
            {overall != null ? overall.toFixed(2) : '—'}
          </Text>
        </View>

        {course.notaMinimaRequerida != null && (
          <View style={[
            styles.minReqBox,
            { backgroundColor: course.recuperable ? 'rgba(254,147,0,0.08)' : 'rgba(220,38,38,0.08)' },
          ]}>
            <View>
              <Text style={styles.minReqLabel}>Nota mínima requerida en lo pendiente</Text>
              <Text style={[styles.minReqVal, { color: course.recuperable ? Colors.accent : Colors.red }]}>
                {Math.max(0, course.notaMinimaRequerida).toFixed(2)}
              </Text>
            </View>
            <Text style={[styles.minReqBadge, { color: course.recuperable ? Colors.green : Colors.red }]}>
              {course.recuperable ? '✓ Recuperable' : '✗ No recuperable'}
            </Text>
          </View>
        )}
      </Card>

      <View style={{ height: Space.xl }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: Colors.bg },
  content: { padding: Space.lg, gap: Space.md },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyInline: { alignItems: 'center', padding: 24 },
  emptyIcon: { fontSize: 28, marginBottom: Space.sm },
  emptyText: { fontSize: Font.base, color: Colors.text3, textAlign: 'center' },

  chipScroll: { marginHorizontal: -Space.lg, marginBottom: 0 },
  chipRow: { paddingHorizontal: Space.lg, gap: Space.sm, flexDirection: 'row' },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: Space.sm,
    backgroundColor: Colors.card, borderRadius: Radius.lg,
    padding: Space.md, borderWidth: 1.5, borderColor: Colors.border,
    shadowColor: '#6355A5', shadowOpacity: 0.06, shadowRadius: 6, elevation: 1,
  },
  chipActive: { backgroundColor: 'rgba(79,70,229,0.05)', borderColor: Colors.accent },
  chipDot: { width: 9, height: 9, borderRadius: 5 },
  chipName: { fontSize: Font.base, fontWeight: '600', color: Colors.text2 },
  chipCode: { fontSize: Font.xs, color: Colors.text3 },
  chipGrade: { fontSize: Font.lg, fontWeight: '700', marginLeft: Space.xs },

  courseHeader: { flexDirection: 'row', alignItems: 'center', gap: Space.md, marginBottom: Space.md },
  courseDot: { width: 10, height: 10, borderRadius: 5, flexShrink: 0 },
  courseName: { fontSize: Font.md, fontWeight: '700', color: Colors.text },
  courseTeacher: { fontSize: Font.sm, color: Colors.text2, marginTop: 2 },
  overallGrade: { fontSize: Font.xxl, fontWeight: '700', letterSpacing: -0.5 },
  overallLabel: { fontSize: Font.xs, color: Colors.text3 },

  corteRow: { flexDirection: 'row', gap: Space.sm },
  cortePill: {
    flex: 1, alignItems: 'center', padding: Space.sm,
    backgroundColor: Colors.bg3, borderRadius: Radius.md,
    borderWidth: 1.5, borderColor: 'transparent',
  },
  cortePillActive: { backgroundColor: 'rgba(79,70,229,0.06)', borderColor: 'rgba(79,70,229,0.3)' },
  cortePillLabel: { fontSize: Font.xs, fontWeight: '700', color: Colors.text2, textTransform: 'uppercase' },
  cortePillGrade: { fontSize: Font.md, fontWeight: '700', marginTop: 2 },
  cortePillWeight: { fontSize: Font.xs, color: Colors.text3 },

  corteHeader: { marginBottom: Space.md },
  sectionTitle: { fontSize: Font.md, fontWeight: '700', color: Colors.text },
  corteWeight: { fontSize: Font.xs, color: Colors.text3, marginTop: 2 },

  actRow: { flexDirection: 'row', alignItems: 'center', gap: Space.md, paddingVertical: Space.sm, borderBottomWidth: 1, borderBottomColor: Colors.border },
  actLabel: { flex: 1, fontSize: Font.base, fontWeight: '500', color: Colors.text },
  actGrade: { fontSize: Font.xl, fontWeight: '700', letterSpacing: -0.5 },
  actPending: { fontSize: Font.sm, color: Colors.text3, fontStyle: 'italic' },

  corteFooter: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginTop: Space.md, padding: Space.md, backgroundColor: Colors.bg3, borderRadius: Radius.md,
  },
  footerLabel: { fontSize: Font.xs, color: Colors.text2, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.6 },
  footerVal: { fontSize: Font.xxl, fontWeight: '700', letterSpacing: -0.5, color: Colors.text },

  summaryRow: { flexDirection: 'row', alignItems: 'center', gap: Space.md, paddingVertical: Space.sm, borderBottomWidth: 1, borderBottomColor: Colors.border },
  corteNum: {
    width: 30, height: 30, borderRadius: Radius.sm,
    backgroundColor: Colors.bg3, alignItems: 'center', justifyContent: 'center',
  },
  corteNumActive: { backgroundColor: 'rgba(79,70,229,0.1)' },
  corteNumText: { fontSize: Font.base, fontWeight: '700', color: Colors.text2 },
  summaryLabel: { fontSize: Font.base, fontWeight: '500', color: Colors.text },
  summaryWeight: { fontSize: Font.xs, color: Colors.text3 },
  summaryDone: { fontSize: Font.xs, color: Colors.text3 },
  summaryGrade: { fontSize: Font.xl, fontWeight: '700' },
  summaryTotal: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginTop: Space.md, paddingTop: Space.md, borderTopWidth: 2, borderTopColor: Colors.border,
  },
  summaryTotalLabel: { fontSize: Font.base, fontWeight: '600', color: Colors.text2 },
  summaryTotalVal: { fontSize: 26, fontWeight: '700', letterSpacing: -0.5 },

  minReqBox: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginTop: Space.md, padding: Space.md, borderRadius: Radius.md,
  },
  minReqLabel: { fontSize: Font.xs, fontWeight: '700', color: Colors.text2, textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 3 },
  minReqVal: { fontSize: Font.lg, fontWeight: '700' },
  minReqBadge: { fontSize: Font.xs, fontWeight: '700' },
});
