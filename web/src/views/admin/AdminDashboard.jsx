import { useState } from "react";
import { attColor, gradeColor } from "../../utils/helpers";
import { mockData } from "../../data/mockData";

const admin = mockData.admin;

// ── Subcomponente: tabla de estudiantes ───────────────────────
function StudentsTab() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const filtered = admin.students.filter((s) => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.id.includes(search) || s.program.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || s.risk === filter;
    return matchSearch && matchFilter;
  });

  const riskLabel = { low: "Normal", medium: "Aviso", high: "Riesgo", critical: "Crítico" };
  const riskClass = { low: "badge-active", medium: "badge-warning", high: "badge-risk", critical: "badge-critical" };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {/* Filtros */}
      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <div style={{ position: "relative", flex: 1 }}>
          <svg style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--text3)" }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            className="input-field"
            style={{ width: "100%", paddingLeft: 32 }}
            placeholder="Buscar por nombre, ID o programa..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="tabs" style={{ margin: 0 }}>
          {["all", "low", "medium", "high", "critical"].map((f) => (
            <button key={f} className={`tab ${filter === f ? "active" : ""}`} onClick={() => setFilter(f)}>
              {f === "all" ? "Todos" : riskLabel[f]}
            </button>
          ))}
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <table className="table">
          <thead>
            <tr>
              <th style={{ padding: "14px 16px 10px" }}>Estudiante</th>
              <th>Programa</th>
              <th>Semestre</th>
              <th>Promedio</th>
              <th>Asistencia</th>
              <th>Riesgo</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign: "center", padding: 32, color: "var(--text3)" }}>Sin resultados</td></tr>
            ) : filtered.map((s) => (
              <tr key={s.id}>
                <td style={{ padding: "12px 16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: "50%", background: "var(--bg3)",
                      border: "1.5px solid var(--border2)", display: "flex", alignItems: "center",
                      justifyContent: "center", fontSize: 10, fontWeight: 700, color: "var(--text2)", flexShrink: 0,
                    }}>
                      {s.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{s.name}</div>
                      <div style={{ fontSize: 11, color: "var(--text3)" }}>{s.id}</div>
                    </div>
                  </div>
                </td>
                <td style={{ fontSize: 12, color: "var(--text2)" }}>{s.program}</td>
                <td style={{ fontSize: 13 }}>{s.semester}°</td>
                <td style={{ fontWeight: 700, color: gradeColor(s.gpa) }}>{s.gpa.toFixed(1)}</td>
                <td style={{ fontWeight: 600, color: attColor(s.attendance) }}>{s.attendance}%</td>
                <td><span className={`badge ${riskClass[s.risk]}`}>{riskLabel[s.risk]}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ fontSize: 11, color: "var(--text3)", textAlign: "right" }}>
        Mostrando {filtered.length} de {admin.students.length} estudiantes (demo — datos reales vienen del backend)
      </div>
    </div>
  );
}

