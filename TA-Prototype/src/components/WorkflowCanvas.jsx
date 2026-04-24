import React, { useRef, useCallback } from "react";
import ReactFlow, {
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  Background,
  Controls,
  MiniMap,
  MarkerType,
  Handle,
  Position,
} from "reactflow";
import "reactflow/dist/style.css";
import { useStore } from "../store";

// ── Design tokens ─────────────────────────────────────────────────────────────

const ACCENT = {
  start:     "#16a34a",
  task:      "#4f46e5",
  approval:  "#d97706",
  automated: "#0891b2",
  end:       "#dc2626",
};

const TYPE_LABELS = {
  start:     "Start",
  task:      "Task",
  approval:  "Approval",
  automated: "Automated",
  end:       "End",
};

// ── Shared node shell ─────────────────────────────────────────────────────────

function NodeShell({ type, title, meta, selected, hasInput = true, hasOutput = true }) {
  const color = ACCENT[type] || "#6b7280";
  const typeLabel = TYPE_LABELS[type] || type;

  return (
    <div style={{
      background: "#fff",
      borderRadius: 10,
      border: selected ? `2px solid ${color}` : "1px solid #e5e7eb",
      boxShadow: selected
        ? `0 0 0 3px ${color}22, 0 4px 16px rgba(0,0,0,0.1)`
        : "0 1px 6px rgba(0,0,0,0.07)",
      fontSize: 12,
      minWidth: 170,
      maxWidth: 220,
      fontFamily: "inherit",
      transition: "box-shadow 0.15s, border-color 0.15s",
    }}>
      {hasInput && (
        <Handle
          type="target"
          position={Position.Left}
          style={{
            background: color,
            width: 10,
            height: 10,
            border: "2px solid #fff",
            boxShadow: `0 0 0 1px ${color}`,
          }}
        />
      )}

      {/* Type bar */}
      <div style={{
        background: `${color}14`,
        borderBottom: `1px solid ${color}28`,
        borderRadius: "9px 9px 0 0",
        padding: "6px 10px",
        display: "flex",
        alignItems: "center",
        gap: 6,
      }}>
        <div style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: color,
          flexShrink: 0,
        }} />
        <span style={{
          fontSize: 9,
          fontWeight: 700,
          color,
          textTransform: "uppercase",
          letterSpacing: "0.1em",
        }}>
          {typeLabel}
        </span>
      </div>

      {/* Body */}
      <div style={{ padding: "9px 11px 11px" }}>
        <div style={{
          fontWeight: 700,
          color: "#111827",
          fontSize: 13,
          lineHeight: 1.3,
          marginBottom: meta ? 4 : 0,
        }}>
          {title}
        </div>
        {meta && (
          <div style={{
            fontSize: 10,
            color: "#6b7280",
            lineHeight: 1.5,
          }}>
            {meta}
          </div>
        )}
      </div>

      {hasOutput && (
        <Handle
          type="source"
          position={Position.Right}
          style={{
            background: color,
            width: 10,
            height: 10,
            border: "2px solid #fff",
            boxShadow: `0 0 0 1px ${color}`,
          }}
        />
      )}
    </div>
  );
}

// ── Node type components ──────────────────────────────────────────────────────

const StartNode = ({ data, selected }) => (
  <NodeShell
    type="start"
    title={data.title || "Start"}
    meta={data.metadata?.length ? `${data.metadata.length} metadata key(s) attached` : null}
    selected={selected}
    hasInput={false}
  />
);

const TaskNode = ({ data, selected }) => {
  const parts = [
    data.assignee && `Assignee: ${data.assignee}`,
    data.dueDate  && `Due: ${data.dueDate}`,
  ].filter(Boolean);
  return (
    <NodeShell
      type="task"
      title={data.title || "Task"}
      meta={parts.length ? parts.join(" · ") : null}
      selected={selected}
    />
  );
};

const ApprovalNode = ({ data, selected }) => (
  <NodeShell
    type="approval"
    title={data.title || "Approval"}
    meta={data.approverRole ? `Approver: ${data.approverRole}` : null}
    selected={selected}
  />
);

const AutomatedNode = ({ data, selected }) => (
  <NodeShell
    type="automated"
    title={data.title || "Automated Step"}
    meta={data.actionId ? `Action: ${data.actionId}` : "No action configured"}
    selected={selected}
  />
);

