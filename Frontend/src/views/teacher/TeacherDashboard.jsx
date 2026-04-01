import { useState } from "react";
import RingChart from "../../components/RingChart";
import GradePanel from "../../components/GradePanel";
import { attColor } from "../../utils/helpers";

export default function TeacherDashboard({ semData }) {
  if (!semData || semData.courses.length === 0)
    return (
      <div className="empty">
        <div className="empty-icon">📅</div>
        No hay cursos para este semestre
      </div>
    );

  const { courses, schedule } = semData;
  const [activeCourse, setActiveCourse] = useState(courses[0]);
  const [attendance, setAttendance] = useState(
    Object.fromEntries(courses[0].todayAttendance.map((a) => [a.studentId, a.present]))
  );
  const [gradePanel, setGradePanel] = useState(null);

  const toggleAtt = (id) => setAttendance((p) => ({ ...p, [id]: !p[id] }));
  const present = Object.values(attendance).filter(Boolean).length;
  const total   = activeCourse.students.length;
  const atRisk  = activeCourse.students.filter((s) => s.status !== "active");

  return (
    <div>
      {gradePanel && <GradePanel course={gradePanel} onClose={() => setGradePanel(null)} />}

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
          <div className="stat-val" style={{ color: "var(--orange)" }}>{atRisk.length}</div>
          <div className="stat-sub">Necesitan atención</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📋</div>
          <div className="stat-label">Asistencia Hoy</div>
          <div className="stat-val" style={{ color: present / (total || 1) >= 0.8 ? "var(--green)" : "var(--orange)" }}>
            {total > 0 ? Math.round((present / total) * 100) : 0}%
          </div>
          <div className="stat-sub">{present} de {total}</div>
        </div>
      </div>

      {/* Charts row */}
      <div className="grid grid-3" style={{ marginBottom: 18 }}>
        <div className="card" style={{ padding: 20, display: "flex", alignItems: "center", justifyContent: "center", gap: 20, flexDirection: "column" }}>
          <RingChart
            value={present} max={total || 1} size={88} color="var(--green)"
            label={`${total > 0 ? Math.round((present / total) * 100) : 0}%`}
            sublabel="presentes"
          />
          <div style={{ textAlign: "center" }}>
            <div className="card-label">Asistencia hoy</div>
            <div style={{ fontSize: 18, fontWeight: 700 }}>{present} / {total}</div>
          </div>
        </div>

        <div className="card" style={{ padding: 20 }}>
          <div className="section-title" style={{ marginBottom: 12 }}>Mis Cursos</div>
          {courses.map((c) => (
            <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 0", borderBottom: "1px solid var(--border)" }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: c.color, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{c.name}</div>
                <div style={{ fontSize: 11, color: "var(--text2)" }}>{c.code} · {c.enrolled} est.</div>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => setGradePanel(c)}>📝 Notas</button>
            </div>
          ))}
        </div>

        <div className="card" style={{ padding: 20 }}>
          <div className="section-title" style={{ marginBottom: 12 }}>Horario</div>
          {schedule.map((s, i) => (
            <div key={i} className="schedule-item">
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--accent)", width: 36, textTransform: "uppercase" }}>
                {s.day.slice(0, 3)}
              </div>
              <div style={{ fontSize: 11, color: "var(--text2)", width: 88 }}>{s.time}</div>
              <div>
                <div style={{ fontSize: 12.5, fontWeight: 500 }}>{s.course}</div>
                <div style={{ fontSize: 11, color: "var(--text3)" }}>{s.room}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Attendance table */}
      <div className="card" style={{ padding: 22 }}>
        <div className="section-header">
          <div>
            <div className="section-title">Control de Asistencia</div>
            <div style={{ fontSize: 12, color: "var(--text2)", marginTop: 2 }}>
              {new Date().toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "long" })}
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn btn-ghost btn-sm" onClick={() => setGradePanel(activeCourse)}>📝 Ingresar Notas</button>
            <button className="btn btn-primary btn-sm">💾 Guardar Asistencia</button>
          </div>
        </div>

        <div className="tabs" style={{ marginBottom: 16 }}>
          {courses.map((c) => (
            <button
              key={c.id}
              className={`tab ${activeCourse.id === c.id ? "active" : ""}`}
              onClick={() => {
                setActiveCourse(c);
                setAttendance(Object.fromEntries(c.todayAttendance.map((a) => [a.studentId, a.present])));
              }}
            >
              {c.code} {c.group}
            </button>
          ))}
        </div>

        {activeCourse.students.length === 0 ? (
          <div className="empty"><div className="empty-icon">👥</div>Sin estudiantes en este grupo</div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Estudiante</th>
                <th>Asistencia</th>
                <th>Estado</th>
                <th>Hoy</th>
              </tr>
            </thead>
            <tbody>
              {activeCourse.students.map((s) => (
                <tr key={s.id}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{
                        width: 28, height: 28, borderRadius: "50%",
                        background: "var(--bg3)", border: "1.5px solid var(--border2)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 9, fontWeight: 700, color: "var(--text2)",
                      }}>
                        {s.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                      </div>
                      <div>
                        <div style={{ fontWeight: 500, fontSize: 13 }}>{s.name}</div>
                        <div style={{ fontSize: 10, color: "var(--text3)" }}>{s.absences} inasistencias</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ fontWeight: 600, color: attColor(s.attendance) }}>{s.attendance}%</td>
                  <td>
                    <span className={`badge badge-${s.status}`}>
                      {s.status === "active" ? "OK" : s.status === "warning" ? "Aviso" : s.status === "risk" ? "Riesgo" : "Crítico"}
                    </span>
                  </td>
                  <td>
                    <div
                      className={`att-chip ${attendance[s.id] === undefined ? "unset" : attendance[s.id] ? "present" : "absent"}`}
                      onClick={() => toggleAtt(s.id)}
                    >
                      {attendance[s.id] === undefined ? "?" : attendance[s.id] ? "✓" : "✕"}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