// ── Subcomponente: tabla de docentes ──────────────────────────
function TeachersTab() {
  const [search, setSearch] = useState("");
  const filtered = admin.teachers.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.department.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ position: "relative", maxWidth: 360 }}>
        <svg style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--text3)" }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input className="input-field" style={{ width: "100%", paddingLeft: 32 }} placeholder="Buscar docente o departamento..."
          value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <table className="table">
          <thead>
            <tr>
              <th style={{ padding: "14px 16px 10px" }}>Docente</th>
              <th>Departamento</th>
              <th>Cursos</th>
              <th>Estudiantes</th>
              <th>Asist. Promedio</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((t) => (
              <tr key={t.id}>
                <td style={{ padding: "12px 16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: "50%",
                      background: "linear-gradient(135deg, var(--sidebar), var(--accent))",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 10, fontWeight: 700, color: "white", flexShrink: 0,
                    }}>
                      {t.name.replace("Dr. ", "").replace("Dra. ", "").replace("Mg. ", "").replace("Ing. ", "").split(" ").map(n => n[0]).join("").slice(0, 2)}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{t.name}</div>
                      <div style={{ fontSize: 11, color: "var(--text3)" }}>{t.id}</div>
                    </div>
                  </div>
                </td>
                <td style={{ fontSize: 12, color: "var(--text2)" }}>{t.department}</td>
                <td style={{ fontSize: 13, fontWeight: 600 }}>{t.courses}</td>
                <td style={{ fontSize: 13 }}>{t.students}</td>
                <td style={{ fontWeight: 600, color: attColor(t.avgAttendance) }}>{t.avgAttendance}%</td>
                <td><span className="badge badge-active">Activo</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Subcomponente: resumen por programas ──────────────────────
function ProgramsTab() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div className="grid grid-2" style={{ gap: 14 }}>
        {admin.programStats.map((p, i) => {
          const colors = ["#4F46E5", "#059669", "#D97706", "#DB2777", "#7C3AED"];
          return (
            <div key={i} className="card" style={{ padding: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: colors[i] }} />
                <div style={{ fontWeight: 700, fontSize: 14 }}>{p.name}</div>
              </div>
              <div className="grid grid-3" style={{ gap: 10 }}>
                <div>
                  <div className="stat-label">Estudiantes</div>
                  <div style={{ fontSize: 22, fontWeight: 700 }}>{p.students.toLocaleString()}</div>
                </div>
                <div>
                  <div className="stat-label">Promedio GPA</div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: gradeColor(p.avgGpa) }}>{p.avgGpa.toFixed(1)}</div>
                </div>
                <div>
                  <div className="stat-label">Retención</div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: attColor(p.retention) }}>{p.retention}%</div>
                </div>
              </div>
              <div className="progress-bar" style={{ marginTop: 12 }}>
                <div className="progress-fill" style={{ width: `${p.retention}%`, background: colors[i] }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Dashboard Admin principal ─────────────────────────────────
export default function AdminDashboard() {
  const [tab, setTab] = useState("overview");
  const { stats, recentActivity } = admin;

  const severityColor = {
    critical: "var(--red)", high: "var(--orange)",
    medium: "var(--gold)", info: "var(--accent)", success: "var(--green)",
  };
  const activityIcon = {
    alert: "⚠️", grade: "📝", user: "👤", system: "⚙️",
  };

  return (
    <div>
      {/* Tabs de navegación */}
      <div className="tabs" style={{ marginBottom: 20 }}>
        {[
          { id: "overview", label: "Resumen" },
          { id: "students", label: "Estudiantes" },
          { id: "teachers", label: "Docentes" },
          { id: "programs", label: "Programas" },
        ].map((t) => (
          <button key={t.id} className={`tab ${tab === t.id ? "active" : ""}`} onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW ── */}
      {tab === "overview" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {/* Stats principales */}
          <div className="grid grid-4" style={{ gap: 14 }}>
            <div className="stat-card">
              <div className="stat-icon">🎓</div>
              <div className="stat-label">Estudiantes</div>
              <div className="stat-val">{stats.totalStudents.toLocaleString()}</div>
              <div className="stat-sub">Matriculados activos</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">👨‍🏫</div>
              <div className="stat-label">Docentes</div>
              <div className="stat-val">{stats.totalTeachers}</div>
              <div className="stat-sub">Vinculados</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">📚</div>
              <div className="stat-label">Cursos Activos</div>
              <div className="stat-val">{stats.totalCourses}</div>
              <div className="stat-sub">Semestre {stats.activeSemester}</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">⚠️</div>
              <div className="stat-label">En Riesgo</div>
              <div className="stat-val" style={{ color: "var(--orange)" }}>{stats.atRiskCount}</div>
              <div className="stat-sub">Requieren atención</div>
            </div>
          </div>

          {/* Segunda fila de stats */}
          <div className="grid grid-3" style={{ gap: 14 }}>
            <div className="stat-card" style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ fontSize: 32 }}>📊</div>
              <div>
                <div className="stat-label">GPA Promedio</div>
                <div style={{ fontSize: 28, fontWeight: 700, color: gradeColor(stats.avgGpa) }}>{stats.avgGpa.toFixed(1)}</div>
                <div className="stat-sub">Institución</div>
              </div>
            </div>
            <div className="stat-card" style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ fontSize: 32 }}>✅</div>
              <div>
                <div className="stat-label">Asistencia Global</div>
                <div style={{ fontSize: 28, fontWeight: 700, color: attColor(stats.attendanceGlobal) }}>{stats.attendanceGlobal}%</div>
                <div className="stat-sub">Promedio institucional</div>
              </div>
            </div>
            <div className="stat-card" style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ fontSize: 32 }}>🔒</div>
              <div>
                <div className="stat-label">Tasa de Retención</div>
                <div style={{ fontSize: 28, fontWeight: 700, color: "var(--green)" }}>{stats.retentionRate}%</div>
                <div className="stat-sub">Semestre actual</div>
              </div>
            </div>
          </div>

          {/* Actividad reciente + top en riesgo */}
          <div className="grid grid-2-1" style={{ gap: 14 }}>
            <div className="card" style={{ padding: 22 }}>
              <div className="section-title" style={{ marginBottom: 14 }}>Actividad Reciente</div>
              {recentActivity.map((a) => (
                <div key={a.id} style={{
                  display: "flex", gap: 12, padding: "10px 0",
                  borderBottom: "1px solid var(--border)", alignItems: "flex-start",
                }}>
                  <div style={{ fontSize: 16, lineHeight: 1, marginTop: 1 }}>{activityIcon[a.type]}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text)" }}>{a.message}</div>
                    <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 2 }}>{a.time}</div>
                  </div>
                  <div style={{
                    width: 8, height: 8, borderRadius: "50%", flexShrink: 0, marginTop: 5,
                    background: severityColor[a.severity],
                  }} />
                </div>
              ))}
            </div>

            <div className="card" style={{ padding: 22 }}>
              <div className="section-title" style={{ marginBottom: 14 }}>Estudiantes en Riesgo</div>
              {admin.students.filter(s => s.risk !== "low").map((s) => (
                <div key={s.id} style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "9px 0", borderBottom: "1px solid var(--border)",
                }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: "50%", background: "var(--bg3)",
                    border: "1.5px solid var(--border2)", display: "flex", alignItems: "center",
                    justifyContent: "center", fontSize: 9, fontWeight: 700, color: "var(--text2)", flexShrink: 0,
                  }}>
                    {s.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12.5, fontWeight: 600 }}>{s.name}</div>
                    <div style={{ fontSize: 11, color: "var(--text3)" }}>{s.program} · Sem {s.semester}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: attColor(s.attendance) }}>{s.attendance}%</div>
                    <div style={{ fontSize: 10, color: "var(--text3)" }}>asist.</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === "students" && <StudentsTab />}
      {tab === "teachers" && <TeachersTab />}
      {tab === "programs" && <ProgramsTab />}
    </div>
  );
}
