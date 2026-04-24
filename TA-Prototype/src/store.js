import { create } from "zustand";

export const useStore = create((set, get) => ({
  nodes: [
    {
      id: "start-1",
      type: "start",
      position: { x: 80, y: 200 },
      data: { title: "Workflow Start", metadata: [] },
    },
  ],
  edges: [],
  selectedNodeId: null,

  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),
  setSelectedNodeId: (id) => set({ selectedNodeId: id }),

  updateNodeData: (id, data) =>
    set((state) => ({
      nodes: state.nodes.map((n) =>
        n.id === id ? { ...n, data: { ...n.data, ...data } } : n
      ),
    })),

  deleteNode: (id) =>
    set((state) => ({
      nodes: state.nodes.filter((n) => n.id !== id),
      edges: state.edges.filter(
        (e) => e.source !== id && e.target !== id
      ),
      selectedNodeId: null,
    })),

  deleteEdge: (id) =>
    set((state) => ({
      edges: state.edges.filter((e) => e.id !== id),
    })),

  validateWorkflow: () => {
    const { nodes, edges } = get();
    const startNodes = nodes.filter((n) => n.type === "start");
    const endNodes = nodes.filter((n) => n.type === "end");

    if (startNodes.length === 0)
      return "Workflow must have exactly one Start node.";
    if (startNodes.length > 1)
      return "Only one Start node is allowed.";
    if (endNodes.length === 0)
      return "Workflow must have at least one End node.";

    for (let node of nodes) {
      if (node.type === "start") continue;
      const connected =
        edges.some((e) => e.source === node.id) ||
        edges.some((e) => e.target === node.id);
      if (!connected)
        return `Node "${node.data?.title || node.id}" is not connected to anything.`;
    }

    // Cycle detection (DFS)
    const adj = {};
    nodes.forEach((n) => (adj[n.id] = []));
    edges.forEach((e) => adj[e.source]?.push(e.target));
    const visited = new Set();
    const stack = new Set();
    let hasCycle = false;
    function dfs(id) {
      if (stack.has(id)) { hasCycle = true; return; }
      if (visited.has(id)) return;
      visited.add(id); stack.add(id);
      (adj[id] || []).forEach(dfs);
      stack.delete(id);
    }
    nodes.forEach((n) => { if (!visited.has(n.id)) dfs(n.id); });
    if (hasCycle) return "Workflow contains a cycle. Remove circular connections.";

    return null;
  },
}));