import { useState, useEffect } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { getSubjects, getStudents, enrollStudent } from '../../services/adminAcademicService';
import SearchSelect from '../../components/common/SearchSelect';

const labelStyle = { fontSize: 11, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 5 };

// Modal inscribir estudiante (RF-13) — búsqueda en vez de <select>. Si se
// invoca con `fixedAsignaturaId` (ej. desde el detalle de una materia
// dentro de un programa), el selector de asignatura se oculta y queda fijo.
export default function EnrollStudentModal({ fixedAsignaturaId, fixedAsignaturaLabel, onClose, onSuccess }) {
  const [subjects, setSubjects]         = useState([]);
  const [student, setStudent]           = useState(null);
  const [asignaturaId, setAsignaturaId] = useState(fixedAsignaturaId ?? '');
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState(null);

  useEffect(() => {
    if (fixedAsignaturaId) return;
    getSubjects().then(setSubjects).catch((e) => setError(e.message));
  }, [fixedAsignaturaId]);

  const handleSubmit = async () => {
    if (!student || !asignaturaId) return setError('Busca un estudiante y selecciona una asignatura');
    setLoading(true); setError(null);
    try {
      await enrollStudent(student.id, asignaturaId);
      onSuccess('Estudiante inscrito correctamente');
      onClose();
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="overlay" onClick={onClose}>
      <div className="settings-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 440, overflow: 'visible' }}>
        <div className="settings-modal-header">
          <h2 className="settings-modal-title">Inscribir estudiante</h2>
          <button className="close-btn" onClick={onClose}><X size={14} strokeWidth={2.5} /></button>
        </div>
        <div style={{ padding: '16px 28px', display: 'flex', flexDirection: 'column', gap: 12, overflow: 'visible' }}>
          {error && <div style={{ color: 'var(--red)', fontSize: 13, background: 'var(--bg3)', padding: '8px 12px', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 6 }}><AlertTriangle size={14} /> {error}</div>}
          <div>
            <div style={labelStyle}>Estudiante</div>
            <SearchSelect
              value={student}
              onSelect={setStudent}
              fetchResults={(q) => getStudents(q)}
              getLabel={(s) => `${s.name} (${s.usuarioId})`}
              renderItem={(s) => (
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{s.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text3)' }}>{s.usuarioId} · {s.correo}</div>
                </div>
              )}
              placeholder="Busca por nombre, ID o correo..."
            />
          </div>
          {fixedAsignaturaId ? (
            <div>
              <div style={labelStyle}>Asignatura</div>
              <div className="input-field" style={{ width: '100%', boxSizing: 'border-box', color: 'var(--text2)' }}>{fixedAsignaturaLabel}</div>
            </div>
          ) : (
            <div>
              <div style={labelStyle}>Asignatura</div>
              <select className="settings-select" style={{ width: '100%' }} value={asignaturaId} onChange={(e) => setAsignaturaId(e.target.value)}>
                <option value="">Selecciona una asignatura</option>
                {subjects.map((a) => <option key={a.id} value={a.id}>{a.nombre} — {a.NRC} ({a.semestre_academico})</option>)}
              </select>
            </div>
          )}
        </div>
        <div className="settings-modal-footer">
          <button className="settings-cancel-btn" onClick={onClose}>Cancelar</button>
          <button className="settings-save-btn" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Inscribiendo...' : 'Inscribir'}
          </button>
        </div>
      </div>
    </div>
  );
}
