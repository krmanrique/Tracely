import { useState } from "react";
import { useNavigate } from "react-router-dom";

// ── Íconos ────────────────────────────────────────────────────
const IcoDashboard = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
    <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
  </svg>
);
const IcoGrades = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
  </svg>
);
const IcoAttendance = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);
const IcoSettings = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
  </svg>
);
const IcoLogout = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);
const IcoClose = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);
const IcoEdit = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

// ── Modal de Configuración ────────────────────────────────────
function SettingsModal({ userData, role, onClose }) {
  const [name, setName] = useState(userData.name);
  const [editingName, setEditingName] = useState(false);
  const [lang, setLang] = useState("Español (Latinoamérica)");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => { setSaved(false); onClose(); }, 1200);
  };

  return (
    <div className="overlay" onClick={onClose}>
      <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="settings-modal-header">
          <h2 className="settings-modal-title">Configuración</h2>
          <button className="close-btn" onClick={onClose}><IcoClose /></button>
        </div>

        {/* Avatar */}
        <div className="settings-avatar-section">
          <div className="settings-avatar">
            {userData.avatar
              ? <img src={userData.avatar} alt="" style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} />
              : <span>{userData.name.split(" ").map(n => n[0]).join("").slice(0, 2)}</span>
            }
          </div>
          <button className="settings-avatar-btn">Cambiar foto</button>
        </div>

        {/* Campos */}
        <div className="settings-fields">
          {/* Nombre */}
          <div className="settings-field">
            <div className="settings-field-label">Nombre completo</div>
            {editingName ? (
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  className="settings-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoFocus
                />
                <button className="settings-save-inline" onClick={() => setEditingName(false)}>✓</button>
              </div>
            ) : (
              <div className="settings-field-value-row">
                <span className="settings-field-value">{name}</span>
                <button className="settings-edit-btn" onClick={() => setEditingName(true)}>
                  <IcoEdit /> Editar
                </button>
              </div>
            )}
          </div>

          {/* Correo */}
          <div className="settings-field">
            <div className="settings-field-label">Correo institucional</div>
            <div className="settings-field-value-row">
              <span className="settings-field-value">
                {role === "student"
                  ? `${userData.name.split(" ")[0].toLowerCase()}.${userData.name.split(" ")[1]?.toLowerCase() ?? ""}@unicatolica.edu.co`
                  : `${userData.name.split(" ").slice(-1)[0].toLowerCase()}@unicatolica.edu.co`}
              </span>
              <span className="settings-field-badge">Gestionado por la universidad</span>
            </div>
          </div>

          {/* ID */}
          <div className="settings-field">
            <div className="settings-field-label">ID institucional</div>
            <div className="settings-field-value-row">
              <span className="settings-field-value">{userData.id ?? (role === "student" ? "2021-0342" : "DOC-001")}</span>
            </div>
          </div>

          {/* Programa / Departamento */}
          <div className="settings-field">
            <div className="settings-field-label">{role === "student" ? "Programa académico" : "Departamento"}</div>
            <div className="settings-field-value-row">
              <span className="settings-field-value">
                {role === "student" ? (userData.program ?? "Tecnología en Desarrollo de Software") : (userData.department ?? "Ingeniería")}
              </span>
            </div>
          </div>

          {/* Idioma */}
          <div className="settings-field">
            <div className="settings-field-label">Idioma</div>
            <select className="settings-select" value={lang} onChange={(e) => setLang(e.target.value)}>
              <option>Español (Latinoamérica)</option>
              <option>Español (España)</option>
              <option>English</option>
            </select>
          </div>

          {/* Rol */}
          <div className="settings-field">
            <div className="settings-field-label">Rol</div>
            <div className="settings-field-value-row">
              <span className="settings-field-value" style={{ textTransform: "capitalize" }}>
                {role === "student" ? "Estudiante" : "Docente"}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="settings-modal-footer">
          <button className="settings-cancel-btn" onClick={onClose}>Cancelar</button>
          <button className={`settings-save-btn ${saved ? "saved" : ""}`} onClick={handleSave}>
            {saved ? "✓ Guardado" : "Guardar cambios"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Sidebar principal ─────────────────────────────────────────
export default function Sidebar({ role, page, setPage, userData, unread, onLogout }) {
  const navigate = useNavigate();
  const [showSettings, setShowSettings] = useState(false);

  const studentNav = [
    { id: "dashboard", icon: <IcoDashboard />, label: "Dashboard", path: "/student/dashboard" },
    { id: "grades",    icon: <IcoGrades />,    label: "Notas",      path: "/student/grades" },
    { id: "attendance",icon: <IcoAttendance />,label: "Asistencia", path: "/student/attendance" },
  ];
  const teacherNav = [
    { id: "dashboard", icon: <IcoDashboard />, label: "Dashboard", path: "/teacher/dashboard" },
  ];
  const nav = role === "student" ? studentNav : teacherNav;

  const handleNav = (item) => {
    setPage(item.id);
    navigate(item.path);
  };

  const handleLogout = () => {
    onLogout();
    navigate("/login", { replace: true });
  };

  return (
    <>
      <aside className="sidebar">
        {/* Avatar + nombre */}
        <div className="sidebar-avatar-wrap">
          <div className="sidebar-avatar">
            {userData.avatar
              ? <img src={userData.avatar} alt="" style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} />
              : <span>{userData.name.split(" ").map(n => n[0]).join("").slice(0, 2)}</span>
            }
          </div>
          <div className="sidebar-name">{userData.name.split(" ").slice(0, 2).join(" ")}</div>
          <div className="sidebar-role">
            {role === "student"
              ? (userData.program?.split(" ")[0] ?? "Estudiante")
              : (userData.department?.split(" ")[0] ?? "Docente")}
          </div>
        </div>

        <div className="sidebar-divider" />

        {/* Navegación */}
        <div style={{ width: "100%" }}>
          <div className="nav-label">Navegación</div>
          {nav.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${page === item.id ? "active" : ""}`}
              onClick={() => handleNav(item)}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}
              {item.id === "dashboard" && unread > 0 && (
                <span className="nav-badge">{unread}</span>
              )}
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className="sidebar-footer">
          <button className="sidebar-footer-btn" onClick={() => setShowSettings(true)}>
            <span className="nav-icon"><IcoSettings /></span>
            <span>Configuración</span>
          </button>
          <button className="sidebar-footer-btn logout-btn" onClick={handleLogout}>
            <span className="nav-icon"><IcoLogout /></span>
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Modal de configuración */}
      {showSettings && (
        <SettingsModal
          userData={userData}
          role={role}
          onClose={() => setShowSettings(false)}
        />
      )}
    </>
  );
}
