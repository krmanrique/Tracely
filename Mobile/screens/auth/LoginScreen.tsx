import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../context/AuthContext';
import { Colors, Font, Space, Radius } from '../../constants/theme';

export default function LoginScreen() {
  const { login, loggingIn } = useAuth();
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setError('');
    if (!id || !password) {
      setError('Completa tu ID institucional y tu contraseña.');
      return;
    }
    try {
      await login(id.trim(), password);
    } catch (e: any) {
      setError(e?.message ?? 'ID o contraseña incorrectos.');
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <LinearGradient
          colors={[Colors.gradientStart, Colors.gradientEnd]}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          <View style={styles.brand}>
            <Text style={styles.brandText}>Tracely</Text>
          </View>
          <Text style={styles.heroTitle}>Bienvenido de vuelta</Text>
          <Text style={styles.heroSub}>Ingresa tus credenciales institucionales</Text>
        </LinearGradient>

        <View style={styles.form}>
          {error !== '' && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <View style={styles.field}>
            <Text style={styles.label}>ID institucional</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej: 2021-0342"
              placeholderTextColor={Colors.text3}
              autoCapitalize="none"
              autoCorrect={false}
              value={id}
              onChangeText={(t) => { setId(t); setError(''); }}
              onSubmitEditing={handleLogin}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Contraseña</Text>
            <View style={styles.passwordRow}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="Ingresa tu contraseña"
                placeholderTextColor={Colors.text3}
                secureTextEntry={!showPass}
                value={password}
                onChangeText={(t) => { setPassword(t); setError(''); }}
                onSubmitEditing={handleLogin}
              />
              <TouchableOpacity onPress={() => setShowPass((v) => !v)} style={styles.eyeBtn}>
                <Text style={styles.eyeText}>{showPass ? 'Ocultar' : 'Ver'}</Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.submitBtn, loggingIn && styles.submitBtnDisabled]}
            onPress={handleLogin}
            disabled={loggingIn}
          >
            {loggingIn ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <Text style={styles.submitText}>Iniciar sesión</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 1, backgroundColor: Colors.bg },
  hero: { paddingTop: 84, paddingBottom: Space.xl, paddingHorizontal: Space.lg, gap: Space.sm },
  brand: { marginBottom: Space.md },
  brandText: { fontSize: Font.xxl, fontWeight: '800', color: Colors.white, letterSpacing: -0.5 },
  heroTitle: { fontSize: Font.xxl, fontWeight: '700', color: Colors.white },
  heroSub: { fontSize: Font.base, color: 'rgba(255,255,255,0.85)' },

  form: { padding: Space.lg, gap: Space.lg, marginTop: -Space.lg },

  errorBox: {
    backgroundColor: 'rgba(220,38,38,0.08)', borderWidth: 1, borderColor: 'rgba(220,38,38,0.25)',
    borderRadius: Radius.md, padding: Space.md,
  },
  errorText: { color: Colors.red, fontSize: Font.sm, fontWeight: '500' },

  field: { gap: Space.xs },
  label: { fontSize: Font.sm, fontWeight: '600', color: Colors.text2 },
  input: {
    backgroundColor: Colors.card, borderWidth: 1.5, borderColor: Colors.border,
    borderRadius: Radius.md, paddingHorizontal: Space.md, paddingVertical: Space.md,
    fontSize: Font.base, color: Colors.text,
  },
  passwordRow: { flexDirection: 'row', alignItems: 'center', gap: Space.sm },
  eyeBtn: { paddingHorizontal: Space.sm },
  eyeText: { color: Colors.accent, fontWeight: '600', fontSize: Font.sm },

  submitBtn: {
    backgroundColor: Colors.accent, borderRadius: Radius.md, paddingVertical: Space.md,
    alignItems: 'center', justifyContent: 'center', marginTop: Space.sm,
    shadowColor: Colors.accent, shadowOpacity: 0.3, shadowRadius: 10, elevation: 3,
  },
  submitBtnDisabled: { opacity: 0.7 },
  submitText: { color: Colors.white, fontSize: Font.base, fontWeight: '700' },
});
