import { attColor } from "../../utils/helpers";

export default function AttendanceView({ semData }) {
  const courses = semData?.courses ?? [];

  if (courses.length === 0)
    return (
      <div className="empty">
        <div className="empty-icon">📭</div>
        No hay materias para este semestre
      </div>
    );

  return (
    <div>
      {/* Cards grid */}
      <div className="grid grid-4" style={{ marginBottom: 18 }}>
        {courses.map((c) => (
          <div key={c.id} className="card" style={{ padding: 18 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: c.color, marginBottom: 8 }} />
            <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text2)", marginBottom: 4 }}>{c.name}</div>
            <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-1px", color: attColor(c.attendance) }}>
              {c.attendance}%
            </div>
            <div style={{ marginTop: 8 }}>
              <div className="progress-bar" style={{ height: 4 }}>
                <div className="progress-fill" style={{ width: `${c.attendance}%`, background: attColor(c.attendance) }} />
              </div>
            </div>
            <div style={{ fontSize: 10, color: "var(--text3)", marginTop: 5 }}>
              Mín. 80% {c.attendance < 80 && <span style={{ color: "var(--red)" }}>⚠</span>}
            </div>
          </div>
        ))}
      </div>

      {/* Summary table */}
      <div className="card" style={{ padding: 22 }}>
        <div className="section-title" style={{ marginBottom: 14 }}>Resumen de Asistencia</div>
        <table className="table">
          <thead>
            <tr>
              <th>Materia</th>
              <th>Docente</th>
              <th>Créditos</th>
              <th>Asistencia</th>
              <th>Estado</th>
              <th>Indicador</th>
            </tr>
          </thead>
          <tbody>
            {courses.map((c) => (
              <tr key={c.id}>
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: c.color }} />
                    <div>
                      <div style={{ fontWeight: 500 }}>{c.name}</div>
                      <div style={{ fontSize: 11, color: "var(--text2)" }}>{c.code}</div>
                    </div>
                  </div>
                </td>
                <td style={{ color: "var(--text2)", fontSize: 12 }}>{c.teacher}</td>
                <td style={{ color: "var(--text2)" }}>{c.credits}</td>
                <td style={{ fontWeight: 700, color: attColor(c.attendance) }}>{c.attendance}%</td>
                <td>
                  <span className={`badge badge-${c.status}`}>
                    {c.status === "active" ? "Al día" : "Alerta"}
                  </span>
                </td>
                <td style={{ width: 120 }}>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${c.attendance}%`, background: attColor(c.attendance) }} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