const EndNode = ({ data, selected }) => (
  <NodeShell
    type="end"
    title={data.title || "End"}
    meta={data.endMessage
      ? data.endMessage.slice(0, 48) + (data.endMessage.length > 48 ? "…" : "")
      : null}
    selected={selected}
    hasOutput={false}
  />
);

const nodeTypes = {
  start:     StartNode,
  task:      TaskNode,
  approval:  ApprovalNode,
  automated: AutomatedNode,
  end:       EndNode,
};

// ── Default node data ─────────────────────────────────────────────────────────

const DEFAULT_DATA = {
  start:     { title: "Start",           metadata: [] },
  task:      { title: "New Task",         description: "", assignee: "", dueDate: "", customFields: [] },
  approval:  { title: "Approval",         approverRole: "", autoApproveThreshold: 0 },
  automated: { title: "Automated Step",   actionId: "", params: {} },
  end:       { title: "End",              endMessage: "Workflow completed.", showSummary: false },
};

let nodeCounter = 100;

// ── Canvas ────────────────────────────────────────────────────────────────────

export default function WorkflowCanvas() {
  const {
    nodes, edges,
    setNodes, setEdges,
    setSelectedNodeId, selectedNodeId,
    deleteEdge,
  } = useStore();

  const rfRef = useRef(null);

  const onConnect = useCallback((params) => {
    setEdges(addEdge({
      ...params,
      animated: true,
      style: { stroke: "#4f46e5", strokeWidth: 2 },
      markerEnd: { type: MarkerType.ArrowClosed, color: "#4f46e5" },
    }, edges));
  }, [edges, setEdges]);

  const onDrop = useCallback((event) => {
    event.preventDefault();
    const type = event.dataTransfer.getData("nodeType");
    if (!type) return;

    if (type === "start" && nodes.some((n) => n.type === "start")) {
      alert("Only one Start node is allowed per workflow.");
      return;
    }

    const bounds = event.currentTarget.getBoundingClientRect();
    const position = rfRef.current.project({
      x: event.clientX - bounds.left,
      y: event.clientY - bounds.top,
    });

    const newNode = {
      id:       `${type}-${++nodeCounter}`,
      type,
      position,
      data:     { ...DEFAULT_DATA[type] },
    };

    setNodes([...nodes, newNode]);
    setSelectedNodeId(newNode.id);
  }, [nodes, setNodes, setSelectedNodeId]);

  const onEdgeClick = useCallback((_, edge) => {
    if (window.confirm("Delete this connection?")) deleteEdge(edge.id);
  }, [deleteEdge]);

  const onPaneClick = useCallback(() => setSelectedNodeId(null), [setSelectedNodeId]);

  const miniMapNodeColor = (n) => ACCENT[n.type] || "#9ca3af";

  return (
    <div style={{ flex: 1, height: "100%" }}>
      <ReactFlow
        nodes={nodes.map((n) => ({ ...n, selected: n.id === selectedNodeId }))}
        edges={edges}
        nodeTypes={nodeTypes}
        onInit={(inst) => (rfRef.current = inst)}
        onNodesChange={(changes) => setNodes(applyNodeChanges(changes, nodes))}
        onEdgesChange={(changes) => setEdges(applyEdgeChanges(changes, edges))}
        onConnect={onConnect}
        onDrop={onDrop}
        onDragOver={(e) => e.preventDefault()}
        onNodeClick={(_, node) => setSelectedNodeId(node.id)}
        onEdgeClick={onEdgeClick}
        onPaneClick={onPaneClick}
        fitView
        proOptions={{ hideAttribution: true }}
        defaultEdgeOptions={{
          animated: true,
          style: { stroke: "#4f46e5", strokeWidth: 2 },
          markerEnd: { type: MarkerType.ArrowClosed, color: "#4f46e5" },
        }}
      >
        <Background
          gap={20}
          size={1}
          color="#e5e7eb"
        />
        <Controls
          style={{
            background: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: 8,
            boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
          }}
        />
        <MiniMap
          nodeColor={miniMapNodeColor}
          maskColor="rgba(243,244,246,0.8)"
          style={{
            background: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: 8,
          }}
        />
      </ReactFlow>
    </div>
  );
}