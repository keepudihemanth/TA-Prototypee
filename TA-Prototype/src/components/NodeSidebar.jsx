export default function NodeSidebar() {
  const drag = (e, type) =>
    e.dataTransfer.setData("nodeType", type);

  return (
    <div className="sidebar">
      <h3 style={{ marginBottom: 15 }}>Workflow</h3>

      {["start", "task", "approval", "automated", "end"].map(
        (type) => (
          <div
            key={type}
            draggable
            onDragStart={(e) => drag(e, type)}
            className="sidebar-item"
          >
            {type.toUpperCase()}
          </div>
        )
      )}
    </div>
  );
}