import { semestres } from "../data/mockData";
import logo from "../assets/unicatolica-svg.svg";
import tracelyLogo from "../assets/logo.svg"

export default function Topbar({ semestre, setSemestre, pageTitle, userName }) {
  return (
    <div className="topbar">
      {/* Izquierda: título de página + info del usuario */}
      <div className="topbar-left">
        <div style={{
          display: "flex", alignItems: "center", gap: 10,
          marginBottom: 5, alignSelf: "flex-start"
        }}>
          <img
            src={tracelyLogo}
            alt="Tracely"
            style={{ width: 32, height: 32, borderRadius: 8 }}
          />
          <span style={{
            fontSize: 18, fontWeight: 700, color: "#7159b4", letterSpacing: "-0.3px"
          }}>
            Tracely
          </span>
        </div>
        <div className="topbar-page-title">{pageTitle}</div>
        <div className="topbar-page-sub">· {userName} · Semestre {semestre}</div>
      </div>

      {/* Derecha: logo arriba, semestre abajo */}
      <div className="topbar-right">
        <div className="topbar-logo">
          <img src={logo} alt="Unicatolica" width={180} />
        </div>
        <div className="semester-row">
          <span className="semester-label">Semestre:</span>
          <select
            className="semester-select"
            value={semestre}
            onChange={(e) => setSemestre(e.target.value)}
          >
            {semestres.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}