import WorkflowCanvas  from "./components/WorkflowCanvas";
import NodeSidebar     from "./components/NodeSidebar";
import NodeFormPanel   from "./components/NodeFormPanel";
import SandboxPanel    from "./components/SandboxPanel";
import { useStore }    from "./store";

function LogoIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <rect x="2" y="2" width="8" height="8" rx="2" fill="#4f46e5"/>
      <rect x="14" y="2" width="8" height="8" rx="2" fill="#4f46e5" opacity="0.5"/>
      <rect x="2" y="14" width="8" height="8" rx="2" fill="#4f46e5" opacity="0.5"/>
      <rect x="14" y="14" width="8" height="8" rx="2" fill="#4f46e5" opacity="0.3"/>
    </svg>
  );
}

export default function App() {
  const { nodes, edges } = useStore();

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      height: "100vh",
      fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
    }}>

      {/* Top toolbar */}
      <header style={{
        height: 48,
        background: "#fff",
        borderBottom: "1px solid #e5e7eb",
        display: "flex",
        alignItems: "center",
        padding: "0 16px",
        gap: 10,
        flexShrink: 0,
        zIndex: 10,
      }}>
        {/* Brand */}
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <LogoIcon />
          <div>
            <div style={{
              fontSize: 13,
              fontWeight: 700,
              color: "#111827",
              lineHeight: 1,
              letterSpacing: "-0.01em",
            }}>
              HR Workflow Designer
            </div>
            <div style={{ fontSize: 9, color: "#9ca3af", letterSpacing: "0.05em", marginTop: 1 }}>
              Visual Process Builder
            </div>
          </div>
        </div>

        {/* Divider */}
        <div style={{ width: 1, height: 24, background: "#e5e7eb", margin: "0 6px" }} />

        {/* Stats pills */}
        <div style={{ display: "flex", gap: 6 }}>
          {[
            { label: "Nodes", value: nodes.length },
            { label: "Edges", value: edges.length },
          ].map(({ label, value }) => (
            <div key={label} style={{
              fontSize: 11,
              color: "#6b7280",
              background: "#f3f4f6",
              borderRadius: 99,
              padding: "2px 10px",
              fontWeight: 600,
            }}>
              {value} {label}
            </div>
          ))}
        </div>

        <div style={{ flex: 1 }} />

        {/* Prototype badge */}
        <div style={{
          fontSize: 9,
          fontWeight: 700,
          color: "#4f46e5",
          background: "#eef2ff",
          border: "1px solid #c7d2fe",
          borderRadius: 99,
          padding: "3px 10px",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
        }}>
          Prototype
        </div>
      </header>

      {/* Body */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        <NodeSidebar />
        <WorkflowCanvas />

        {/* Right panel */}
        <aside style={{
          width: 280,
          borderLeft: "1px solid #e5e7eb",
          background: "#fff",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          flexShrink: 0,
        }}>
          <NodeFormPanel />
          <SandboxPanel />
        </aside>
      </div>
    </div>
  );
}