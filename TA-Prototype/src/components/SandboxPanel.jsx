import { useState } from "react";
import { useStore } from "../store";
import { simulateWorkflow } from "../api";

const TYPE_LABELS = {
  start:     "Start",
  task:      "Task",
  approval:  "Approval",
  automated: "Automated",
  end:       "End",
};

const STATUS_COLORS = {
  success: { bg: "#f0fdf4", border: "#86efac", text: "#15803d", dot: "#16a34a" },
  error:   { bg: "#fef2f2", border: "#fca5a5", text: "#dc2626", dot: "#dc2626" },
};

function StatusDot({ status }) {
  const c = STATUS_COLORS[status] || STATUS_COLORS.success;
  return (
    <div style={{
      width: 20,
      height: 20,
      borderRadius: "50%",
      background: c.bg,
      border: `1px solid ${c.border}`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
      marginTop: 1,
    }}>
      {status === "error"
        ? <svg width="8" height="8" viewBox="0 0 12 12"><path d="M2 2l8 8M10 2l-8 8" stroke={c.dot} strokeWidth="2" strokeLinecap="round"/></svg>
        : <svg width="8" height="8" viewBox="0 0 12 12"><path d="M2 6l3 3 5-5" stroke={c.dot} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>
      }
    </div>
  );
}

export default function SandboxPanel() {
  const { nodes, edges, validateWorkflow } = useStore();
  const [logs, setLogs]       = useState([]);
  const [loading, setLoading] = useState(false);
  const [valid, setValid]     = useState(null);
  const [tab, setTab]         = useState("log");

  const run = async () => {
    const error = validateWorkflow();
    if (error) {
      setValid(false);
      setLogs([{ message: error, status: "error", label: "Validation Error", type: "start" }]);
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

  const json = JSON.stringify(
    { nodes: nodes.map((n) => ({ id: n.id, type: n.type, data: n.data })), edges },
    null, 2
  );

  const tabBtn = (key, label) => (
    <button
      key={key}
      onClick={() => setTab(key)}
      style={{
        background: "none",
        border: "none",
        borderBottom: tab === key ? "2px solid #4f46e5" : "2px solid transparent",
        color: tab === key ? "#4f46e5" : "#9ca3af",
        padding: "8px 12px",
        cursor: "pointer",
        fontSize: 10,
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: "0.07em",
        fontFamily: "inherit",
        transition: "color 0.1s",
      }}
    >
      {label}
    </button>
  );

  return (
    <div style={{
      flex: 1,
      display: "flex",
      flexDirection: "column",
      minHeight: 0,
      overflow: "hidden",
    }}>

      {/* Header row */}
      <div style={{
        padding: "12px 14px 0",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: "#111827", letterSpacing: "0.01em" }}>
          Simulation
        </span>
        <button
          onClick={run}
          disabled={loading}
          style={{
            background: loading ? "#c7d2fe" : "#4f46e5",
            border: "none",
            borderRadius: 6,
            padding: "6px 14px",
            color: "#fff",
            cursor: loading ? "not-allowed" : "pointer",
            fontSize: 11,
            fontWeight: 700,
            fontFamily: "inherit",
            letterSpacing: "0.02em",
            transition: "background 0.15s",
          }}
        >
          {loading ? "Running…" : "Run"}
        </button>
      </div>

      {/* Tabs */}
      <div style={{
        display: "flex",
        borderBottom: "1px solid #e5e7eb",
        padding: "0 14px",
        marginTop: 4,
      }}>
        {tabBtn("log", "Execution Log")}
        {tabBtn("json", "JSON")}
      </div>

      {/* Content area */}
      <div style={{ flex: 1, overflowY: "auto", padding: "12px 14px" }}>
        {tab === "json" ? (
          <pre style={{
            background: "#f9fafb",
            borderRadius: 7,
            padding: "10px 12px",
            margin: 0,
            fontSize: 10,
            overflowX: "auto",
            lineHeight: 1.7,
            border: "1px solid #e5e7eb",
            color: "#374151",
            fontFamily: "'Fira Code', 'Courier New', monospace",
          }}>
            {json}
          </pre>
        ) : (
          <>
            {/* Empty state */}
            {!loading && logs.length === 0 && (
              <div style={{
                textAlign: "center",
                color: "#9ca3af",
                padding: "32px 0",
              }}>
                <div style={{
                  width: 36,
                  height: 36,
                  background: "#f3f4f6",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 12px",
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2">
                    <polygon points="5 3 19 12 5 21 5 3"/>
                  </svg>
                </div>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#6b7280", marginBottom: 4 }}>
                  Ready to simulate
                </div>
                <div style={{ fontSize: 11, lineHeight: 1.6 }}>
                  Click Run to validate and<br />execute the workflow.
                </div>
              </div>
            )}

            {/* Loading */}
            {loading && (
              <div style={{
                textAlign: "center",
                color: "#4f46e5",
                padding: "32px 0",
                fontSize: 12,
              }}>
                Simulating workflow…
              </div>
            )}

            {/* Results */}
            {!loading && logs.length > 0 && (
              <>
                {/* Summary banner */}
                <div style={{
                  background: valid ? "#f0fdf4" : "#fef2f2",
                  border: `1px solid ${valid ? "#86efac" : "#fca5a5"}`,
                  borderRadius: 7,
                  padding: "8px 12px",
                  marginBottom: 12,
                  fontSize: 11,
                  color: valid ? "#15803d" : "#dc2626",
                  fontWeight: 700,
                }}>
                  {valid
                    ? `Executed ${logs.length} step${logs.length !== 1 ? "s" : ""} successfully.`
                    : `${logs.length} validation error${logs.length !== 1 ? "s" : ""} detected.`}
                </div>

                {/* Step rows */}
                {logs.map((log, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      gap: 10,
                      padding: "9px 0",
                      borderBottom: "1px solid #f3f4f6",
                    }}
                  >
                    <StatusDot status={log.status} />
                    <div style={{ flex: 1 }}>
                      <div style={{
                        fontWeight: 700,
                        color: "#111827",
                        fontSize: 11,
                        marginBottom: 2,
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                      }}>
                        {log.label || log.type}
                        {log.type && (
                          <span style={{
                            fontSize: 9,
                            fontWeight: 700,
                            color: "#9ca3af",
                            textTransform: "uppercase",
                            letterSpacing: "0.06em",
                            background: "#f3f4f6",
                            padding: "1px 5px",
                            borderRadius: 4,
                          }}>
                            {TYPE_LABELS[log.type] || log.type}
                          </span>
                        )}
                      </div>
                      <div style={{
                        color: "#6b7280",
                        fontSize: 11,
                        lineHeight: 1.5,
                      }}>
                        {log.message}
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}