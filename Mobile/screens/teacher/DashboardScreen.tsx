import React, { useState, useEffect } from 'react';
import {
  ScrollView, View, Text, TouchableOpacity, StyleSheet, ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import RingChart from '../../components/charts/RingChart';
import StatCard from '../../components/ui/StatCard';
import Card from '../../components/ui/Card';
import CourseTabs from '../../components/teacher/CourseTabs';
import StudentAttendanceRow from '../../components/teacher/StudentAttendanceRow';
import { useData } from '../../context/DataContext';
import { Colors, Font, Space } from '../../constants/theme';

export default function TeacherDashboardScreen() {
  const router = useRouter();
  const { teacherSemData: semData, loading, error, refresh, saveTodayAttendance } = useData();
  const courses = semData?.courses ?? [];

  const [activeCourseId, setActiveCourseId] = useState<string | null>(null);
  const [attendance, setAttendance] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (courses.length && (activeCourseId == null || !courses.some((c) => c.id === activeCourseId))) {
      setActiveCourseId(courses[0].id);
      setAttendance(courses[0].todayAttendance);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courses]);

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

  if (!courses.length || activeCourseId == null) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyIcon}>📅</Text>
        <Text style={styles.emptyText}>No hay cursos para este semestre</Text>
      </View>
    );
  }

  const activeCourse = courses.find((c) => c.id === activeCourseId) ?? courses[0];
  const present = Object.values(attendance).filter(Boolean).length;
  const total = activeCourse.students.length;
  const attPct = total > 0 ? Math.round((present / total) * 100) : 0;
  const atRisk = activeCourse.students.filter((s) => s.status !== 'active');
  const totalStudents = courses.reduce((a, c) => a + c.students.length, 0);

  const toggleAtt = (id: string) => setAttendance((p) => ({ ...p, [id]: !p[id] }));

  const handleSelectCourse = (id: string) => {
    setActiveCourseId(id);
    const c = courses.find((x) => x.id === id);
    setAttendance(c?.todayAttendance ?? {});
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const records = activeCourse.students.map((s) => ({
        inscripcion_id: s.inscripcionId,
        presente: attendance[s.inscripcionId] ?? false,
      }));
      await saveTodayAttendance(activeCourse.id, records);
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statsScroll} contentContainerStyle={styles.statsRow}>
        <StatCard icon="📚" label="Cursos" value={String(courses.length)} sub="Este semestre" />
        <StatCard icon="👥" label="Estudiantes" value={String(totalStudents)} sub="Total inscritos" />
        <StatCard icon="⚠️" label="En Riesgo" value={String(atRisk.length)} sub="En este curso" valueColor={Colors.orange} />
        <StatCard icon="📋" label="Asistencia Hoy" value={`${attPct}%`} sub={`${present} de ${total}`} valueColor={attPct >= 80 ? Colors.green : Colors.orange} />
      </ScrollView>

      <View style={styles.row}>
        <Card style={{ flex: 1, alignItems: 'center', gap: Space.md }}>
          <RingChart value={present} max={total || 1} size={88} color={Colors.green} label={`${attPct}%`} sublabel="presentes" />
          <Text style={styles.ringLabel}>{present} / {total} hoy</Text>
        </Card>

        <Card style={{ flex: 2 }}>
          <Text style={[styles.sectionTitle, { marginBottom: Space.md }]}>Mis Cursos</Text>
          {courses.map((c) => (
            <View key={c.id} style={styles.courseListRow}>
              <View style={[styles.courseDot, { backgroundColor: c.color }]} />
              <View style={{ flex: 1 }}>
                <Text style={styles.courseListName} numberOfLines={1}>{c.name}</Text>
                <Text style={styles.courseListSub}>{c.code} · {c.students.length} est.</Text>
              </View>
            </View>
          ))}
        </Card>
      </View>

      <Card>
        <View style={styles.sectionHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.sectionTitle}>Control de Asistencia</Text>
            <Text style={styles.dateText}>
              {new Date().toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' })}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.notasBtn}
            onPress={() => router.push({ pathname: '/teacher/course/[id]/grades', params: { id: String(activeCourse.id) } })}
          >
            <Text style={styles.notasBtnText}>📝 Notas</Text>
          </TouchableOpacity>
        </View>

        <CourseTabs courses={courses} activeId={activeCourseId} onSelect={handleSelectCourse} />

        {activeCourse.students.length === 0 ? (
          <View style={styles.emptyInline}>
            <Text style={styles.emptyText}>Sin estudiantes en este grupo</Text>
          </View>
        ) : (
          activeCourse.students.map((s) => (
            <StudentAttendanceRow
              key={s.inscripcionId}
              student={s}
              present={attendance[s.inscripcionId]}
              onToggle={() => toggleAtt(s.inscripcionId)}
            />
          ))
        )}

        {activeCourse.students.length > 0 && (
          <TouchableOpacity style={[styles.saveBtn, saving && { opacity: 0.7 }]} onPress={handleSave} disabled={saving}>
            {saving ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <Text style={styles.saveBtnText}>💾 Guardar Asistencia</Text>
            )}
          </TouchableOpacity>
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

  statsScroll: { marginHorizontal: -Space.lg },
  statsRow: { paddingHorizontal: Space.lg, gap: Space.md, flexDirection: 'row' },

  row: { flexDirection: 'row', gap: Space.md },
  ringLabel: { fontSize: Font.base, fontWeight: '600', color: Colors.text2 },

  sectionTitle: { fontSize: Font.md, fontWeight: '700', color: Colors.text },
  sectionHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: Space.md, gap: Space.sm },
  dateText: { fontSize: Font.sm, color: Colors.text2, marginTop: 2 },
  notasBtn: { backgroundColor: Colors.bg3, borderRadius: 10, paddingHorizontal: Space.md, paddingVertical: Space.sm },
  notasBtnText: { fontSize: Font.sm, fontWeight: '600', color: Colors.text },

  courseListRow: { flexDirection: 'row', alignItems: 'center', gap: Space.sm, paddingVertical: Space.sm, borderBottomWidth: 1, borderBottomColor: Colors.border },
  courseDot: { width: 8, height: 8, borderRadius: 4, flexShrink: 0 },
  courseListName: { fontSize: Font.sm, fontWeight: '500', color: Colors.text },
  courseListSub: { fontSize: Font.xs, color: Colors.text2 },

  saveBtn: {
    marginTop: Space.md, backgroundColor: Colors.accent, borderRadius: 10,
    padding: Space.md, alignItems: 'center',
    shadowColor: Colors.accent, shadowOpacity: 0.3, shadowRadius: 8, elevation: 3,
  },
  saveBtnText: { fontSize: Font.base, fontWeight: '700', color: Colors.white },
});
