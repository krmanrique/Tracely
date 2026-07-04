import React from 'react';
import { ScrollView, View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import RingChart from '../../components/charts/RingChart';
import MiniBarChart from '../../components/charts/MiniBarChart';
import StatCard from '../../components/ui/StatCard';
import Card from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import AlertBanner from '../../components/students/AlertBanner';
import NotifItem from '../../components/students/NotifItem';
import CourseCard from '../../components/students/CourseCard';
import { useData } from '../../context/DataContext';
import { Colors, Font, Space } from '../../constants/theme';
import { gradeColor, attColor } from '../../utils/helpers';

export default function StudentDashboardScreen() {
  const router = useRouter();
  const { studentSemData: semData, loading, error, refresh } = useData();

  if (loading && !semData) {
    return (
      <View style={styles.empty}>
        <ActivityIndicator size="large" color={Colors.accent} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyIcon}>⚠️</Text>
        <Text style={styles.emptyText}>{error}</Text>
        <TouchableOpacity onPress={refresh} style={{ marginTop: Space.md }}>
          <Text style={{ color: Colors.accent, fontWeight: '600' }}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!semData) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyIcon}>📅</Text>
        <Text style={styles.emptyText}>No hay datos para este semestre</Text>
      </View>
    );
  }

  const { gpa, attendanceRate, riskLevel, courses, notifications } = semData;
  const unread = notifications.filter((n) => !n.read).length;
  const alertCourses = courses.filter((c) => c.status === 'alert');

  const riskLabel = riskLevel === 'low' ? '✓ Bajo' : riskLevel === 'medium' ? '⚠ Medio' : '⛔ Alto';

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <AlertBanner courseNames={alertCourses.map((c) => c.name)} />

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statsScroll}
        contentContainerStyle={styles.statsRow}>
        <StatCard icon="📊" label="Promedio General" value={gpa != null ? gpa.toFixed(1) : '—'} sub="Escala 0.0 – 5.0" valueColor={gradeColor(gpa)} />
        <StatCard icon="✅" label="Asistencia Global" value={attendanceRate != null ? `${attendanceRate}%` : '—'} sub="Mínimo requerido 80%" valueColor={attColor(attendanceRate)} />
        <StatCard icon="📚" label="Materias" value={String(courses.length)} sub={`${courses.reduce((a, c) => a + c.credits, 0)} créditos`} />
        <StatCard icon="🔔" label="Alertas" value={String(unread)} sub="Sin leer" valueColor={unread ? Colors.red : Colors.text} />
      </ScrollView>

      <Card>
        <View style={styles.ringRow}>
          <RingChart value={gpa ?? 0} max={5} size={96} color={gradeColor(gpa)} label={gpa != null ? gpa.toFixed(1) : '—'} sublabel="Promedio" />
          <View style={styles.ringInfo}>
            <Text style={styles.sectionLabel}>Nivel de Riesgo</Text>
            <Badge variant={riskLevel as any} label={riskLabel} />
            <Text style={[styles.gpaLarge, { color: gradeColor(gpa) }]}>{gpa != null ? gpa.toFixed(2) : '—'}</Text>
            <Text style={styles.gpaSmall}>Promedio acumulado</Text>
          </View>
        </View>
      </Card>

      {semData.attendanceHistory.length > 0 && (
        <Card>
          <Text style={styles.sectionTitle}>Asistencia Mensual</Text>
          <View style={{ marginTop: Space.md }}>
            <MiniBarChart data={semData.attendanceHistory} />
          </View>
        </Card>
      )}

      <Card>
        <View style={styles.rowBetween}>
          <Text style={styles.sectionTitle}>Notificaciones</Text>
          {unread > 0 && <Badge variant="alert" label={`${unread} nuevas`} />}
        </View>
        {notifications.length === 0 ? (
          <Text style={styles.emptyInlineText}>Sin notificaciones</Text>
        ) : (
          notifications.map((n) => (
            <NotifItem key={n.id} notif={n} onPress={() => router.push('/(tabs)/grades')} />
          ))
        )}
      </Card>

      <View style={styles.rowBetween}>
        <Text style={styles.sectionTitle}>Mis Materias</Text>
        <TouchableOpacity onPress={() => router.push('/(tabs)/grades')}>
          <Text style={styles.sectionLink}>Ver notas →</Text>
        </TouchableOpacity>
      </View>

      {courses.map((c) => (
        <CourseCard key={c.id} course={c} onPress={() => router.push('/(tabs)/grades')} />
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
  emptyText: { fontSize: Font.base, color: Colors.text3, textAlign: 'center' },
  emptyInlineText: { fontSize: Font.base, color: Colors.text3, textAlign: 'center', paddingVertical: Space.md },

  statsScroll: { marginHorizontal: -Space.lg },
  statsRow: { paddingHorizontal: Space.lg, gap: Space.md, flexDirection: 'row' },

  ringRow: { flexDirection: 'row', alignItems: 'center', gap: Space.xl },
  ringInfo: { flex: 1, gap: Space.sm },
  sectionLabel: { fontSize: Font.xs, fontWeight: '700', color: Colors.text3, textTransform: 'uppercase', letterSpacing: 0.8 },
  gpaLarge: { fontSize: Font.xxl, fontWeight: '700', letterSpacing: -0.5 },
  gpaSmall: { fontSize: Font.xs, color: Colors.text3 },

  sectionTitle: { fontSize: Font.md, fontWeight: '700', letterSpacing: -0.2, color: Colors.text },
  sectionLink: { fontSize: Font.sm, color: Colors.accent, fontWeight: '600' },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
});
