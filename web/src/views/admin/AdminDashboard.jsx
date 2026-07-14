import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, AlertTriangle, Loader2, GraduationCap, Presentation, BookOpen, BarChart3, CheckCircle2, Lock, NotebookPen, User, Settings, Check, UserPlus, Pencil, Trash2, Search, Inbox } from 'lucide-react';
import { attColor, gradeColor } from '../../utils/helpers';
import { useAuth } from '../../context/AuthContext';
import StudentsTab from './StudentsTab';
import CreateUserModal from './CreateUserModal';
import ProgramDetailView from './ProgramDetailView';
import ConfirmModal from '../../components/common/ConfirmModal';
import { fadeInUp } from '../../utils/motionVariants';
import {
  getTeachers, getStudents,
  getUsers, updateUser, deleteUser, getOverview, getRecentActivity, getProgramStats,
} from '../../services/adminAcademicService';

const labelStyle = { fontSize: 11, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 5 };

// ── Modal editar usuario (nombre/correo/contraseña) — Docentes y Administradores ──
function EditUserModal({ user, onClose, onSuccess }) {
  const [nombre, setNombre]     = useState(user.name);
  const [correo, setCorreo]     = useState(user.correo ?? '');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(null);

  const handleSubmit = async () => {
    if (password && password.length < 6) return setError('La contraseña debe tener al menos 6 caracteres');
    setLoading(true); setError(null);
    try {
      const payload = { nombre, correo };
      if (password) payload.password = password;
      await updateUser(user.id, payload);
      onSuccess('Usuario actualizado');
      onClose();
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="overlay" onClick={onClose}>
      <div className="settings-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 420 }}>
        <div className="settings-modal-header">
          <h2 className="settings-modal-title">Editar usuario</h2>
          <button className="close-btn" onClick={onClose}><X size={14} strokeWidth={2.5} /></button>
        </div>
        <div style={{ padding: '16px 28px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {error && <div style={{ color: 'var(--red)', fontSize: 13, background: 'var(--bg3)', padding: '8px 12px', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 6 }}><AlertTriangle size={14} /> {error}</div>}
          <div>
            <div style={labelStyle}>Nombre completo</div>
            <input className="settings-input" style={{ width: '100%', boxSizing: 'border-box' }} value={nombre} onChange={(e) => setNombre(e.target.value)} />
          </div>
          <div>
            <div style={labelStyle}>Correo institucional</div>
            <input className="settings-input" style={{ width: '100%', boxSizing: 'border-box' }} value={correo} onChange={(e) => setCorreo(e.target.value)} />
          </div>
          <div>
            <div style={labelStyle}>Nueva contraseña</div>
            <input type="password" className="settings-input" style={{ width: '100%', boxSizing: 'border-box' }}
              placeholder="Dejar en blanco para no cambiarla" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
        </div>
        <div className="settings-modal-footer">
          <button className="settings-cancel-btn" onClick={onClose}>Cancelar</button>
          <button className="settings-save-btn" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Tab genérica de personas (Docentes / Administradores) ───────
function PeopleTab({ rol, extraColumns, onToast }) {
  const { user: currentUser } = useAuth();
  const [people, setPeople]     = useState([]);
  const [search, setSearch]     = useState('');
  const [loading, setLoading]   = useState(true);
  const [editing, setEditing]   = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [showCreate, setShowCreate] = useState(false);

  const load = (q) => {
    setLoading(true);
    const fetcher = rol === 'docente' ? getTeachers(q) : getUsers({ rol, search: q });
    fetcher
      .then((data) => {
        const mapped = rol === 'docente'
          ? data.map((t) => ({ id: t.usuario_id, name: t.usuario?.nombre, correo: t.usuario?.correo, courses: t.courses, students: t.students }))
          : data.map((u) => ({ id: u.id_institucional, name: u.nombre, correo: u.correo }));
        setPeople(mapped);
      })
      .catch(() => setPeople([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const t = setTimeout(() => load(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const handleDeleteConfirm = async () => {
    const target = deleting;
    setDeleting(null);
    try {
      await deleteUser(target.id);
      onToast?.(`${target.name} eliminado`);
      load(search);
    } catch (e) { onToast?.(e.message); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {showCreate && (
        <CreateUserModal role={rol} onClose={() => setShowCreate(false)} onSuccess={(msg) => { onToast?.(msg); load(search); }} />
      )}
      {editing && (
        <EditUserModal user={editing} onClose={() => setEditing(null)} onSuccess={(msg) => { onToast?.(msg); load(search); }} />
      )}
      {deleting && (
        <ConfirmModal
          title={`¿Eliminar a ${deleting.name}?`}
          message={rol === 'docente' ? 'Esto también borrará las materias que dicta y toda su información académica asociada.' : 'Esta acción no se puede deshacer.'}
          danger confirmLabel="Eliminar"
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleting(null)}
        />
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: 360 }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text3)' }} />
          <input className="input-field" style={{ width: '100%', paddingLeft: 32, boxSizing: 'border-box' }}
            placeholder="Buscar por nombre, ID o correo..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => setShowCreate(true)}>
          <UserPlus size={13} /> Crear {rol === 'docente' ? 'docente' : 'administrador'}
        </button>
      </div>

      {loading ? (
        <div className="empty"><div className="empty-icon"><Loader2 className="spin" /></div>Cargando...</div>
      ) : people.length === 0 ? (
        <div className="empty"><div className="empty-icon"><Inbox /></div>Sin resultados</div>
      ) : (
        <motion.div variants={fadeInUp} initial="hidden" animate="show" className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="table">
            <thead>
              <tr>
                <th style={{ padding: '14px 16px 10px' }}>{rol === 'docente' ? 'Docente' : 'Administrador'}</th>
                <th>Correo</th>
                {extraColumns?.map((c) => <th key={c.key}>{c.label}</th>)}
                <th></th>
              </tr>
            </thead>
            <tbody>
              {people.map((p) => (
                <tr key={p.id}>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,var(--sidebar),var(--accent))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: 'white', flexShrink: 0 }}>
                        {(p.name ?? '').split(' ').map((n) => n[0]).join('').slice(0, 2)}
                      </div>
                      <div><div style={{ fontWeight: 600, fontSize: 13 }}>{p.name}</div><div style={{ fontSize: 11, color: 'var(--text3)' }}>{p.id}</div></div>
                    </div>
                  </td>
                  <td style={{ fontSize: 12, color: 'var(--text2)' }}>{p.correo}</td>
                  {extraColumns?.map((c) => <td key={c.key} style={{ fontSize: 13 }}>{p[c.key]}</td>)}
                  <td>
                    <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => setEditing(p)} title="Editar"><Pencil size={12} /></button>
                      {p.id === currentUser?.id ? (
                        <button className="btn btn-ghost btn-sm" disabled title="No puedes eliminar tu propia cuenta" style={{ color: 'var(--text3)', cursor: 'not-allowed' }}><Trash2 size={12} /></button>
                      ) : (
                        <button className="btn btn-ghost btn-sm" onClick={() => setDeleting(p)} title="Eliminar" style={{ color: 'var(--red)' }}><Trash2 size={12} /></button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      )}
    </div>
  );
}

// ── Tab Programas (lista clicable → detalle con materias/estudiantes) ──
function ProgramsTab({ onToast }) {
  const [stats, setStats]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const colors = ['#1C3992', '#059669', '#D97706', '#DB2777', '#4861B6'];

  useEffect(() => {
    getProgramStats().then(setStats).catch(() => setStats([])).finally(() => setLoading(false));
  }, []);

  if (selected) {
    return <ProgramDetailView program={selected} onBack={() => setSelected(null)} onToast={onToast} />;
  }

  if (loading) return <div className="empty"><div className="empty-icon"><Loader2 className="spin" /></div>Cargando...</div>;
  if (stats.length === 0) return <div className="empty"><div className="empty-icon"><Inbox /></div>Sin programas registrados</div>;

  return (
    <div className="grid grid-2" style={{ gap: 14 }}>
      {stats.map((p, i) => (
        <div key={p.id} className="card" style={{ padding: 20, cursor: 'pointer' }} onClick={() => setSelected(p)}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: colors[i % colors.length] }} />
            <div style={{ fontWeight: 700, fontSize: 14 }}>{p.name}</div>
          </div>
          <div className="grid grid-3" style={{ gap: 10 }}>
            <div><div className="stat-label">Estudiantes</div><div style={{ fontSize: 22, fontWeight: 700 }}>{p.students.toLocaleString()}</div></div>
            <div><div className="stat-label">GPA</div><div style={{ fontSize: 22, fontWeight: 700, color: gradeColor(p.avgGpa) }}>{p.avgGpa.toFixed(1)}</div></div>
            <div><div className="stat-label">Retención</div><div style={{ fontSize: 22, fontWeight: 700, color: attColor(p.retention) }}>{p.retention}%</div></div>
          </div>
          <div className="progress-bar" style={{ marginTop: 12 }}>
            <div className="progress-fill" style={{ width: `${p.retention}%`, background: colors[i % colors.length] }} />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Tab Resumen (overview) ───────────────────────────────────
function OverviewTab() {
  const [stats, setStats]     = useState(null);
  const [activity, setActivity] = useState([]);
  const [atRisk, setAtRisk]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([getOverview(), getRecentActivity(), getStudents()])
      .then(([ov, act, students]) => {
        setStats(ov);
        setActivity(act);
        setAtRisk(students.filter((s) => s.risk !== 'low').sort((a, b) => (a.attendance ?? 100) - (b.attendance ?? 100)).slice(0, 6));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const severityColor = { critical: 'var(--red)', high: 'var(--orange)', medium: 'var(--gold)', info: 'var(--accent)', success: 'var(--green)' };
  const activityIcon  = { alert: <AlertTriangle size={16} />, grade: <NotebookPen size={16} />, user: <User size={16} />, system: <Settings size={16} /> };

  if (loading || !stats) return <div className="empty"><div className="empty-icon"><Loader2 className="spin" /></div>Cargando resumen...</div>;

  return (
    <motion.div key="overview" variants={fadeInUp} initial="hidden" animate="show" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div className="grid grid-4" style={{ gap: 14 }}>
        <div className="stat-card"><div className="stat-icon"><GraduationCap /></div><div className="stat-label">Estudiantes</div><div className="stat-val">{stats.totalStudents.toLocaleString()}</div><div className="stat-sub">Matriculados</div></div>
        <div className="stat-card"><div className="stat-icon"><Presentation /></div><div className="stat-label">Docentes</div><div className="stat-val">{stats.totalTeachers}</div><div className="stat-sub">Vinculados</div></div>
        <div className="stat-card"><div className="stat-icon"><BookOpen /></div><div className="stat-label">Cursos</div><div className="stat-val">{stats.totalCourses}</div><div className="stat-sub">Semestre {stats.activeSemester}</div></div>
        <div className="stat-card"><div className="stat-icon" style={{ color: 'var(--orange)' }}><AlertTriangle /></div><div className="stat-label">En Riesgo</div><div className="stat-val" style={{ color: 'var(--orange)' }}>{stats.atRiskCount}</div><div className="stat-sub">Atención</div></div>
      </div>
      <div className="grid grid-3" style={{ gap: 14 }}>
        <div className="stat-card" style={{ display: 'flex', alignItems: 'center', gap: 16 }}><div style={{ color: 'var(--accent)' }}><BarChart3 size={32} /></div><div><div className="stat-label">GPA Promedio</div><div style={{ fontSize: 28, fontWeight: 700, color: gradeColor(stats.avgGpa) }}>{stats.avgGpa.toFixed(1)}</div><div className="stat-sub">Institución</div></div></div>
        <div className="stat-card" style={{ display: 'flex', alignItems: 'center', gap: 16 }}><div style={{ color: 'var(--green)' }}><CheckCircle2 size={32} /></div><div><div className="stat-label">Asistencia Global</div><div style={{ fontSize: 28, fontWeight: 700, color: attColor(stats.attendanceGlobal) }}>{stats.attendanceGlobal}%</div><div className="stat-sub">Promedio</div></div></div>
        <div className="stat-card" style={{ display: 'flex', alignItems: 'center', gap: 16 }}><div style={{ color: 'var(--green)' }}><Lock size={32} /></div><div><div className="stat-label">Retención</div><div style={{ fontSize: 28, fontWeight: 700, color: 'var(--green)' }}>{stats.retentionRate}%</div><div className="stat-sub">Semestre actual</div></div></div>
      </div>
      <div className="grid grid-2-1" style={{ gap: 14 }}>
        <div className="card" style={{ padding: 22 }}>
          <div className="section-title" style={{ marginBottom: 14 }}>Actividad Reciente</div>
          {activity.length === 0 ? (
            <div style={{ fontSize: 12, color: 'var(--text3)', textAlign: 'center', padding: '12px 0' }}>Sin actividad reciente</div>
          ) : activity.map((a) => (
            <div key={a.id} style={{ display: 'flex', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--border)', alignItems: 'flex-start' }}>
              <div style={{ marginTop: 1, color: 'var(--text2)' }}>{activityIcon[a.type]}</div>
              <div style={{ flex: 1 }}><div style={{ fontSize: 13, fontWeight: 500 }}>{a.message}</div><div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>{a.time}</div></div>
              <div style={{ width: 8, height: 8, borderRadius: '50%', flexShrink: 0, marginTop: 5, background: severityColor[a.severity] }} />
            </div>
          ))}
        </div>
        <div className="card" style={{ padding: 22 }}>
          <div className="section-title" style={{ marginBottom: 14 }}>En Riesgo</div>
          {atRisk.length === 0 ? (
            <div style={{ fontSize: 12, color: 'var(--text3)', textAlign: 'center', padding: '12px 0' }}>Sin estudiantes en riesgo</div>
          ) : atRisk.map((s) => (
            <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 0', borderBottom: '1px solid var(--border)' }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--bg3)', border: '1.5px solid var(--border2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, color: 'var(--text2)', flexShrink: 0 }}>
                {s.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
              </div>
              <div style={{ flex: 1 }}><div style={{ fontSize: 12.5, fontWeight: 600 }}>{s.name}</div><div style={{ fontSize: 11, color: 'var(--text3)' }}>{s.program} · Sem {s.semester ?? '—'}</div></div>
              <div style={{ textAlign: 'right' }}><div style={{ fontSize: 12, fontWeight: 700, color: attColor(s.attendance ?? 100) }}>{s.attendance != null ? `${s.attendance}%` : '—'}</div><div style={{ fontSize: 10, color: 'var(--text3)' }}>asist.</div></div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// ── Admin Dashboard ───────────────────────────────────────────
export default function AdminDashboard() {
  const [tab,   setTab]   = useState('overview');
  const [toast, setToast] = useState(null);

  const handleCreated = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3500); };

  return (
    <div>
      {toast && <div className="toast success"><Check size={14} /> {toast}</div>}

      <div className="tabs" style={{ margin: '0 0 16px' }}>
        {[
          { id: 'overview', label: 'Resumen' },
          { id: 'students', label: 'Estudiantes' },
          { id: 'teachers', label: 'Docentes' },
          { id: 'admins',   label: 'Administradores' },
          { id: 'programs', label: 'Programas' },
        ].map((t) => (
          <button key={t.id} className={`tab ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>{t.label}</button>
        ))}
      </div>

      {tab === 'overview' && <OverviewTab />}
      {tab === 'students' && <motion.div key="students" variants={fadeInUp} initial="hidden" animate="show"><StudentsTab onToast={handleCreated} /></motion.div>}
      {tab === 'teachers' && <motion.div key="teachers" variants={fadeInUp} initial="hidden" animate="show"><PeopleTab rol="docente" extraColumns={[{ key: 'courses', label: 'Cursos' }, { key: 'students', label: 'Estudiantes' }]} onToast={handleCreated} /></motion.div>}
      {tab === 'admins'   && <motion.div key="admins" variants={fadeInUp} initial="hidden" animate="show"><PeopleTab rol="admin" onToast={handleCreated} /></motion.div>}
      {tab === 'programs' && <motion.div key="programs" variants={fadeInUp} initial="hidden" animate="show"><ProgramsTab onToast={handleCreated} /></motion.div>}
    </div>
  );
}
