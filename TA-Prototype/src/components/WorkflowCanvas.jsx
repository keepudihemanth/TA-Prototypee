import React, { useRef } from "react";
import ReactFlow, {
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  Background,
  Controls,
  MarkerType,
} from "reactflow";
import "reactflow/dist/style.css";

import { useStore } from "../store";

const baseStyle = {
  padding: "10px",
  borderRadius: "10px",
  background: "#fff",
  border: "1px solid #ddd",
  boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
  fontSize: "12px",
  minWidth: "140px",
};

const nodeTypes = {
  start: () => (
    <div style={{ ...baseStyle, borderLeft: "4px solid green" }}>
      🟢 <b>Start</b>
    </div>
  ),
  task: ({ data }) => (
    <div style={{ ...baseStyle, borderLeft: "4px solid blue" }}>
      📋 <b>{data.title || "Task"}</b>
      <div style={{ fontSize: 10 }}>{data.assignee}</div>
    </div>
  ),
  approval: () => (
    <div style={{ ...baseStyle, borderLeft: "4px solid orange" }}>
      ✅ <b>Approval</b>
    </div>
  ),
  automated: () => (
    <div style={{ ...baseStyle, borderLeft: "4px solid purple" }}>
      ⚙️ <b>Automation</b>
    </div>
  ),
  end: () => (
    <div style={{ ...baseStyle, borderLeft: "4px solid red" }}>
      🔴 <b>End</b>
    </div>
  ),
};

export default function WorkflowCanvas() {
  const {
    nodes,
    edges,
    setNodes,
    setEdges,
    setSelectedNodeId,
  } = useStore();

  const rfRef = useRef(null);

  const onConnect = (params) => {
    const newEdge = {
      ...params,
      animated: true,
      style: { stroke: "#2563eb", strokeWidth: 2 },
      markerEnd: {
        type: MarkerType.ArrowClosed,
      },
    };

    setEdges(addEdge(newEdge, edges));
  };

  const onDrop = (event) => {
    event.preventDefault();
    const type = event.dataTransfer.getData("nodeType");

    if (type === "start" && nodes.some((n) => n.type === "start")) {
      alert("Only one Start node allowed");
      return;
    }

    const position = rfRef.current.project({
      x: event.clientX,
      y: event.clientY,
    });

    const newNode = {
      id: Date.now().toString(),
      type,
      position,
      data: {},
    };

    setNodes([...nodes, newNode]);
  };

  return (
    <div style={{ flex: 1 }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onInit={(inst) => (rfRef.current = inst)}
        onNodesChange={(changes) =>
          setNodes(applyNodeChanges(changes, nodes))
        }
        onEdgesChange={(changes) =>
          setEdges(applyEdgeChanges(changes, edges))
        }
        onConnect={onConnect}
        onDrop={onDrop}
        onDragOver={(e) => e.preventDefault()}
        onNodeClick={(e, node) => setSelectedNodeId(node.id)}
        fitView
      >
        <Background gap={16} size={1} />
        <Controls />
      </ReactFlow>
    </div>
  );
}