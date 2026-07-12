import { useState, useEffect } from 'react';
import { attColor, gradeColor } from '../../utils/helpers';
import { getToken } from '../../context/AuthContext';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Datos extra del seed para enriquecer la lista real del backend
const SEED_EXTRA = {
  '2021-0342': { program: 'Ing. Sistemas', semester: 6, gpa: 4.1, attendance: 87, risk: 'low' },
  '2021-0199': { program: 'Ing. Sistemas', semester: 6, gpa: 3.9, attendance: 92, risk: 'low' },
  '2022-0411': { program: 'Ing. Sistemas', semester: 4, gpa: 2.8, attendance: 65, risk: 'high' },
};

const riskLabel = { low: 'Normal', medium: 'Aviso', high: 'Riesgo', critical: 'Crítico' };
const riskClass = { low: 'badge-active', medium: 'badge-warning', high: 'badge-risk', critical: 'badge-critical' };
const FILTERS   = ['all', 'low', 'medium', 'high', 'critical'];

export default function StudentsTab() {
  const [students, setStudents] = useState([]);
  const [search,   setSearch]   = useState('');
  const [filter,   setFilter]   = useState('all');
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    fetch(`${API}/users?rol=estudiante`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    })
      .then((r) => r.ok ? r.json() : [])
      .then((data) => {
        const enriched = data.map((u) => {
          const extra = SEED_EXTRA[u.id_institucional] ?? {};
          return {
            id:         u.id_institucional,
            name:       u.nombre,
            correo:     u.correo,
            program:    extra.program    ?? '—',
            semester:   extra.semester   ?? null,
            gpa:        extra.gpa        ?? null,
            attendance: extra.attendance ?? null,
            risk:       extra.risk       ?? 'low',
          };
        });
        setStudents(enriched);
      })
      .catch(() => setStudents([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = students.filter((s) => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) || s.id.includes(search);
    const matchFilter = filter === 'all' || s.risk === filter;
    return matchSearch && matchFilter;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Barra de búsqueda y filtros */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <svg style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text3)' }}
            width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input className="input-field" style={{ width: '100%', paddingLeft: 32, boxSizing: 'border-box' }}
            placeholder="Buscar por nombre o ID..."
            value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="tabs" style={{ margin: 0 }}>
          {FILTERS.map((f) => (
            <button key={f} className={`tab ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
              {f === 'all' ? 'Todos' : riskLabel[f]}
            </button>
          ))}
        </div>
      </div>

      {/* Tabla */}
      {loading ? (
        <div className="empty"><div className="empty-icon">⏳</div>Cargando estudiantes...</div>
      ) : filtered.length === 0 ? (
        <div className="empty"><div className="empty-icon">📭</div>Sin resultados</div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="table">
            <thead>
              <tr>
                <th style={{ padding: '14px 16px 10px' }}>Estudiante</th>
                <th>Programa</th>
                <th>Semestre</th>
                <th>Promedio</th>
                <th>Asistencia</th>
                <th>Riesgo</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr key={s.id}>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: '50%', background: 'var(--bg3)',
                        border: '1.5px solid var(--border2)', display: 'flex', alignItems: 'center',
                        justifyContent: 'center', fontSize: 10, fontWeight: 700, color: 'var(--text2)', flexShrink: 0,
                      }}>
                        {s.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{s.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--text3)' }}>{s.id}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ fontSize: 12, color: 'var(--text2)' }}>{s.program}</td>
                  <td style={{ fontSize: 13 }}>{s.semester ? `${s.semester}°` : <span style={{ color: 'var(--text3)' }}>—</span>}</td>
                  <td style={{ fontWeight: 700, color: s.gpa ? gradeColor(s.gpa) : 'var(--text3)' }}>
                    {s.gpa != null ? s.gpa.toFixed(1) : '—'}
                  </td>
                  <td style={{ fontWeight: 600, color: s.attendance ? attColor(s.attendance) : 'var(--text3)' }}>
                    {s.attendance != null ? `${s.attendance}%` : '—'}
                  </td>
                  <td><span className={`badge ${riskClass[s.risk]}`}>{riskLabel[s.risk]}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div style={{ fontSize: 11, color: 'var(--text3)', textAlign: 'right' }}>
        {filtered.length} estudiante(s) registrados en el sistema
      </div>
    </div>
  );
}
