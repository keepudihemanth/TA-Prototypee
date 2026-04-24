import { useState }          from "react";
import { useStore }          from "../store";
import { simulateWorkflow }  from "../api";

const TYPE_LABELS = {
  start:     "Start",
  task:      "Task",
  approval:  "Approval",
  automated: "Automated",
  end:       "End",
};

function CheckIcon({ color }) {
  return (
    <svg width="8" height="8" viewBox="0 0 12 12" fill="none">
      <path d="M2 6l3 3 5-5" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CrossIcon({ color }) {
  return (
    <svg width="8" height="8" viewBox="0 0 12 12" fill="none">
      <path d="M2 2l8 8M10 2l-8 8" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2">
      <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
  );
}

function StepRow({ log }) {
  const isSuccess = log.status !== "error";

  return (
    <div className="step-row">
      <div className={`step-status-dot ${isSuccess ? "success" : "error"}`}>
        {isSuccess
          ? <CheckIcon color="#16a34a" />
          : <CrossIcon color="#dc2626" />
        }
      </div>
      <div>
        <div className="step-label">
          {log.label || log.type}
          {log.type && (
            <span className="step-type-badge">
              {TYPE_LABELS[log.type] || log.type}
            </span>
          )}
        </div>
        <p className="step-message">{log.message}</p>
      </div>
    </div>
  );
}

export default function SandboxPanel() {
  const { nodes, edges, validateWorkflow } = useStore();
  const [logs,    setLogs]    = useState([]);
  const [loading, setLoading] = useState(false);
  const [valid,   setValid]   = useState(null);
  const [tab,     setTab]     = useState("log");

  const run = async () => {
    const error = validateWorkflow();

    if (error) {
      setValid(false);
      setLogs([{ message: error, status: "error", label: "Validation Error", type: null }]);
      return;
    }

    setLoading(true);
    setLogs([]);
    setValid(null);

    const result = await simulateWorkflow({ nodes, edges });
    setValid(result.valid);
    setLogs(result.steps || []);
    setLoading(false);
  };

  const jsonPayload = JSON.stringify(
    { nodes: nodes.map((n) => ({ id: n.id, type: n.type, data: n.data })), edges },
    null,
    2
  );

  return (
    <div className="sandbox-panel">

      <div className="sandbox-header">
        <span className="sandbox-title">Simulation</span>
        <button
          className="btn btn-primary"
          onClick={run}
          disabled={loading}
        >
          {loading ? "Running…" : "Run"}
        </button>
      </div>

      <div className="sandbox-tabs">
        <button
          className={`sandbox-tab ${tab === "log" ? "active" : ""}`}
          onClick={() => setTab("log")}
        >
          Execution Log
        </button>
        <button
          className={`sandbox-tab ${tab === "json" ? "active" : ""}`}
          onClick={() => setTab("json")}
        >
          JSON
        </button>
      </div>

      <div className="sandbox-content">

        {/* JSON view */}
        {tab === "json" && (
          <pre className="sandbox-json">{jsonPayload}</pre>
        )}

        {/* Log view */}
        {tab === "log" && (
          <>
            {/* Empty state */}
            {!loading && logs.length === 0 && (
              <div className="sandbox-empty">
                <div className="sandbox-empty-icon">
                  <PlayIcon />
                </div>
                <p className="sandbox-empty-title">Ready to simulate</p>
                <p className="sandbox-empty-hint">
                  Click Run to validate and<br />execute the workflow.
                </p>
              </div>
            )}

            {/* Loading state */}
            {loading && (
              <p className="sandbox-loading">Simulating workflow…</p>
            )}

            {/* Results */}
            {!loading && logs.length > 0 && (
              <>
                <div className={`sandbox-banner ${valid ? "success" : "error"}`}>
                  {valid
                    ? `Executed ${logs.length} step${logs.length !== 1 ? "s" : ""} successfully.`
                    : `${logs.length} validation error${logs.length !== 1 ? "s" : ""} detected.`
                  }
                </div>
                {logs.map((log, i) => (
                  <StepRow key={i} log={log} />
                ))}
              </>
            )}
          </>
        )}

      </div>
    </div>
  );
}