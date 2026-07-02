import { createContext, useContext, useState } from "react";

const AppContext = createContext(null);

// Persiste semestre seleccionado entre recargas
function loadSemestre() {
  try {
    return localStorage.getItem("tracely_semestre") || "2025-1";
  } catch {
    return "2025-1";
  }
}

// Deduce la página activa desde la URL actual (evita reseteo al recargar)
function pageFromPath() {
  const path = window.location.pathname;
  if (path.includes("/grades"))     return "grades";
  if (path.includes("/attendance")) return "attendance";
  return "dashboard";
}

export function AppProvider({ children }) {
  const [semestre, setSemestreState] = useState(() => loadSemestre());
  const [page, setPage] = useState(() => pageFromPath());

  const setSemestre = (s) => {
    localStorage.setItem("tracely_semestre", s);
    setSemestreState(s);
  };

  return (
    <AppContext.Provider value={{ semestre, setSemestre, page, setPage }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  return useContext(AppContext);
}
