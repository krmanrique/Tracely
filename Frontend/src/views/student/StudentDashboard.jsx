import RingChart from "../../components/RingChart";
import MiniBarChart from "../../components/MiniBarChart";
import { gradeColor, attColor, courseOverall } from "../../utils/helpers";

export default function StudentDashboard({ semData, onNavigate, onNotifClick }) {
  if (!semData)
    return (
      <div className="empty">
        <div className="empty-icon">📅</div>
        No hay datos para este semestre
      </div>
    );

  const { gpa, attendanceRate, riskLevel, courses, notifications, attendanceHistory, semester } = semData;
  const unread = notifications.filter((n) => !n.read).length;
  const alertCourses = courses.filter((c) => c.status === "alert");

  return (
    <div>
      {alertCourses.length > 0 && (
        <div className="alert-banner">
          <div className="alert-banner-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-exclamation-triangle" viewBox="0 0 16 16">
              <path d="M7.938 2.016A.13.13 0 0 1 8.002 2a.13.13 0 0 1 .063.016.15.15 0 0 1 .054.057l6.857 11.667c.036.06.035.124.002.183a.2.2 0 0 1-.054.06.1.1 0 0 1-.066.017H1.146a.1.1 0 0 1-.066-.017.2.2 0 0 1-.054-.06.18.18 0 0 1 .002-.183L7.884 2.073a.15.15 0 0 1 .054-.057m1.044-.45a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767z" />
              <path d="M7.002 12a1 1 0 1 1 2 0 1 1 0 0 1-2 0M7.1 5.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0z" />
            </svg>
          </div>
          <div className="alert-banner-text">
            {alertCourses.length} materia(s) requieren atención:{" "}
            {alertCourses.map((c) => c.name).join(", ")}
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-4" style={{ marginBottom: 18 }}>
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-label">Promedio General</div>
          <div className="stat-val" style={{ color: gradeColor(gpa) }}>
            {gpa != null ? gpa.toFixed(1) : "—"}
          </div>
          <div className="stat-sub">Escala 0.0 – 5.0</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-label">Asistencia Global</div>
          <div className="stat-val" style={{ color: attendanceRate != null ? attColor(attendanceRate) : "var(--text3)" }}>
            {attendanceRate != null ? `${attendanceRate}%` : "—"}
          </div>
          <div className="stat-sub">Mínimo requerido 80%</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📚</div>
          <div className="stat-label">Materias</div>
          <div className="stat-val">{courses.length}</div>
          <div className="stat-sub">{courses.reduce((a, c) => a + c.credits, 0)} créditos</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🔔</div>
          <div className="stat-label">Alertas</div>
          <div className="stat-val" style={{ color: unread ? "var(--red)" : "var(--text)" }}>{unread}</div>
          <div className="stat-sub">Sin leer</div>
        </div>
      </div>

      {/* Charts row */}
      <div className="grid grid-3" style={{ marginBottom: 18 }}>
        {/* Attendance bar */}
        <div className="card" style={{ padding: 20 }}>
          <div className="section-title" style={{ marginBottom: 14 }}>Asistencia Mensual</div>
          <MiniBarChart data={attendanceHistory} />
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
            {attendanceHistory.map((d) => (
              <div key={d.month} style={{ fontSize: 9, color: "var(--text3)", flex: 1, textAlign: "center" }}>
                {d.rate}%
              </div>
            ))}
          </div>
        </div>

        {/* Ring */}
        <div className="card" style={{ padding: 20, display: "flex", alignItems: "center", justifyContent: "center", gap: 20, flexDirection: "column" }}>
          <RingChart value={gpa ?? 0} max={5} size={88} color={gradeColor(gpa)} label={gpa != null ? gpa.toFixed(1) : "—"} sublabel="Promedio" />
          <div style={{ textAlign: "center" }}>
            <div className="card-label">Nivel de Riesgo</div>
            <span className={`badge badge-${riskLevel}`} style={{ fontSize: 12, padding: "4px 12px" }}>
              {riskLevel === "low" ? "✓ Bajo" : riskLevel === "medium" ? "⚠ Medio" : "⛔ Alto"}
            </span>
          </div>
        </div>

        {/* Notifications */}
        <div className="card notif-card" style={{ padding: 20 }}>
          <div className="section-header" style={{ marginBottom: 10 }}>
            <div className="section-title">Notificaciones</div>
            {unread > 0 && <span className="badge badge-alert">{unread} nuevas</span>}
          </div>
          {notifications.length === 0 ? (
            <div style={{ fontSize: 12, color: "var(--text3)", textAlign: "center", padding: "12px 0" }}>
              Sin notificaciones
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                className={`notif-item ${n.read ? "read" : "unread"} ${n.courseId ? "clickable" : ""}`}
                onClick={() => n.courseId && onNotifClick(n.courseId)}
              >
                <div
                  className="notif-dot-icon"
                  style={{
                    background:
                      n.type === "alert" ? "var(--red)"
                        : n.type === "warning" ? "var(--orange)"
                          : n.type === "success" ? "var(--green)"
                            : "var(--accent)",
                  }}
                />
                <div style={{ flex: 1 }}>
                  <div className="notif-msg">{n.message}</div>
                  <div className="notif-time">{n.time}</div>
                </div>
                {n.courseId && <div style={{ fontSize: 11, color: "var(--accent)" }}>→</div>}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Mis materias */}
      <div className="card" style={{ padding: 22 }}>
        <div className="section-header">
          <div className="section-title">Mis Materias — {semester}</div>
          <button className="section-link" onClick={() => onNavigate("grades")}>Ver notas detalladas →</button>
        </div>
        {courses.length === 0 ? (
          <div className="empty"><div className="empty-icon">📭</div>No hay materias para este semestre</div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 12 }}>
            {courses.map((c) => {
              const ov = courseOverall(c.cortes);
              return (
                <div
                  key={c.id}
                  className="course-card"
                  style={{ "--c-accent": c.color }}
                  onClick={() => onNavigate("grades", c.id)}
                >
                  <div style={{ display: "flex", alignItems: "flex-start", marginBottom: 10 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: "var(--text3)", letterSpacing: "1px", textTransform: "uppercase", marginBottom: 2 }}>
                        {c.code}
                      </div>
                      <div style={{ fontSize: 13.5, fontWeight: 700, marginBottom: 2 }}>{c.name}</div>
                      <div style={{ fontSize: 11.5, color: "var(--text2)" }}>{c.teacher}</div>
                    </div>
                    <span className={`badge badge-${c.status}`}>{c.status === "active" ? "Al día" : "⚠ Alerta"}</span>
                  </div>
                  <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                    <div>
                      <div style={{ fontSize: 20, fontWeight: 700, color: gradeColor(ov) }}>{ov != null ? ov.toFixed(1) : "—"}</div>
                      <div style={{ fontSize: 10, color: "var(--text3)" }}>Nota</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 20, fontWeight: 700, color: attColor(c.attendance) }}>{c.attendance}%</div>
                      <div style={{ fontSize: 10, color: "var(--text3)" }}>Asistencia</div>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${c.attendance}%`, background: attColor(c.attendance) }} />
                      </div>
                      <div style={{ fontSize: 10, color: "var(--text3)", marginTop: 3 }}>{c.credits} créditos</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
