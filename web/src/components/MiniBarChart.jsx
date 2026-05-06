export default function MiniBarChart({ data, color = "var(--accent)" }) {
  if (!data.length)
    return (
      <div style={{ fontSize: 12, color: "var(--text3)", textAlign: "center", padding: "16px 0" }}>
        Sin datos
      </div>
    );

  const max = Math.max(...data.map((d) => d.rate));

  return (
    <div className="bar-chart">
      {data.map((d) => (
        <div key={d.month} className="bar-wrap">
          <div style={{ flex: 1, display: "flex", alignItems: "flex-end", width: "100%" }}>
            <div
              className="bar"
              style={{
                height: `${(d.rate / max) * 100}%`,
                background: color,
                opacity: 0.5 + (d.rate / max) * 0.5,
              }}
            />
          </div>
          <div className="bar-label">{d.month}</div>
        </div>
      ))}
    </div>
  );
}
