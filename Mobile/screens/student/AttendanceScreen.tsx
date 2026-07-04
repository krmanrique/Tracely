import React from 'react';
import { ScrollView, View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import Card from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { useData } from '../../context/DataContext';
import { Colors, Font, Space, Radius } from '../../constants/theme';
import { attColor } from '../../utils/helpers';

export default function AttendanceScreen() {
  const { studentSemData: semData, loading } = useData();
  const courses = semData?.courses ?? [];

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

  const avg = courses.reduce((s, c) => s + c.attendance, 0) / courses.length;
  const atRisk = courses.filter((c) => c.attendance < 80);

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

      <Card>
        <View style={styles.summaryRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.summaryLabel}>Asistencia promedio</Text>
            <Text style={[styles.summaryVal, { color: attColor(avg) }]}>{avg.toFixed(0)}%</Text>
            <Text style={styles.summarySub}>Sobre {courses.length} materias</Text>
          </View>
          <View style={{ alignItems: 'flex-end', gap: Space.sm }}>
            <View>
              <Text style={styles.summaryLabel}>En riesgo</Text>
              <Text style={[styles.summaryVal, { color: atRisk.length ? Colors.red : Colors.green, fontSize: Font.xxl }]}>
                {atRisk.length}
              </Text>
            </View>
            <Text style={styles.summarySub}>Mín. requerido 80%</Text>
          </View>
        </View>
      </Card>

      {courses.map((c) => (
        <Card key={c.id} style={[styles.courseCard, { borderLeftColor: c.color }]}>
          <View style={styles.courseTop}>
            <View style={{ flex: 1 }}>
              <Text style={styles.courseCode}>{c.code}</Text>
              <Text style={styles.courseName}>{c.name}</Text>
              <Text style={styles.courseTeacher}>{c.teacher}</Text>
            </View>
            <View style={{ alignItems: 'flex-end', gap: Space.xs }}>
              <Text style={[styles.attBig, { color: attColor(c.attendance) }]}>{c.attendance}%</Text>
              <Badge variant={c.status as any} label={c.status === 'active' ? 'Al día' : '⚠ Alerta'} />
            </View>
          </View>

          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${c.attendance}%`, backgroundColor: attColor(c.attendance) }]} />
            <View style={styles.thresholdLine} />
          </View>

          <View style={styles.progressLabels}>
            <Text style={styles.progressLabelText}>0%</Text>
            <Text style={styles.progressLabelText}>80% mín.</Text>
            <Text style={styles.progressLabelText}>100%</Text>
          </View>

          {c.attendance < 80 && (
            <View style={styles.warningRow}>
              <Text style={styles.warningText}>⚠ Estás por debajo del mínimo requerido en esta materia</Text>
            </View>
          )}

          <View style={styles.detailRow}>
            <View style={styles.detailItem}>
              <Text style={styles.detailVal}>{c.credits}</Text>
              <Text style={styles.detailLabel}>créditos</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={[styles.detailVal, { color: attColor(c.attendance) }]}>{c.attendance}%</Text>
              <Text style={styles.detailLabel}>asistencia</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailVal}>{c.attendance >= 80 ? '✓' : '✗'}</Text>
              <Text style={styles.detailLabel}>estado</Text>
            </View>
          </View>
        </Card>
      ))}

      <View style={{ height: Space.xl }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: Colors.bg },
  content: { padding: Space.lg, gap: Space.md },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyIcon: { fontSize: 32, marginBottom: Space.sm },
  emptyText: { fontSize: Font.base, color: Colors.text3 },

  summaryRow: { flexDirection: 'row', alignItems: 'flex-start' },
  summaryLabel: { fontSize: Font.xs, fontWeight: '700', color: Colors.text3, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 2 },
  summaryVal: { fontSize: 32, fontWeight: '700', letterSpacing: -1 },
  summarySub: { fontSize: Font.xs, color: Colors.text3 },

  courseCard: { borderLeftWidth: 4 },
  courseTop: { flexDirection: 'row', alignItems: 'flex-start', gap: Space.md, marginBottom: Space.md },
  courseCode: { fontSize: Font.xs, fontWeight: '700', color: Colors.text3, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 2 },
  courseName: { fontSize: Font.md, fontWeight: '700', color: Colors.text, marginBottom: 2 },
  courseTeacher: { fontSize: Font.sm, color: Colors.text2 },
  attBig: { fontSize: Font.xxl, fontWeight: '700', letterSpacing: -0.5 },

  progressTrack: { height: 8, backgroundColor: Colors.bg3, borderRadius: 6, overflow: 'hidden', position: 'relative' },
  progressFill: { height: '100%', borderRadius: 6 },
  thresholdLine: {
    position: 'absolute', left: '80%', top: 0, bottom: 0,
    width: 1.5, backgroundColor: 'rgba(30,27,58,0.2)',
  },
  progressLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  progressLabelText: { fontSize: Font.xs, color: Colors.text3 },

  warningRow: {
    marginTop: Space.sm, padding: Space.sm,
    backgroundColor: 'rgba(220,38,38,0.07)', borderRadius: Radius.sm,
  },
  warningText: { fontSize: Font.xs, color: Colors.red, fontWeight: '500' },

  detailRow: { flexDirection: 'row', marginTop: Space.md, paddingTop: Space.md, borderTopWidth: 1, borderTopColor: Colors.border },
  detailItem: { flex: 1, alignItems: 'center' },
  detailVal: { fontSize: Font.lg, fontWeight: '700', color: Colors.text },
  detailLabel: { fontSize: Font.xs, color: Colors.text3, marginTop: 2, textTransform: 'uppercase', letterSpacing: 0.5 },
});
