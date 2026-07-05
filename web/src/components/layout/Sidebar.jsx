import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import profileDefault from '../../assets/profile.png';

// ── Íconos ────────────────────────────────────────────────────
const IcoDashboard  = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>;
const IcoGrades     = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>;
const IcoAttendance = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>;
const IcoSettings   = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>;
const IcoLogout     = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>;
const IcoClose      = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const IcoEdit       = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
const IcoCamera     = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg>;

// ── Utilidades de foto ─────────────────────────────────────────
const PHOTO_PREFIX = 'tracely_photo_';

function getStoredPhoto(userId) {
  // Michael tiene su foto por defecto
  if (userId === '2021-0342') {
    const stored = localStorage.getItem(PHOTO_PREFIX + userId);
    return stored || profileDefault;
  }
  return localStorage.getItem(PHOTO_PREFIX + userId) || null;
}

function savePhoto(userId, base64) {
  localStorage.setItem(PHOTO_PREFIX + userId, base64);
}

// ── Modal de Configuración ────────────────────────────────────
function SettingsModal({ userData, role, onClose }) {
  const [name,        setName]        = useState(userData.name);
  const [editingName, setEditingName] = useState(false);
  const [lang,        setLang]        = useState('Español (Latinoamérica)');
  const [saved,       setSaved]       = useState(false);
  const [saving,      setSaving]      = useState(false);
  const [saveError,   setSaveError]   = useState(null);
  const [photo,       setPhoto]       = useState(() => getStoredPhoto(userData.id));
  const fileRef = useRef(null);

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { alert('La imagen no debe superar 2MB'); return; }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const base64 = ev.target.result;
      setPhoto(base64);
      savePhoto(userData.id, base64);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveError(null);
    try {
      const token = localStorage.getItem('tracely_token');
      const res = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/users/${userData.id}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ nombre: name }),
        }
      );
      if (!res.ok) throw new Error('Error al guardar');
      // Actualizar la sesión en localStorage para que se refleje en sidebar
      const session = JSON.parse(localStorage.getItem('tracely_session') || '{}');
      session.nombre = name;
      localStorage.setItem('tracely_session', JSON.stringify(session));
      setSaved(true);
      // Recargar la página para que el sidebar muestre el nombre actualizado
      setTimeout(() => { window.location.reload(); }, 800);
    } catch (e) {
      setSaveError('No se pudo guardar. Intenta de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  const correo = userData.correo
    || (role === 'student'
      ? `${name.split(' ')[0]?.toLowerCase()}.${name.split(' ')[1]?.toLowerCase() ?? ''}@unicatolica.edu.co`
      : `${name.split(' ').slice(-1)[0]?.toLowerCase()}@unicatolica.edu.co`);

  return (
    <div className="overlay" onClick={onClose}>
      <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
        <div className="settings-modal-header">
          <h2 className="settings-modal-title">Configuración</h2>
          <button className="close-btn" onClick={onClose}><IcoClose /></button>
        </div>

        {/* Avatar con botón de cámara */}
        <div className="settings-avatar-section">
          <div style={{ position: 'relative', width: 80, height: 80 }}>
            <div className="settings-avatar">
              {photo
                ? <img src={photo} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                : <span>{name.split(' ').map(n => n[0]).join('').slice(0, 2)}</span>
              }
            </div>
            {/* Botón de cámara superpuesto */}
            <button
              onClick={() => fileRef.current?.click()}
              style={{
                position: 'absolute', bottom: 0, right: 0,
                width: 26, height: 26, borderRadius: '50%',
                background: 'var(--accent)', border: '2px solid white',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: 'white',
              }}
              title="Cambiar foto"
            >
              <IcoCamera />
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handlePhotoChange}
            />
          </div>
          <span style={{ fontSize: 12, color: 'var(--text3)', marginTop: 4 }}>
            Haz clic en la cámara para cambiar
          </span>
        </div>

        <div className="settings-fields">
          {/* Nombre */}
          <div className="settings-field">
            <div className="settings-field-label">Nombre completo</div>
            {editingName ? (
              <div style={{ display: 'flex', gap: 8 }}>
                <input className="settings-input" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
                <button className="settings-save-inline" onClick={() => setEditingName(false)}>✓</button>
              </div>
            ) : (
              <div className="settings-field-value-row">
                <span className="settings-field-value">{name}</span>
                <button className="settings-edit-btn" onClick={() => setEditingName(true)}><IcoEdit /> Editar</button>
              </div>
            )}
          </div>

          {/* Correo */}
          <div className="settings-field">
            <div className="settings-field-label">Correo institucional</div>
            <div className="settings-field-value-row">
              <span className="settings-field-value">{correo}</span>
              <span className="settings-field-badge">Gestionado por la universidad</span>
            </div>
          </div>

          {/* ID */}
          <div className="settings-field">
            <div className="settings-field-label">ID institucional</div>
            <div className="settings-field-value-row">
              <span className="settings-field-value">{userData.id}</span>
            </div>
          </div>

          {/* Programa / Departamento */}
          <div className="settings-field">
            <div className="settings-field-label">{role === 'student' ? 'Programa académico' : 'Departamento'}</div>
            <div className="settings-field-value-row">
              <span className="settings-field-value">
                {role === 'student' ? (userData.program ?? 'Tecnología en Desarrollo de Software') : (userData.department ?? 'Ingeniería')}
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
              <span className="settings-field-value" style={{ textTransform: 'capitalize' }}>
                {role === 'student' ? 'Estudiante' : role === 'teacher' ? 'Docente' : 'Administrador'}
              </span>
            </div>
          </div>
        </div>

        {saveError && (
          <div style={{ color: 'var(--red)', fontSize: 12, padding: '0 28px 12px', textAlign: 'center' }}>
            {saveError}
          </div>
        )}
        <div className="settings-modal-footer">
          <button className="settings-cancel-btn" onClick={onClose}>Cancelar</button>
          <button className={`settings-save-btn ${saved ? 'saved' : ''}`} onClick={handleSave} disabled={saving}>
            {saving ? 'Guardando...' : saved ? '✓ Guardado' : 'Guardar cambios'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Avatar con foto de perfil ─────────────────────────────────
function AvatarImg({ userId, name, size = 44 }) {
  const [photo, setPhoto] = useState(() => getStoredPhoto(userId));

  // Refrescar si cambia el usuario
  useState(() => { setPhoto(getStoredPhoto(userId)); }, [userId]);

  return photo
    ? <img src={photo} alt={name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
    : <span>{name?.split(' ').map(n => n[0]).join('').slice(0, 2)}</span>;
}

// ── Sidebar principal ─────────────────────────────────────────
export default function Sidebar({ role, page, setPage, userData, unread, onLogout }) {
  const navigate = useNavigate();
  const [showSettings, setShowSettings] = useState(false);
  const [photoKey, setPhotoKey]         = useState(0); // fuerza re-render del avatar

  const studentNav = [
    { id: 'dashboard',  icon: <IcoDashboard />,  label: 'Dashboard',  path: '/student/dashboard' },
    { id: 'grades',     icon: <IcoGrades />,     label: 'Notas',      path: '/student/grades' },
    { id: 'attendance', icon: <IcoAttendance />, label: 'Asistencia', path: '/student/attendance' },
  ];
  const teacherNav = [{ id: 'dashboard', icon: <IcoDashboard />, label: 'Dashboard', path: '/teacher/dashboard' }];
  const adminNav   = [{ id: 'dashboard', icon: <IcoDashboard />, label: 'Dashboard', path: '/admin/dashboard' }];
  const nav = role === 'student' ? studentNav : role === 'teacher' ? teacherNav : adminNav;

  const handleNav = (item) => { setPage(item.id); navigate(item.path); };
  const handleLogout = () => {
    onLogout();
    // replace: true reemplaza la entrada actual del historial
    // Así al presionar atrás no vuelve a la sesión anterior
    navigate('/login', { replace: true });
    // Limpiar el historial del navegador
    window.history.replaceState(null, '', '/login');
  };

  const photo = getStoredPhoto(userData.id);

  return (
    <>
      <aside className="sidebar">
        <div className="sidebar-avatar-wrap">
          <div className="sidebar-avatar" key={photoKey}>
            {photo
              ? <img src={photo} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
              : <span>{userData.name?.split(' ').map(n => n[0]).join('').slice(0, 2)}</span>
            }
          </div>
          <div className="sidebar-name">{userData.name?.split(' ').slice(0, 2).join(' ')}</div>
          <div className="sidebar-role">
            {role === 'student' ? (userData.program?.split(' ')[0] ?? 'Estudiante')
              : role === 'teacher' ? (userData.department?.split(' ')[0] ?? 'Docente')
              : 'Admin'}
          </div>
        </div>

        <div className="sidebar-divider" />

        <div style={{ width: '100%' }}>
          <div className="nav-label">Navegación</div>
          {nav.map((item) => (
            <button key={item.id} className={`nav-item ${page === item.id ? 'active' : ''}`} onClick={() => handleNav(item)}>
              <span className="nav-icon">{item.icon}</span>
              {item.label}
              {item.id === 'dashboard' && unread > 0 && <span className="nav-badge">{unread}</span>}
            </button>
          ))}
        </div>

        <div className="sidebar-footer">
          <button className="sidebar-footer-btn" onClick={() => setShowSettings(true)}>
            <span className="nav-icon"><IcoSettings /></span><span>Configuración</span>
          </button>
          <button className="sidebar-footer-btn logout-btn" onClick={handleLogout}>
            <span className="nav-icon"><IcoLogout /></span><span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {showSettings && (
        <SettingsModal
          userData={userData}
          role={role}
          onClose={() => { setShowSettings(false); setPhotoKey(k => k + 1); }}
        />
      )}
    </>
  );
}
