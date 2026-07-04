import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Pressable } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { Colors, Font, Space, Radius } from '../../constants/theme';

export default function ProfileModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { user, logout } = useAuth();
  const { profile } = useData();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <View style={[styles.avatar, { backgroundColor: profile.avatarColor }]}>
            <Text style={styles.avatarText}>{profile.initials}</Text>
          </View>
          <Text style={styles.name}>{profile.name}</Text>
          <Text style={styles.sub}>{profile.sub}</Text>

          <View style={styles.divider} />

          <View style={styles.row}>
            <Text style={styles.rowLabel}>Correo</Text>
            <Text style={styles.rowValue}>{user?.email}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>ID institucional</Text>
            <Text style={styles.rowValue}>{profile.idLabel}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Rol</Text>
            <Text style={styles.rowValue}>{user?.role === 'teacher' ? 'Docente' : 'Estudiante'}</Text>
          </View>

          <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
            <Text style={styles.logoutText}>Cerrar sesión</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeText}>Cerrar</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(30,27,58,0.45)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: Colors.card, borderTopLeftRadius: Radius.lg, borderTopRightRadius: Radius.lg,
    padding: Space.xl, alignItems: 'center', gap: Space.xs,
  },
  avatar: {
    width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center', marginBottom: Space.sm,
  },
  avatarText: { fontSize: Font.xl, fontWeight: '700', color: Colors.white },
  name: { fontSize: Font.md, fontWeight: '700', color: Colors.text },
  sub: { fontSize: Font.sm, color: Colors.text2 },
  divider: { height: 1, backgroundColor: Colors.border, alignSelf: 'stretch', marginVertical: Space.md },

  row: { flexDirection: 'row', justifyContent: 'space-between', alignSelf: 'stretch', paddingVertical: Space.xs },
  rowLabel: { fontSize: Font.sm, color: Colors.text3 },
  rowValue: { fontSize: Font.sm, color: Colors.text, fontWeight: '600' },

  logoutBtn: {
    marginTop: Space.lg, alignSelf: 'stretch', backgroundColor: 'rgba(220,38,38,0.08)',
    borderRadius: Radius.md, paddingVertical: Space.md, alignItems: 'center',
  },
  logoutText: { color: Colors.red, fontWeight: '700', fontSize: Font.base },
  closeBtn: { marginTop: Space.sm, paddingVertical: Space.sm },
  closeText: { color: Colors.text3, fontWeight: '600', fontSize: Font.sm },
});
