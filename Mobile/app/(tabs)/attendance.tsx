import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppHeader from '../../components/layout/AppHeader';
import AttendanceScreen from '../../screens/student/AttendanceScreen';
import { Colors } from '../../constants/theme';

export default function AttendanceTab() {
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <AppHeader title="Asistencia" />
      <View style={styles.body}>
        <AttendanceScreen />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.gradientStart },
  body: { flex: 1, backgroundColor: Colors.bg },
});
