import { useEffect, useState } from "react";
import { useStore } from "../store";
import { getAutomations } from "../api";

// ── Design tokens ─────────────────────────────────────────────────────────────

const ACCENT = {
  start:     { color: "#16a34a", bg: "#f0fdf4", label: "Start Node" },
  task:      { color: "#4f46e5", bg: "#eef2ff", label: "Task Node" },
  approval:  { color: "#d97706", bg: "#fffbeb", label: "Approval Node" },
  automated: { color: "#0891b2", bg: "#ecfeff", label: "Automated Step" },
  end:       { color: "#dc2626", bg: "#fef2f2", label: "End Node" },
};

// ── Shared primitives ─────────────────────────────────────────────────────────

const inputStyle = {
  width: "100%",
  padding: "7px 10px",
  borderRadius: 6,
  border: "1px solid #d1d5db",
  fontSize: 12,
  boxSizing: "border-box",
  fontFamily: "inherit",
  color: "#111827",
  background: "#fff",
  lineHeight: 1.4,
};

function Field({ label, hint, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{
        display: "block",
        fontSize: 10,
        fontWeight: 700,
        color: "#6b7280",
        textTransform: "uppercase",
        letterSpacing: "0.07em",
        marginBottom: 5,
      }}>
        {label}
      </label>
      {children}
      {hint && (
        <div style={{ fontSize: 10, color: "#9ca3af", marginTop: 4 }}>{hint}</div>
      )}
    </div>
  );
}

function TextInput({ value, onChange, placeholder, type = "text" }) {
  return (
    <input
      type={type}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      style={inputStyle}
    />
  );
}

function TextArea({ value, onChange, placeholder, rows = 3 }) {
  return (
    <textarea
      value={value}
      placeholder={placeholder}
      rows={rows}
      onChange={(e) => onChange(e.target.value)}
      style={{ ...inputStyle, resize: "vertical", lineHeight: 1.5 }}
    />
  );
}

function SelectInput({ value, onChange, options, placeholder = "Select…" }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{ ...inputStyle, cursor: "pointer" }}
    >
      <option value="">{placeholder}</option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  );
}

function KeyValueEditor({ pairs = [], onChange }) {
  const update = (i, field, val) => {
    const next = [...pairs];
    next[i] = { ...next[i], [field]: val };
    onChange(next);
  };

  return (
    <div>
      {pairs.map((p, i) => (
        <div key={i} style={{ display: "flex", gap: 6, marginBottom: 6 }}>
          <input
            placeholder="key"
            value={p.key}
            onChange={(e) => update(i, "key", e.target.value)}
            style={{ ...inputStyle, flex: 1 }}
          />
          <input
            placeholder="value"
            value={p.value}
            onChange={(e) => update(i, "value", e.target.value)}
            style={{ ...inputStyle, flex: 1 }}
          />
          <button
            onClick={() => onChange(pairs.filter((_, j) => j !== i))}
            style={{
              background: "none",
              border: "1px solid #fca5a5",
              color: "#dc2626",
              borderRadius: 5,
              padding: "0 10px",
              cursor: "pointer",
              fontSize: 14,
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            &times;
          </button>
        </div>
      ))}
      <button
        onClick={() => onChange([...pairs, { key: "", value: "" }])}
        style={{
          width: "100%",
          padding: "6px 0",
          background: "none",
          border: "1px dashed #d1d5db",
          color: "#6b7280",
          borderRadius: 6,
          cursor: "pointer",
          fontSize: 11,
          fontWeight: 600,
          marginTop: 2,
          fontFamily: "inherit",
        }}
      >
        + Add field
      </button>
    </div>
  );
}

// ── Per-type forms ────────────────────────────────────────────────────────────

function StartForm({ data, update }) {
  return (
    <>
      <Field label="Title">
        <TextInput
          value={data.title || ""}
          onChange={(v) => update({ title: v })}
          placeholder="Workflow entry point name"
        />
      </Field>
      <Field label="Metadata" hint="Optional key-value pairs attached to the workflow context.">
        <KeyValueEditor
          pairs={data.metadata || []}
          onChange={(metadata) => update({ metadata })}
        />
      </Field>
    </>
  );
}

function TaskForm({ data, update }) {
  return (
    <>
      <Field label="Title *">
        <TextInput
          value={data.title || ""}
          onChange={(v) => update({ title: v })}
          placeholder="Task name"
        />
      </Field>
      <Field label="Description">
        <TextArea
          value={data.description || ""}
          onChange={(v) => update({ description: v })}
          placeholder="Describe what needs to be completed…"
          rows={2}
        />
      </Field>
      <Field label="Assignee">
        <TextInput
          value={data.assignee || ""}
          onChange={(v) => update({ assignee: v })}
          placeholder="e.g. john.doe@company.com"
        />
      </Field>
      <Field label="Due Date">
        <TextInput
          type="date"
          value={data.dueDate || ""}
          onChange={(v) => update({ dueDate: v })}
        />
      </Field>
      <Field label="Custom Fields" hint="Attach additional metadata to this task.">
        <KeyValueEditor
          pairs={data.customFields || []}
          onChange={(customFields) => update({ customFields })}
        />
      </Field>
    </>
  );
}

const APPROVER_ROLES = [
  { value: "Manager",   label: "Manager" },
  { value: "HRBP",      label: "HR Business Partner" },
  { value: "Director",  label: "Director" },
  { value: "VP",        label: "Vice President" },
  { value: "CEO",       label: "CEO" },
];

function ApprovalForm({ data, update }) {
  return (
    <>
      <Field label="Title">
        <TextInput
          value={data.title || ""}
          onChange={(v) => update({ title: v })}
          placeholder="Approval step name"
        />
      </Field>
      <Field label="Approver Role">
        <SelectInput
          value={data.approverRole || ""}
          onChange={(v) => update({ approverRole: v })}
          options={APPROVER_ROLES}
        />
      </Field>
      <Field
        label="Auto-approve Threshold (days)"
        hint="Automatically approve if pending longer than N days. Set 0 to disable."
      >
        <TextInput
          type="number"
          value={String(data.autoApproveThreshold ?? "")}
          onChange={(v) => update({ autoApproveThreshold: Number(v) })}
          placeholder="0"
        />
      </Field>
    </>
  );
}

function AutomatedForm({ data, update, actions }) {
  const selected = actions.find((a) => a.id === data.actionId);

  const handleAction = (actionId) => {
    const act = actions.find((a) => a.id === actionId);
    const params = {};
    act?.params.forEach((p) => { params[p] = ""; });
    update({ actionId, params });
  };

  return (
    <>
      <Field label="Title">
        <TextInput
          value={data.title || ""}
          onChange={(v) => update({ title: v })}
          placeholder="Automated step name"
        />
      </Field>
      <Field label="Action" hint="Select a system action to execute at this step.">
        <SelectInput
          value={data.actionId || ""}
          onChange={handleAction}
          options={actions.map((a) => ({ value: a.id, label: a.label }))}
          placeholder="Select action…"
        />
      </Field>
      {selected?.params.map((p) => (
        <Field key={p} label={p}>
          <TextInput
            value={data.params?.[p] || ""}
            placeholder={`Enter ${p}…`}
            onChange={(v) => update({ params: { ...data.params, [p]: v } })}
          />
        </Field>
      ))}
    </>
  );
}

function EndForm({ data, update }) {
  return (
    <>
      <Field label="Completion Message">
        <TextArea
          value={data.endMessage || ""}
          onChange={(v) => update({ endMessage: v })}
          placeholder="Message displayed when the workflow completes…"
        />
      </Field>
      <Field label="Options">
        <label style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          fontSize: 12,
          color: "#374151",
          cursor: "pointer",
        }}>
          <input
            type="checkbox"
            checked={!!data.showSummary}
            onChange={(e) => update({ showSummary: e.target.checked })}
            style={{ width: 14, height: 14, accentColor: "#4f46e5", cursor: "pointer" }}
          />
          Generate summary report on completion
        </label>
      </Field>
    </>
  );
}

