import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useData } from '../../context/DataContext';
import { Colors, Font, Space, Radius } from '../../constants/theme';
import ProfileModal from './ProfileModal';

export default function AppHeader({ title }: { title: string }) {
  const { profile, semestre, setSemestre, semestres } = useData();
  const [showProfile, setShowProfile] = useState(false);

  return (
    <LinearGradient
      colors={[Colors.gradientStart, Colors.gradientEnd]}
      start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
      style={styles.header}
    >
      <View style={styles.topRow}>
        <TouchableOpacity style={styles.avatarWrap} onPress={() => setShowProfile(true)}>
          <View style={[styles.avatar, { backgroundColor: profile.avatarColor }]}>
            <Text style={styles.avatarText}>{profile.initials}</Text>
          </View>
          <View>
            <Text style={styles.name}>{profile.name || '—'}</Text>
            <Text style={styles.sub}>{profile.sub}</Text>
          </View>
        </TouchableOpacity>
      </View>

      <Text style={styles.title}>{title}</Text>

      {semestres.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.semRow}>
          {semestres.map((s) => (
            <TouchableOpacity
              key={s}
              style={[styles.semChip, semestre === s && styles.semChipActive]}
              onPress={() => setSemestre(s)}
            >
              <Text style={[styles.semChipText, semestre === s && styles.semChipTextActive]}>{s}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      <ProfileModal visible={showProfile} onClose={() => setShowProfile(false)} />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: 56,
    paddingBottom: Space.lg,
    paddingHorizontal: Space.lg,
    gap: Space.sm,
  },
  topRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: Space.xs,
  },
  avatarWrap: { flexDirection: 'row', alignItems: 'center', gap: Space.md },
  avatar: {
    width: 40, height: 40, borderRadius: 20,
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.5)',
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: Font.sm, fontWeight: '700', color: Colors.white },
  name: { fontSize: Font.base, fontWeight: '700', color: Colors.white },
  sub: { fontSize: Font.xs, color: 'rgba(255,255,255,0.65)', marginTop: 1 },

  title: { fontSize: Font.xxl, fontWeight: '700', color: Colors.white, letterSpacing: -0.5 },

  semRow: { flexDirection: 'row', gap: Space.sm },
  semChip: {
    paddingHorizontal: Space.md, paddingVertical: 5,
    borderRadius: Radius.full, borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  semChipActive: { backgroundColor: 'rgba(255,255,255,0.22)', borderColor: 'rgba(255,255,255,0.7)' },
  semChipText: { fontSize: Font.xs, fontWeight: '600', color: 'rgba(255,255,255,0.65)' },
  semChipTextActive: { color: Colors.white },
});
