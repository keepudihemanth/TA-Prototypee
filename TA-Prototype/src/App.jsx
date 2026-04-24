import WorkflowCanvas from "./components/WorkflowCanvas";
import NodeSidebar from "./components/NodeSidebar";
import NodeFormPanel from "./components/NodeFormPanel";
import SandboxPanel from "./components/SandboxPanel";

export default function App() {
  return (
    <div className="app">
      <NodeSidebar />
      <WorkflowCanvas />
      <div className="right-panel">
        <NodeFormPanel />
        <SandboxPanel />
      </div>
    </div>
  );
}