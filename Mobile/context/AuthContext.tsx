import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import * as authService from '../services/authService';
import type { AuthUser } from '../services/authService';

interface AuthContextType {
  user: AuthUser | null;
  restoring: boolean;
  loggingIn: boolean;
  login: (id: string, password: string) => Promise<AuthUser>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [restoring, setRestoring] = useState(true);
  const [loggingIn, setLoggingIn] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        if (await authService.hasSession()) {
          const me = await authService.getMe();
          setUser(me);
        }
      } catch {
        await authService.logout();
      } finally {
        setRestoring(false);
      }
    })();
  }, []);

  const login = useCallback(async (id: string, password: string) => {
    setLoggingIn(true);
    try {
      await authService.login(id, password);
      // getMe() trae el perfil completo (incluye carrera), a diferencia del login
      const me = await authService.getMe();
      if (me.role !== 'student' && me.role !== 'teacher') {
        await authService.logout();
        throw new Error('Este rol todavía no está disponible en la app móvil.');
      }
      setUser(me);
      return me;
    } finally {
      setLoggingIn(false);
    }
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, restoring, loggingIn, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
