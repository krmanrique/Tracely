import React from 'react';
import { Tabs } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { Colors, Font, Radius, Space } from '../../constants/theme';

function TabIcon({ emoji, label, focused }: { emoji: string; label: string; focused: boolean }) {
  return (
    <View style={[styles.tabIcon, focused && styles.tabIconFocused]}>
      <Text style={styles.tabEmoji}>{emoji}</Text>
      <Text style={[styles.tabLabel, focused && styles.tabLabelFocused]}>{label}</Text>
    </View>
  );
}

export default function TabLayout() {
  const { user } = useAuth();
  const { unread } = useData();
  const isStudent = user?.role === 'student';

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: false,
        tabBarActiveTintColor: Colors.accent,
        tabBarInactiveTintColor: Colors.text3,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => (
            <View>
              <TabIcon emoji="🏠" label="Inicio" focused={focused} />
              {unread > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{unread}</Text>
                </View>
              )}
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="grades"
        options={{
          href: isStudent ? undefined : null,
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="📊" label="Notas" focused={focused} />
          ),
        }}
      />

      <Tabs.Screen
        name="attendance"
        options={{
          href: isStudent ? undefined : null,
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="✅" label="Asistencia" focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Colors.white,
    borderTopColor: Colors.border,
    borderTopWidth: 1,
    height: 72,
    paddingBottom: 10,
    paddingTop: 8,
    shadowColor: '#6355A5',
    shadowOpacity: 0.10,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: -2 },
    elevation: 10,
  },
  tabIcon: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Space.xl,
    paddingVertical: Space.xs,
    borderRadius: Radius.md,
    gap: 2,
  },
  tabIconFocused: {
    backgroundColor: 'rgba(79,70,229,0.08)',
  },
  tabEmoji: { fontSize: 20 },
  tabLabel: { fontSize: Font.xs, fontWeight: '500', color: Colors.text3 },
  tabLabelFocused: { color: Colors.accent, fontWeight: '700' },
  badge: {
    position: 'absolute', top: -2, right: 2,
    backgroundColor: Colors.red, borderRadius: 10,
    minWidth: 16, height: 16,
    alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: { fontSize: 9, fontWeight: '800', color: Colors.white },
});
