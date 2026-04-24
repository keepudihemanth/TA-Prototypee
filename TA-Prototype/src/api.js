export const getAutomations = async () => [
  { id: "send_email", label: "Send Email", params: ["to", "subject"] },
  { id: "generate_doc", label: "Generate Doc", params: ["template"] },
];

export const simulateWorkflow = async ({ nodes, edges }) => {
  const start = nodes.find((n) => n.type === "start");
  let current = start;
  const steps = [];

  while (current) {
    steps.push({ message: `Executed ${current.type}` });

    const edge = edges.find((e) => e.source === current.id);
    if (!edge) break;

    current = nodes.find((n) => n.id === edge.target);
  }

  return { steps };
};