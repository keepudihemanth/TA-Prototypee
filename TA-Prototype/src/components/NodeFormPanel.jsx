import { useEffect, useState } from "react";
import { useStore } from "../store";
import { getAutomations } from "../api";

export default function NodeFormPanel() {
  const {
    nodes,
    selectedNodeId,
    updateNodeData,
    deleteNode,
  } = useStore();

  const node = nodes.find((n) => n.id === selectedNodeId);

  const [actions, setActions] = useState([]);

  useEffect(() => {
    getAutomations().then(setActions);
  }, []);

  if (!node) {
    return <div className="panel">Select a node</div>;
  }

  return (
    <div className="panel">
      <h4>Node Settings</h4>

      <button
        style={{ background: "red", marginBottom: 10 }}
        onClick={() => deleteNode(node.id)}
      >
        Delete Node
      </button>

      <input
        placeholder="Title"
        value={node.data?.title || ""}
        onChange={(e) =>
          updateNodeData(node.id, {
            title: e.target.value,
          })
        }
      />

      {node.type === "task" && (
        <>
          <input
            placeholder="Assignee"
            value={node.data?.assignee || ""}
            onChange={(e) =>
              updateNodeData(node.id, {
                assignee: e.target.value,
              })
            }
          />

          <input
            placeholder="Due Date"
            value={node.data?.dueDate || ""}
            onChange={(e) =>
              updateNodeData(node.id, {
                dueDate: e.target.value,
              })
            }
          />
        </>
      )}

      {node.type === "automated" && (
        <>
          <select
            value={node.data?.actionId || ""}
            onChange={(e) =>
              updateNodeData(node.id, {
                actionId: e.target.value,
                params: {},
              })
            }
          >
            <option value="">Select Action</option>
            {actions.map((a) => (
              <option key={a.id} value={a.id}>
                {a.label}
              </option>
            ))}
          </select>

          {actions
            .find((a) => a.id === node.data?.actionId)
            ?.params.map((p) => (
              <input
                key={p}
                placeholder={p}
                value={node.data?.params?.[p] || ""}
                onChange={(e) =>
                  updateNodeData(node.id, {
                    params: {
                      ...node.data?.params,
                      [p]: e.target.value,
                    },
                  })
                }
              />
            ))}
        </>
      )}
    </div>
  );
}