import { create } from "zustand";

export const useStore = create((set, get) => ({
  nodes: [],
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

    if (startNodes.length !== 1) {
      return "There must be exactly ONE Start node";
    }

    if (endNodes.length === 0) {
      return "At least one End node required";
    }

    // check connectivity
    for (let node of nodes) {
      const hasConnection =
        edges.some((e) => e.source === node.id) ||
        edges.some((e) => e.target === node.id);

      if (node.type !== "start" && !hasConnection) {
        return `Node ${node.id} is not connected`;
      }
    }

    return null;
  },
}));