import { useState } from "react";
import { useStore } from "../store";
import { simulateWorkflow } from "../api";

export default function SandboxPanel() {
  const { nodes, edges, validateWorkflow } = useStore();
  const [logs, setLogs] = useState([]);

  const run = async () => {
    const error = validateWorkflow();

    if (error) {
      alert(error);
      return;
    }

    const result = await simulateWorkflow({ nodes, edges });
    setLogs(result.steps);
  };

  return (
    <div className="panel">
      <h4>Simulation</h4>

      <button onClick={run}>Run Workflow</button>

      <div style={{ marginTop: 10 }}>
        {logs.map((l, i) => (
          <div
            key={i}
            style={{
              padding: 6,
              background: "#f3f4f6",
              marginBottom: 5,
              borderRadius: 5,
            }}
          >
            ➡️ {l.message}
          </div>
        ))}
      </div>
    </div>
  );
}