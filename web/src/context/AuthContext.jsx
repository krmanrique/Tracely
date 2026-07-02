import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

const SESSION_KEY = "tracely_session";

// Lee la sesión guardada al iniciar (persiste entre recargas)
function loadSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => loadSession());
  // user = { id: "12345", role: "student" } | null

  const login = (id, role) => {
    const session = { id, role };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    setUser(session);
  };

  const logout = () => {
    localStorage.removeItem(SESSION_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
