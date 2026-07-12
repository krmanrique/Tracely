import { useState, useEffect, useCallback } from 'react';
import { attColor, gradeColor } from '../../utils/helpers';
import { mockData } from '../../data/mockData';
import { getToken } from '../../context/AuthContext';
import StudentsTab from './StudentsTab';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const adminMock = mockData.admin;

// ── Modal crear usuario ───────────────────────────────────────
function CreateUserModal({ onClose, onSuccess }) {
  const [form, setForm]     = useState({ id_institucional: '', nombre: '', correo: '', password: '', rol: 'estudiante' });
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState(null);

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async () => {
    if (!form.id_institucional || !form.nombre || !form.correo || !form.password)
      return setError('Todos los campos son obligatorios');
    setLoading(true); setError(null);
    try {
      const res  = await fetch(`${API}/users/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al crear usuario');
      onSuccess(`Usuario ${form.nombre} creado`);
      onClose();
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="overlay" onClick={onClose}>
      <div className="settings-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 480 }}>
        <div className="settings-modal-header">
          <h2 className="settings-modal-title">Crear nuevo usuario</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>
        <div style={{ padding: '16px 28px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {error && <div style={{ color: 'var(--red)', fontSize: 13, background: 'var(--bg3)', padding: '8px 12px', borderRadius: 8 }}>⚠ {error}</div>}
          {[
            { label: 'ID Institucional',     key: 'id_institucional', ph: 'ej: 2025-0001 o DOC-0200' },
            { label: 'Nombre completo',      key: 'nombre',           ph: 'ej: Juan Pérez' },
            { label: 'Correo institucional', key: 'correo',           ph: 'ej: j.perez@unicatolica.edu.co' },
            { label: 'Contraseña temporal',  key: 'password',         ph: 'Mínimo 6 caracteres', type: 'password' },
          ].map((f) => (
            <div key={f.key}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 5 }}>{f.label}</div>
              <input className="settings-input" style={{ width: '100%', boxSizing: 'border-box' }}
                type={f.type ?? 'text'} placeholder={f.ph}
                value={form[f.key]} onChange={set(f.key)} />
            </div>
          ))}
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 5 }}>Rol</div>
            <select className="settings-select" value={form.rol} onChange={set('rol')}>
              <option value="estudiante">Estudiante</option>
              <option value="docente">Docente</option>
              <option value="admin">Administrador</option>
            </select>
          </div>
        </div>
        <div className="settings-modal-footer">
          <button className="settings-cancel-btn" onClick={onClose}>Cancelar</button>
          <button className="settings-save-btn" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Creando...' : 'Crear usuario'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Tab Docentes ──────────────────────────────────────────────
function TeachersTab() {
  const [teachers, setTeachers] = useState([]);
  const [search,   setSearch]   = useState('');
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    fetch(`${API}/users?rol=docente`, { headers: { Authorization: `Bearer ${getToken()}` } })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data && Array.isArray(data) && data.length > 0) {
          setTeachers(data.map(u => ({ id: u.id_institucional, name: u.nombre, department: 'TDS', courses: 0, students: 0, avgAttendance: null })));
        } else {
          setTeachers(adminMock.teachers);
        }
      })
      .catch(() => setTeachers(adminMock.teachers))
      .finally(() => setLoading(false));
  }, []);

  const filtered = teachers.filter(t => t.name.toLowerCase().includes(search.toLowerCase()) || t.id?.includes(search));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <input className="input-field" style={{ maxWidth: 360 }} placeholder="Buscar docente..." value={search} onChange={e => setSearch(e.target.value)} />
      {loading ? <div className="empty"><div className="empty-icon">⏳</div>Cargando...</div> : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="table">
            <thead><tr><th style={{ padding: '14px 16px 10px' }}>Docente</th><th>Departamento</th><th>Cursos</th><th>Estudiantes</th><th>Estado</th></tr></thead>
            <tbody>
              {filtered.map(t => (
                <tr key={t.id}>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,var(--sidebar),var(--accent))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: 'white', flexShrink: 0 }}>
                        {t.name.replace(/Dr\.|Dra\.|Mg\.|Ing\./,'').trim().split(' ').map(n=>n[0]).join('').slice(0,2)}
                      </div>
                      <div><div style={{ fontWeight: 600, fontSize: 13 }}>{t.name}</div><div style={{ fontSize: 11, color: 'var(--text3)' }}>{t.id}</div></div>
                    </div>
                  </td>
                  <td style={{ fontSize: 12, color: 'var(--text2)' }}>{t.department}</td>
                  <td style={{ fontSize: 13 }}>{t.courses}</td>
                  <td style={{ fontSize: 13 }}>{t.students}</td>
                  <td><span className="badge badge-active">Activo</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── Tab Programas ─────────────────────────────────────────────
function ProgramsTab() {
  const colors = ['#4F46E5','#059669','#D97706','#DB2777','#7C3AED'];
  return (
    <div className="grid grid-2" style={{ gap: 14 }}>
      {adminMock.programStats.map((p, i) => (
        <div key={i} className="card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: colors[i] }} />
            <div style={{ fontWeight: 700, fontSize: 14 }}>{p.name}</div>
          </div>
          <div className="grid grid-3" style={{ gap: 10 }}>
            <div><div className="stat-label">Estudiantes</div><div style={{ fontSize: 22, fontWeight: 700 }}>{p.students.toLocaleString()}</div></div>
            <div><div className="stat-label">GPA</div><div style={{ fontSize: 22, fontWeight: 700, color: gradeColor(p.avgGpa) }}>{p.avgGpa.toFixed(1)}</div></div>
            <div><div className="stat-label">Retención</div><div style={{ fontSize: 22, fontWeight: 700, color: attColor(p.retention) }}>{p.retention}%</div></div>
          </div>
          <div className="progress-bar" style={{ marginTop: 12 }}>
            <div className="progress-fill" style={{ width: `${p.retention}%`, background: colors[i] }} />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Admin Dashboard ───────────────────────────────────────────
export default function AdminDashboard() {
  const [tab,        setTab]        = useState('overview');
  const [showCreate, setShowCreate] = useState(false);
  const [toast,      setToast]      = useState(null);
  const { stats, recentActivity }   = adminMock;

  const severityColor = { critical:'var(--red)',high:'var(--orange)',medium:'var(--gold)',info:'var(--accent)',success:'var(--green)' };
  const activityIcon  = { alert:'⚠️',grade:'📝',user:'👤',system:'⚙️' };

  const handleCreated = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3500); };

  return (
    <div>
      {showCreate && <CreateUserModal onClose={() => setShowCreate(false)} onSuccess={handleCreated} />}
      {toast && <div className="toast success">✓ {toast}</div>}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div className="tabs" style={{ margin: 0 }}>
          {[{id:'overview',label:'Resumen'},{id:'students',label:'Estudiantes'},{id:'teachers',label:'Docentes'},{id:'programs',label:'Programas'}].map(t => (
            <button key={t.id} className={`tab ${tab===t.id?'active':''}`} onClick={() => setTab(t.id)}>{t.label}</button>
          ))}
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => setShowCreate(true)}>+ Crear usuario</button>
      </div>

      {tab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div className="grid grid-4" style={{ gap: 14 }}>
            <div className="stat-card"><div className="stat-icon">🎓</div><div className="stat-label">Estudiantes</div><div className="stat-val">{stats.totalStudents.toLocaleString()}</div><div className="stat-sub">Matriculados</div></div>
            <div className="stat-card"><div className="stat-icon">👨‍🏫</div><div className="stat-label">Docentes</div><div className="stat-val">{stats.totalTeachers}</div><div className="stat-sub">Vinculados</div></div>
            <div className="stat-card"><div className="stat-icon">📚</div><div className="stat-label">Cursos</div><div className="stat-val">{stats.totalCourses}</div><div className="stat-sub">Semestre {stats.activeSemester}</div></div>
            <div className="stat-card"><div className="stat-icon">⚠️</div><div className="stat-label">En Riesgo</div><div className="stat-val" style={{ color:'var(--orange)' }}>{stats.atRiskCount}</div><div className="stat-sub">Atención</div></div>
          </div>
          <div className="grid grid-3" style={{ gap: 14 }}>
            <div className="stat-card" style={{ display:'flex',alignItems:'center',gap:16 }}><div style={{ fontSize:32 }}>📊</div><div><div className="stat-label">GPA Promedio</div><div style={{ fontSize:28,fontWeight:700,color:gradeColor(stats.avgGpa) }}>{stats.avgGpa.toFixed(1)}</div><div className="stat-sub">Institución</div></div></div>
            <div className="stat-card" style={{ display:'flex',alignItems:'center',gap:16 }}><div style={{ fontSize:32 }}>✅</div><div><div className="stat-label">Asistencia Global</div><div style={{ fontSize:28,fontWeight:700,color:attColor(stats.attendanceGlobal) }}>{stats.attendanceGlobal}%</div><div className="stat-sub">Promedio</div></div></div>
            <div className="stat-card" style={{ display:'flex',alignItems:'center',gap:16 }}><div style={{ fontSize:32 }}>🔒</div><div><div className="stat-label">Retención</div><div style={{ fontSize:28,fontWeight:700,color:'var(--green)' }}>{stats.retentionRate}%</div><div className="stat-sub">Semestre actual</div></div></div>
          </div>
          <div className="grid grid-2-1" style={{ gap: 14 }}>
            <div className="card" style={{ padding: 22 }}>
              <div className="section-title" style={{ marginBottom: 14 }}>Actividad Reciente</div>
              {recentActivity.map(a => (
                <div key={a.id} style={{ display:'flex',gap:12,padding:'10px 0',borderBottom:'1px solid var(--border)',alignItems:'flex-start' }}>
                  <div style={{ fontSize:16,lineHeight:1,marginTop:1 }}>{activityIcon[a.type]}</div>
                  <div style={{ flex:1 }}><div style={{ fontSize:13,fontWeight:500 }}>{a.message}</div><div style={{ fontSize:11,color:'var(--text3)',marginTop:2 }}>{a.time}</div></div>
                  <div style={{ width:8,height:8,borderRadius:'50%',flexShrink:0,marginTop:5,background:severityColor[a.severity] }} />
                </div>
              ))}
            </div>
            <div className="card" style={{ padding: 22 }}>
              <div className="section-title" style={{ marginBottom: 14 }}>En Riesgo</div>
              {adminMock.students.filter(s=>s.risk!=='low').map(s => (
                <div key={s.id} style={{ display:'flex',alignItems:'center',gap:10,padding:'9px 0',borderBottom:'1px solid var(--border)' }}>
                  <div style={{ width:28,height:28,borderRadius:'50%',background:'var(--bg3)',border:'1.5px solid var(--border2)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:9,fontWeight:700,color:'var(--text2)',flexShrink:0 }}>
                    {s.name.split(' ').map(n=>n[0]).join('').slice(0,2)}
                  </div>
                  <div style={{ flex:1 }}><div style={{ fontSize:12.5,fontWeight:600 }}>{s.name}</div><div style={{ fontSize:11,color:'var(--text3)' }}>{s.program} · Sem {s.semester}</div></div>
                  <div style={{ textAlign:'right' }}><div style={{ fontSize:12,fontWeight:700,color:attColor(s.attendance) }}>{s.attendance}%</div><div style={{ fontSize:10,color:'var(--text3)' }}>asist.</div></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      {tab === 'students' && <StudentsTab />}
      {tab === 'teachers' && <TeachersTab />}
      {tab === 'programs' && <ProgramsTab />}
    </div>
  );
}
