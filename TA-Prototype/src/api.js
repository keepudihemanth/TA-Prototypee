const delay = (ms) => new Promise((r) => setTimeout(r, ms));

export const getAutomations = async () => {
  await delay(200);
  return [
    { id: "send_email",    label: "Send Email",         params: ["to", "subject", "body"] },
    { id: "generate_doc",  label: "Generate Document",  params: ["template", "recipient"] },
    { id: "create_ticket", label: "Create JIRA Ticket", params: ["project", "summary", "assignee"] },
    { id: "slack_notify",  label: "Slack Notification", params: ["channel", "message"] },
    { id: "update_hris",   label: "Update HRIS Record", params: ["employeeId", "field", "value"] },
  ];
};

export const simulateWorkflow = async ({ nodes, edges }) => {
  await delay(700);

  // Topological sort → execution order
  const adj = {};
  const indeg = {};
  nodes.forEach((n) => { adj[n.id] = []; indeg[n.id] = 0; });
  edges.forEach((e) => { adj[e.source].push(e.target); indeg[e.target]++; });

  const queue = nodes.filter((n) => indeg[n.id] === 0);
  const order = [];
  while (queue.length) {
    const nd = queue.shift();
    order.push(nd);
    adj[nd.id].forEach((tid) => {
      indeg[tid]--;
      if (indeg[tid] === 0) queue.push(nodes.find((x) => x.id === tid));
    });
  }

  const steps = order.map((n) => {
    const d = n.data || {};
    const messages = {
      start:     `▶  Workflow started — "${d.title || "Start"}"${d.metadata?.length ? ` · ${d.metadata.length} metadata key(s)` : ""}`,
      task:      `📋 Task "${d.title || "Untitled"}" assigned to ${d.assignee || "unassigned"}${d.dueDate ? ` · Due ${d.dueDate}` : ""}`,
      approval:  `✅ Approval "${d.title || "Approval"}" sent to ${d.approverRole || "approver"}${d.autoApproveThreshold > 0 ? ` · Auto-approve after ${d.autoApproveThreshold}d` : ""}`,
      automated: `⚡ Action "${d.actionId || "none"}" triggered for "${d.title || "Automated Step"}"`,
      end:       `⏹  Workflow ended — ${d.endMessage || "Complete"}${d.showSummary ? " · Summary report enabled" : ""}`,
    };
    return {
      nodeId:  n.id,
      type:    n.type,
      label:   d.title || n.type,
      message: messages[n.type] || `Executed ${n.type}`,
      status:  "success",
    };
  });

  return { valid: true, steps };
};