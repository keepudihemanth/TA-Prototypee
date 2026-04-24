const NODE_CONFIG = {
  start:     { label: "Start",     color: "#16a34a" },
  task:      { label: "Task",      color: "#4f46e5" },
  approval:  { label: "Approval",  color: "#d97706" },
  automated: { label: "Automated", color: "#0891b2" },
  end:       { label: "End",       color: "#dc2626" },
};

export default function NodeSidebar() {
  const onDragStart = (e, type) => {
    e.dataTransfer.setData("nodeType", type);
  };

  return (
    <div className="sidebar">

      <div>
        <p className="sidebar-section-label">Node Types</p>

        {Object.entries(NODE_CONFIG).map(([type, cfg]) => (
          <div
            key={type}
            draggable
            onDragStart={(e) => onDragStart(e, type)}
            className="sidebar-item"
            style={{ borderLeftColor: cfg.color }}
          >
            <span
              className="sidebar-dot"
              style={{ background: cfg.color }}
            />
            <span className="sidebar-item-label">{cfg.label}</span>
          </div>
        ))}
      </div>

      <div className="sidebar-guide">
        <p className="sidebar-guide-title">Quick Guide</p>
        <div className="sidebar-guide-line">— Drag nodes onto canvas</div>
        <div className="sidebar-guide-line">— Connect output to input</div>
        <div className="sidebar-guide-line">— Click node to configure</div>
        <div className="sidebar-guide-line">— Click edge to delete</div>
      </div>

    </div>
  );
}