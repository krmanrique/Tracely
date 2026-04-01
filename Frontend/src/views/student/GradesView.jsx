import { useState } from "react";
import { gradeColor, attColor, corteAvg, courseOverall } from "../../utils/helpers";

export default function GradesView({ semData, initialCourseId }) {
  const courses = semData?.courses ?? [];
  const [selectedId, setSelectedId] = useState(initialCourseId || courses[0]?.id);
  const [activeCorte, setActiveCorte] = useState(1);

  if (courses.length === 0)
    return (
      <div className="empty">
        <div className="empty-icon">📭</div>
        No hay materias para este semestre
      </div>
    );

  const course  = courses.find((c) => c.id === selectedId) ?? courses[0];
  const corte   = course.cortes.find((c) => c.id === activeCorte) ?? course.cortes[0];
  const cvg     = corteAvg(corte.actividades);
  const overall = courseOverall(course.cortes);

  return (
    <div>
      <div className="grid grid-2-1" style={{ gap: 18 }}>
        {/* Left column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Course list */}
          <div className="card" style={{ padding: 20 }}>
            <div className="section-title" style={{ marginBottom: 14 }}>Materias del semestre</div>
            {courses.map((c) => {
              const ov = courseOverall(c.cortes);
              return (
                <div
                  key={c.id}
                  onClick={() => { setSelectedId(c.id); setActiveCorte(1); }}
                  style={{
                    display: "flex", alignItems: "center", gap: 12,
                    padding: "10px 12px", borderRadius: 10, cursor: "pointer", marginBottom: 6,
                    background: selectedId === c.id ? "rgba(79,70,229,0.07)" : "transparent",
                    border: `1.5px solid ${selectedId === c.id ? "rgba(79,70,229,0.3)" : "var(--border)"}`,
                    transition: "all 0.15s",
                  }}
                >
                  <div style={{ width: 9, height: 9, borderRadius: "50%", background: c.color, flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{c.name}</div>
                    <div style={{ fontSize: 11, color: "var(--text2)", marginTop: 1 }}>{c.code} · {c.teacher}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 17, fontWeight: 700, color: gradeColor(ov) }}>{ov != null ? ov.toFixed(1) : "—"}</div>
                    <div style={{ fontSize: 10, color: "var(--text3)" }}>{c.attendance}% asist.</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Corte summary */}
          <div className="card" style={{ padding: 20 }}>
            <div className="section-title" style={{ marginBottom: 14 }}>Resumen por Corte</div>
            {course.cortes.map((ct) => {
              const avg = corteAvg(ct.actividades);
              return (
                <div key={ct.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "9px 0", borderBottom: "1px solid var(--border)" }}>
                  <div
                    style={{
                      width: 30, height: 30, borderRadius: 8, cursor: "pointer",
                      background: activeCorte === ct.id ? "rgba(79,70,229,0.12)" : "var(--bg3)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 12, fontWeight: 700,
                      color: activeCorte === ct.id ? "var(--accent)" : "var(--text2)",
                    }}
                    onClick={() => setActiveCorte(ct.id)}
                  >
                    {ct.id}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>
                      {ct.label} <span style={{ fontSize: 10, color: "var(--text3)" }}>({ct.weight}%)</span>
                    </div>
                    <div style={{ fontSize: 11, color: "var(--text3)" }}>
                      {ct.actividades.filter((a) => a.value != null).length}/{ct.actividades.length} evaluaciones
                    </div>
                  </div>
                  <div style={{ fontSize: 19, fontWeight: 700, color: gradeColor(avg) }}>
                    {avg != null ? avg.toFixed(1) : "—"}
                  </div>
                </div>
              );
            })}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 14, paddingTop: 14, borderTop: "2px solid var(--border)" }}>
              <div style={{ fontSize: 13, color: "var(--text2)", fontWeight: 600 }}>Nota acumulada</div>
              <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-0.5px", color: gradeColor(overall) }}>
                {overall != null ? overall.toFixed(2) : "—"}
              </div>
            </div>
          </div>
        </div>

        {/* Right: actividades */}
        <div className="card" style={{ padding: 22 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
            <div style={{ width: 9, height: 9, borderRadius: "50%", background: course.color }} />
            <div>
              <div style={{ fontSize: 14, fontWeight: 700 }}>{course.name}</div>
              <div style={{ fontSize: 12, color: "var(--text2)" }}>{course.teacher}</div>
            </div>
          </div>

          <div className="corte-tabs">
            {course.cortes.map((ct) => (
              <button
                key={ct.id}
                className={`corte-tab ${activeCorte === ct.id ? "active" : ""}`}
                onClick={() => setActiveCorte(ct.id)}
              >
                {ct.label}
                <span className="corte-weight">{ct.weight}% de la nota</span>
              </button>
            ))}
          </div>

          {corte.actividades.length === 0 ? (
            <div className="empty"><div className="empty-icon">📝</div>Sin actividades en este corte</div>
          ) : (
            corte.actividades.map((act) => (
              <div key={act.id} className="actividad-row">
                <span className={`tipo-chip tipo-${act.tipo}`}>{act.tipo}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{act.label}</div>
                </div>
                {act.value != null ? (
                  <div style={{ fontSize: 21, fontWeight: 700, color: gradeColor(act.value), letterSpacing: "-0.5px" }}>
                    {act.value.toFixed(1)}
                  </div>
                ) : (
                  <div style={{ fontSize: 12, color: "var(--text3)", fontStyle: "italic" }}>Pendiente</div>
                )}
              </div>
            ))
          )}

          {corte.actividades.length > 0 && (
            <div style={{ background: "var(--bg3)", borderRadius: 11, padding: "12px 16px", marginTop: 18, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 10, color: "var(--text2)", marginBottom: 2, textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.8px" }}>
                  Promedio {corte.label}
                </div>
                <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.8px", color: gradeColor(cvg) }}>
                  {cvg != null ? cvg.toFixed(2) : "—"}
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 10, color: "var(--text2)", marginBottom: 2, textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.8px" }}>
                  Peso final
                </div>
                <div style={{ fontSize: 26, fontWeight: 700, color: "var(--text)", letterSpacing: "-0.8px" }}>
                  {corte.weight}%
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
