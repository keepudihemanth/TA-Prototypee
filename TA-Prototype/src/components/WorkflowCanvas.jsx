import { useRef, useCallback }  from "react";
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

const DEFAULT_DATA = {
  start:     { title: "Start",          metadata: [] },
  task:      { title: "New Task",        description: "", assignee: "", dueDate: "", customFields: [] },
  approval:  { title: "Approval",        approverRole: "", autoApproveThreshold: 0 },
  automated: { title: "Automated Step",  actionId: "", params: {} },
  end:       { title: "End",             endMessage: "Workflow completed.", showSummary: false },
};

let nodeCounter = 100;

/*Shared node shell  */

function NodeShell({ type, title, meta, selected, hasInput = true, hasOutput = true }) {
  const color = ACCENT[type] || "#6b7280";

  return (
    <div
      className={`workflow-node ${selected ? "selected" : ""}`}
      style={selected ? {
        borderColor: color,
        boxShadow: `0 0 0 3px ${color}22, 0 4px 16px rgba(0,0,0,0.1)`,
      } : {}}
    >
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

      <div
        className="node-type-bar"
        style={{
          background: `${color}14`,
          borderBottom: `1px solid ${color}28`,
        }}
      >
        <span className="node-type-dot" style={{ background: color }} />
        <span className="node-type-label" style={{ color }}>{TYPE_LABELS[type]}</span>
      </div>

      <div className="node-body">
        <p className={`node-title ${meta ? "has-meta" : ""}`}>{title}</p>
        {meta && <p className="node-meta">{meta}</p>}
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

/* Individual node components  */

function StartNode({ data, selected }) {
  const meta = data.metadata?.length
    ? `${data.metadata.length} metadata key(s) attached`
    : null;
  return <NodeShell type="start" title={data.title || "Start"} meta={meta} selected={selected} hasInput={false} />;
}

function TaskNode({ data, selected }) {
  const parts = [
    data.assignee && `Assignee: ${data.assignee}`,
    data.dueDate  && `Due: ${data.dueDate}`,
  ].filter(Boolean);
  return <NodeShell type="task" title={data.title || "Task"} meta={parts.join(" · ") || null} selected={selected} />;
}

function ApprovalNode({ data, selected }) {
  return (
    <NodeShell
      type="approval"
      title={data.title || "Approval"}
      meta={data.approverRole ? `Approver: ${data.approverRole}` : null}
      selected={selected}
    />
  );
}

function AutomatedNode({ data, selected }) {
  return (
    <NodeShell
      type="automated"
      title={data.title || "Automated Step"}
      meta={data.actionId ? `Action: ${data.actionId}` : "No action configured"}
      selected={selected}
    />
  );
}

function EndNode({ data, selected }) {
  const msg = data.endMessage
    ? data.endMessage.slice(0, 48) + (data.endMessage.length > 48 ? "…" : "")
    : null;
  return <NodeShell type="end" title={data.title || "End"} meta={msg} selected={selected} hasOutput={false} />;
}

const nodeTypes = { start: StartNode, task: TaskNode, approval: ApprovalNode, automated: AutomatedNode, end: EndNode };

/* Canvas  */

export default function WorkflowCanvas() {
  const {
    nodes, edges,
    setNodes, setEdges,
    setSelectedNodeId, selectedNodeId,
    deleteEdge,
  } = useStore();

  const rfInstance = useRef(null);

  const onConnect = useCallback((params) => {
    setEdges(addEdge({
      ...params,
      animated: true,
      style:     { stroke: "#4f46e5", strokeWidth: 2 },
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

    const bounds   = event.currentTarget.getBoundingClientRect();
    const position = rfInstance.current.project({
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

  const onPaneClick = useCallback(() => {
    setSelectedNodeId(null);
  }, [setSelectedNodeId]);

  return (
    <div className="canvas-wrapper">
      <ReactFlow
        nodes={nodes.map((n) => ({ ...n, selected: n.id === selectedNodeId }))}
        edges={edges}
        nodeTypes={nodeTypes}
        onInit={(instance) => (rfInstance.current = instance)}
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
          animated:  true,
          style:     { stroke: "#4f46e5", strokeWidth: 2 },
          markerEnd: { type: MarkerType.ArrowClosed, color: "#4f46e5" },
        }}
      >
        <Background gap={20} size={1} color="#e5e7eb" />
        <Controls />
        <MiniMap
          nodeColor={(n) => ACCENT[n.type] || "#9ca3af"}
          maskColor="rgba(243,244,246,0.8)"
        />
      </ReactFlow>
    </div>
  );
}