import WorkflowCanvas from "./components/WorkflowCanvas";
import NodeSidebar    from "./components/NodeSidebar";
import NodeFormPanel  from "./components/NodeFormPanel";
import SandboxPanel   from "./components/SandboxPanel";
import { useStore }   from "./store";

function BrandIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <rect x="2"  y="2"  width="8" height="8" rx="2" fill="#4f46e5" />
      <rect x="14" y="2"  width="8" height="8" rx="2" fill="#4f46e5" opacity="0.5" />
      <rect x="2"  y="14" width="8" height="8" rx="2" fill="#4f46e5" opacity="0.5" />
      <rect x="14" y="14" width="8" height="8" rx="2" fill="#4f46e5" opacity="0.3" />
    </svg>
  );
}

export default function App() {
  const { nodes, edges } = useStore();

  return (
    <div className="app">

      <header className="toolbar">
        <div className="toolbar-brand">
          <div className="toolbar-brand-icon">
            <BrandIcon />
          </div>
          <div>
            <div className="toolbar-brand-title">HR Workflow Designer</div>
            <div className="toolbar-brand-subtitle">Visual Process Builder</div>
          </div>
        </div>

        <div className="toolbar-divider" />

        <div className="toolbar-stats">
          <span className="stat-pill">{nodes.length} Nodes</span>
          <span className="stat-pill">{edges.length} Edges</span>
        </div>

        <div className="toolbar-spacer" />

        <span className="prototype-badge">Prototype</span>
      </header>

      <div className="app-body">
        <NodeSidebar />
        <WorkflowCanvas />
        <aside className="right-panel">
          <NodeFormPanel />
          <SandboxPanel />
        </aside>
      </div>

    </div>
  );
}