// ── Panel shell ───────────────────────────────────────────────────────────────

const FORMS = {
  start:     StartForm,
  task:      TaskForm,
  approval:  ApprovalForm,
  automated: AutomatedForm,
  end:       EndForm,
};

export default function NodeFormPanel() {
  const { nodes, selectedNodeId, updateNodeData, deleteNode, setSelectedNodeId } = useStore();
  const node = nodes.find((n) => n.id === selectedNodeId);
  const [actions, setActions] = useState([]);

  useEffect(() => { getAutomations().then(setActions); }, []);

  if (!node) {
    return (
      <div style={{
        padding: "28px 20px",
        textAlign: "center",
        color: "#9ca3af",
        borderBottom: "1px solid #f3f4f6",
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
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
        </div>
        <div style={{ fontWeight: 600, color: "#6b7280", fontSize: 13, marginBottom: 4 }}>
          No node selected
        </div>
        <div style={{ fontSize: 11, lineHeight: 1.6 }}>
          Click any node on the canvas<br />to view and edit its properties.
        </div>
      </div>
    );
  }

  const accent = ACCENT[node.type] || ACCENT.task;
  const Form = FORMS[node.type];
  const update = (data) => updateNodeData(node.id, data);

  return (
    <div style={{ borderBottom: "1px solid #f3f4f6", display: "flex", flexDirection: "column" }}>

      {/* Header */}
      <div style={{
        padding: "10px 14px",
        background: accent.bg,
        borderBottom: "1px solid #e5e7eb",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        <div>
          <div style={{
            fontSize: 10,
            fontWeight: 700,
            color: accent.color,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
          }}>
            {accent.label}
          </div>
          <div style={{ fontSize: 10, color: "#9ca3af", marginTop: 2, fontFamily: "monospace" }}>
            {node.id}
          </div>
        </div>

        <div style={{ display: "flex", gap: 5 }}>
          <button
            onClick={() => setSelectedNodeId(null)}
            title="Deselect"
            style={{
              background: "none",
              border: "1px solid #d1d5db",
              borderRadius: 5,
              padding: "4px 9px",
              cursor: "pointer",
              fontSize: 12,
              color: "#6b7280",
              lineHeight: 1,
            }}
          >
            &times;
          </button>
          <button
            onClick={() => deleteNode(node.id)}
            title="Delete node"
            style={{
              background: "#fef2f2",
              border: "1px solid #fca5a5",
              color: "#dc2626",
              borderRadius: 5,
              padding: "4px 9px",
              cursor: "pointer",
              fontSize: 11,
              fontWeight: 700,
              lineHeight: 1,
            }}
          >
            Delete
          </button>
        </div>
      </div>

      {/* Form body */}
      <div style={{ padding: "14px 14px 4px", overflowY: "auto", maxHeight: 380 }}>
        {Form
          ? <Form data={node.data} update={update} actions={actions} />
          : <div style={{ fontSize: 12, color: "#9ca3af" }}>No configuration form for this node type.</div>
        }
      </div>
    </div>
  );
}