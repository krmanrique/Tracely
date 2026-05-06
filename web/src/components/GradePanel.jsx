import { useState } from "react";
import { gradeColor } from "../utils/helpers";

const TIPOS = ["Taller", "Quiz", "Parcial", "Proyecto", "Examen", "Oral", "Laboratorio"];

export default function GradePanel({ course, onClose }) {
  const [activeCorte, setActiveCorte] = useState(1);
  const [grades, setGrades] = useState(
    Object.fromEntries(
      course.students.map((s) => [
        s.id,
        Object.fromEntries(
          course.cortes.map((c) => [c.id, [...(course.grades[s.id]?.[c.id] ?? [])]])
        ),
      ])
    )
  );
  const [newLabel, setNewLabel] = useState("");
  const [newTipo, setNewTipo] = useState("Taller");

  const activities = grades[course.students[0]?.id]?.[activeCorte] ?? [];

  const addActivity = () => {
    if (!newLabel.trim()) return;
    const id = "a_" + Date.now();
    setGrades((prev) => {
      const next = { ...prev };
      course.students.forEach((s) => {
        next[s.id] = {
          ...next[s.id],
          [activeCorte]: [
            ...(next[s.id][activeCorte] ?? []),
            { id, label: newLabel.trim(), tipo: newTipo, value: null },
          ],
        };
      });
      return next;
    });
    setNewLabel("");
  };

  const removeActivity = (actId) => {
    setGrades((prev) => {
      const next = { ...prev };
      course.students.forEach((s) => {
        next[s.id] = {
          ...next[s.id],
          [activeCorte]: next[s.id][activeCorte].filter((a) => a.id !== actId),
        };
      });
      return next;
    });
  };

  const updateGrade = (sid, actId, val) => {
    const num = val === "" ? null : parseFloat(val);
    const clamped = num != null ? Math.min(5, Math.max(0, num)) : null;
    setGrades((prev) => ({
      ...prev,
      [sid]: {
        ...prev[sid],
        [activeCorte]: prev[sid][activeCorte].map((a) =>
          a.id === actId ? { ...a, value: isNaN(clamped) ? null : clamped } : a
        ),
      },
    }));
  };

  const studentAvg = (sid) => {
    const acts = grades[sid]?.[activeCorte] ?? [];
    const done = acts.filter((x) => x.value != null);
    return done.length ? done.reduce((s, x) => s + x.value, 0) / done.length : null;
  };

  return (
    <div className="overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="panel">
        <div className="panel-header">
          <div>
            <div style={{ fontSize: 17, fontWeight: 700, letterSpacing: "-0.3px" }}>
              Gestión de Notas
            </div>
            <div style={{ fontSize: 12, color: "var(--text2)", marginTop: 3 }}>
              <span
                style={{
                  display: "inline-block", width: 8, height: 8,
                  borderRadius: "50%", background: course.color, marginRight: 6,
                }}
              />
              {course.name} · Grupo {course.group}
            </div>
          </div>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="corte-tabs">
          {course.cortes.map((ct) => (
            <button
              key={ct.id}
              className={`corte-tab ${activeCorte === ct.id ? "active" : ""}`}
              onClick={() => setActiveCorte(ct.id)}
            >
              {ct.label}
              <span className="corte-weight">{ct.weight}%</span>
            </button>
          ))}
        </div>

        <div style={{ background: "var(--bg3)", borderRadius: 11, padding: "12px 16px", marginBottom: 18 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text2)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.8px" }}>
            + Nueva Actividad
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <input
              className="input-field"
              style={{ flex: 2, minWidth: 150 }}
              placeholder="Nombre..."
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addActivity()}
            />
            <select className="input-field" value={newTipo} onChange={(e) => setNewTipo(e.target.value)}>
              {TIPOS.map((t) => <option key={t}>{t}</option>)}
            </select>
            <button className="btn btn-primary btn-sm" onClick={addActivity}>Agregar</button>
          </div>
        </div>

        {activities.length === 0 ? (
          <div className="empty">
            <div className="empty-icon">📝</div>
            Agrega una actividad para ingresar notas
          </div>
        ) : (
          <>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: `180px repeat(${activities.length}, 1fr) 70px`,
                gap: 6, padding: "6px 0",
                borderBottom: "1.5px solid var(--border)",
                marginBottom: 6, alignItems: "end",
              }}
            >
              <div style={{ fontSize: 10, fontWeight: 700, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.8px" }}>
                Estudiante
              </div>
              {activities.map((act) => (
                <div key={act.id} style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text)", marginBottom: 3 }}>{act.label}</div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
                    <span className={`tipo-chip tipo-${act.tipo}`}>{act.tipo}</span>
                    <button
                      onClick={() => removeActivity(act.id)}
                      style={{ background: "none", border: "none", color: "var(--text3)", cursor: "pointer", fontSize: 11, padding: "1px 3px", borderRadius: 4 }}
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
              <div style={{ fontSize: 10, fontWeight: 700, color: "var(--text3)", textTransform: "uppercase", textAlign: "center" }}>
                Prom.
              </div>
            </div>

            {course.students.map((s) => {
              const avg = studentAvg(s.id);
              const sg = grades[s.id]?.[activeCorte] ?? [];
              return (
                <div
                  key={s.id}
                  style={{
                    display: "grid",
                    gridTemplateColumns: `180px repeat(${activities.length}, 1fr) 70px`,
                    gap: 6, padding: "8px 0",
                    borderBottom: "1px solid var(--border)", alignItems: "center",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{
                      width: 26, height: 26, borderRadius: "50%",
                      background: "var(--bg3)", border: "1.5px solid var(--border2)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 9, fontWeight: 700, color: "var(--text2)", flexShrink: 0,
                    }}>
                      {s.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                    </div>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 500 }}>
                        {s.name.split(" ")[0]} {s.name.split(" ")[2] || s.name.split(" ")[1]}
                      </div>
                      <span className={`badge badge-${s.status}`} style={{ fontSize: 9, padding: "1px 5px" }}>
                        {s.status === "active" ? "OK" : s.status === "warning" ? "Aviso" : s.status === "risk" ? "Riesgo" : "Crítico"}
                      </span>
                    </div>
                  </div>

                  {activities.map((act) => {
                    const g = sg.find((x) => x.id === act.id);
                    return (
                      <div key={act.id} style={{ textAlign: "center" }}>
                        <input
                          className="grade-input"
                          type="number" min="0" max="5" step="0.1"
                          value={g?.value ?? ""}
                          placeholder="—"
                          onChange={(e) => updateGrade(s.id, act.id, e.target.value)}
                        />
                      </div>
                    );
                  })}

                  <div style={{ textAlign: "center", fontSize: 15, fontWeight: 700, color: gradeColor(avg) }}>
                    {avg != null ? avg.toFixed(1) : "—"}
                  </div>
                </div>
              );
            })}

            <div style={{ marginTop: 18, display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
              <button className="btn btn-primary" onClick={onClose}>💾 Guardar Notas</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
