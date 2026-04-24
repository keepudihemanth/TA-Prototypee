const NODE_CONFIG = {
  start:     { label: "Start",     color: "#16a34a", bg: "#f0fdf4", border: "#86efac", dot: "#16a34a" },
  task:      { label: "Task",      color: "#4f46e5", bg: "#eef2ff", border: "#a5b4fc", dot: "#4f46e5" },
  approval:  { label: "Approval",  color: "#d97706", bg: "#fffbeb", border: "#fcd34d", dot: "#d97706" },
  automated: { label: "Automated", color: "#0891b2", bg: "#ecfeff", border: "#67e8f9", dot: "#0891b2" },
  end:       { label: "End",       color: "#dc2626", bg: "#fef2f2", border: "#fca5a5", dot: "#dc2626" },
};

function NodeTypeIcon({ color }) {
  return (
    <svg width="8" height="8" viewBox="0 0 8 8">
      <circle cx="4" cy="4" r="4" fill={color} />
    </svg>
  );
}

export default function NodeSidebar() {
  const drag = (e, type) => e.dataTransfer.setData("nodeType", type);

  return (
    <div className="sidebar">
      <div style={{ marginBottom: 24 }}>
        <div style={{
          fontSize: 10,
          fontWeight: 700,
          color: "#6b7280",
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          marginBottom: 10,
          paddingLeft: 2,
        }}>
          Node Types
        </div>

        {Object.entries(NODE_CONFIG).map(([type, cfg]) => (
          <div
            key={type}
            draggable
            onDragStart={(e) => drag(e, type)}
            className="sidebar-item"
            style={{ borderLeft: `3px solid ${cfg.color}` }}
          >
            <NodeTypeIcon color={cfg.color} />
            <span style={{
              fontSize: 12,
              fontWeight: 600,
              color: "#e5e7eb",
              marginLeft: 8,
              letterSpacing: "0.01em",
            }}>
              {cfg.label}
            </span>
          </div>
        ))}
      </div>

      <div style={{
        borderTop: "1px solid #1f2937",
        paddingTop: 14,
        marginTop: "auto",
      }}>
        <div style={{
          fontSize: 10,
          fontWeight: 700,
          color: "#4b5563",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          marginBottom: 8,
        }}>
          Quick Guide
        </div>
        <div style={{ fontSize: 11, color: "#4b5563", lineHeight: 1.8 }}>
          <div>— Drag nodes onto canvas</div>
          <div>— Connect output to input</div>
          <div>— Click node to configure</div>
          <div>— Click edge to delete</div>
        </div>
      </div>
    </div>
  );
}