import { useState, useEffect, useCallback } from 'react';
import RingChart  from '../../components/charts/RingChart';
import GradePanel from '../../components/charts/GradePanel';
import { attColor } from '../../utils/helpers';
import { getTeacherDashboard, saveAttendance } from '../../services/teacherService';

// ── Toast ────────────────────────────────────────────────────
function Toast({ message, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, [onClose]);
  return (
    <div className={`toast ${type}`}>
      {type === 'success' ? '✓' : '✕'} {message}
    </div>
  );
}

// ── Dashboard Docente ─────────────────────────────────────────
export default function TeacherDashboard({ docenteId, semestre, semData }) {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  const [activeCourse, setActiveCourse] = useState(null);
  const [attendance,   setAttendance]   = useState({});
  const [gradePanel,   setGradePanel]   = useState(null);
  const [saving,       setSaving]       = useState(false);
  const [toast,        setToast]        = useState(null);

  // Cargar desde backend
  useEffect(() => {
    if (!docenteId || !semestre) {
      // Fallback mock
      if (semData) {
        setData(semData);
        if (semData.courses?.length > 0) {
          setActiveCourse(semData.courses[0]);
          setAttendance(Object.fromEntries(
            semData.courses[0].todayAttendance.map((a) => [a.studentId, a.present])
          ));
        }
      }
      setLoading(false);
      return;
    }

    setLoading(true);
    getTeacherDashboard(docenteId, semestre)
      .then((d) => {
        setData(d);
        if (d.courses?.length > 0) {
          setActiveCourse(d.courses[0]);
          setAttendance(Object.fromEntries(
            d.courses[0].todayAttendance.map((a) => [a.studentId, a.present])
          ));
        }
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [docenteId, semestre]);

  const toggleAtt = (id) => setAttendance((p) => ({ ...p, [id]: !p[id] }));

  const handleCourseChange = (c) => {
    setActiveCourse(c);
    setAttendance(Object.fromEntries(
      c.todayAttendance.map((a) => [a.studentId, a.present])
    ));
  };

  const handleSaveAttendance = async () => {
    setSaving(true);
    try {
      const fecha   = new Date().toISOString().split('T')[0];
      const records = activeCourse.todayAttendance.map((a) => ({
        inscripcion_id: a.inscripcionId,
        presente:       attendance[a.studentId] ?? false,
      }));

      if (docenteId) {
        await saveAttendance({ asignatura_id: activeCourse.id, fecha, records });
      } else {
        await new Promise((r) => setTimeout(r, 900));
      }
      setToast({ message: `Asistencia de ${activeCourse.name} guardada`, type: 'success' });
    } catch (e) {
      setToast({ message: e.message || 'Error al guardar', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="empty"><div className="empty-icon">⏳</div>Cargando dashboard...</div>;
  if (error)   return <div className="empty"><div className="empty-icon">⚠️</div>{error}</div>;
  if (!data || !data.courses?.length) return (
    <div className="empty"><div className="empty-icon">📅</div>No hay cursos para este semestre</div>
  );

  const { courses, schedule } = data;
  const present  = Object.values(attendance).filter(Boolean).length;
  const total    = activeCourse?.students?.length ?? 0;
  const atRisk   = activeCourse?.students?.filter((s) => s.status !== 'active') ?? [];

  return (
    <div>
      {gradePanel && <GradePanel course={gradePanel} onClose={() => setGradePanel(null)} />}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Stats */}
      <div className="grid grid-4" style={{ marginBottom: 18 }}>
        <div className="stat-card">
          <div className="stat-icon">📚</div>
          <div className="stat-label">Cursos</div>
          <div className="stat-val">{courses.length}</div>
          <div className="stat-sub">Este semestre</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-label">Estudiantes</div>
          <div className="stat-val">{courses.reduce((a, c) => a + c.enrolled, 0)}</div>
          <div className="stat-sub">Total inscritos</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⚠️</div>
          <div className="stat-label">En Riesgo</div>
          <div className="stat-val" style={{ color: 'var(--orange)' }}>{atRisk.length}</div>
          <div className="stat-sub">Necesitan atención</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📋</div>
          <div className="stat-label">Asistencia Hoy</div>
          <div className="stat-val" style={{ color: total > 0 && present / total >= 0.8 ? 'var(--green)' : 'var(--orange)' }}>
            {total > 0 ? Math.round((present / total) * 100) : 0}%
          </div>
          <div className="stat-sub">{present} de {total}</div>
        </div>
      </div>

      {/* Fila gráficas */}
      <div className="grid grid-3" style={{ marginBottom: 18 }}>
        {/* Ring asistencia */}
        <div className="card" style={{ padding: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
          <RingChart value={present} max={total || 1} size={88} color="var(--green)"
            label={`${total > 0 ? Math.round((present / total) * 100) : 0}%`} sublabel="presentes" />
          <div style={{ textAlign: 'center' }}>
            <div className="card-label">Asistencia hoy</div>
            <div style={{ fontSize: 18, fontWeight: 700 }}>{present} / {total}</div>
          </div>
        </div>

        {/* Mis cursos */}
        <div className="card" style={{ padding: 20 }}>
          <div className="section-title" style={{ marginBottom: 12 }}>Mis Cursos</div>
          {courses.map((c) => (
            <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 0', borderBottom: '1px solid var(--border)' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: c.color, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{c.name}</div>
                <div style={{ fontSize: 11, color: 'var(--text2)' }}>{c.code} · {c.enrolled} est.</div>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => setGradePanel(c)}>📝 Notas</button>
            </div>
          ))}
        </div>

        {/* Horario */}
        <div className="card" style={{ padding: 20 }}>
          <div className="section-title" style={{ marginBottom: 12 }}>Horario</div>
          {schedule.map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)', width: 36, textTransform: 'uppercase' }}>{s.day.slice(0, 3)}</div>
              <div style={{ fontSize: 11, color: 'var(--text2)', width: 88 }}>{s.time}</div>
              <div>
                <div style={{ fontSize: 12.5, fontWeight: 500 }}>{s.course}</div>
                <div style={{ fontSize: 11, color: 'var(--text3)' }}>{s.room}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabla de asistencia */}
      <div className="card" style={{ padding: 22 }}>
        <div className="section-header">
          <div>
            <div className="section-title">Control de Asistencia</div>
            <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 2 }}>
              {new Date().toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' })}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-ghost btn-sm" onClick={() => activeCourse && setGradePanel(activeCourse)}>
              📝 Ingresar Notas
            </button>
            <button className="btn btn-primary btn-sm" onClick={handleSaveAttendance} disabled={saving} style={{ minWidth: 150 }}>
              {saving ? (
                <><span style={{ width: 12, height: 12, border: '2px solid rgba(255,255,255,0.35)', borderTopColor: 'white', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} /> Guardando...</>
              ) : '💾 Guardar Asistencia'}
            </button>
          </div>
        </div>

        {/* Tabs de cursos */}
        <div className="tabs" style={{ marginBottom: 16 }}>
          {courses.map((c) => (
            <button key={c.id} className={`tab ${activeCourse?.id === c.id ? 'active' : ''}`} onClick={() => handleCourseChange(c)}>
              {c.code} {c.group}
            </button>
          ))}
        </div>

        {!activeCourse || activeCourse.students.length === 0 ? (
          <div className="empty"><div className="empty-icon">👥</div>Sin estudiantes en este grupo</div>
        ) : (
          <>
            <div style={{ display: 'flex', gap: 16, marginBottom: 14, padding: '10px 14px', background: 'var(--bg3)', borderRadius: 10 }}>
              <span style={{ fontSize: 12.5, color: 'var(--text2)' }}><strong style={{ color: 'var(--green)' }}>{present}</strong> presentes</span>
              <span style={{ fontSize: 12.5, color: 'var(--text2)' }}><strong style={{ color: 'var(--red)' }}>{total - present}</strong> ausentes</span>
              <span style={{ fontSize: 12.5, color: 'var(--text2)' }}><strong>{total}</strong> total</span>
              <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--text3)' }}>Toca ✓/✕ para cambiar asistencia</span>
            </div>

            <table className="table">
              <thead>
                <tr><th>Estudiante</th><th>Asistencia %</th><th>Estado</th><th>Hoy</th></tr>
              </thead>
              <tbody>
                {activeCourse.students.map((s) => (
                  <tr key={s.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--bg3)', border: '1.5px solid var(--border2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: 'var(--text2)', flexShrink: 0 }}>
                          {s.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                        </div>
                        <div>
                          <div style={{ fontWeight: 500, fontSize: 13 }}>{s.name}</div>
                          <div style={{ fontSize: 10, color: 'var(--text3)' }}>{s.id_inst}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontWeight: 600, color: attColor(s.attendance ?? 85) }}>{s.attendance ?? '—'}%</td>
                    <td><span className={`badge badge-${s.status ?? 'active'}`}>{s.status === 'active' ? 'OK' : 'Riesgo'}</span></td>
                    <td>
                      <div
                        className={`att-chip ${attendance[s.id] === undefined ? 'unset' : attendance[s.id] ? 'present' : 'absent'}`}
                        onClick={() => toggleAtt(s.id)}
                        title="Click para cambiar"
                      >
                        {attendance[s.id] === undefined ? '?' : attendance[s.id] ? '✓' : '✕'}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>
    </div>
  );
}
