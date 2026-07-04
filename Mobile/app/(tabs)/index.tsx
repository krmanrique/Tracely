import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppHeader from '../../components/layout/AppHeader';
import StudentDashboardScreen from '../../screens/student/DashboardScreen';
import TeacherDashboardScreen from '../../screens/teacher/DashboardScreen';
import { useAuth } from '../../context/AuthContext';
import { Colors } from '../../constants/theme';

export default function DashboardTab() {
  const { user } = useAuth();

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <AppHeader title="Dashboard" />
      <View style={styles.body}>
        {user?.role === 'teacher' ? <TeacherDashboardScreen /> : <StudentDashboardScreen />}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.gradientStart },
  body: { flex: 1, backgroundColor: Colors.bg },
});
