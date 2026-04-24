import { useEffect, useState } from "react";
import { useStore }            from "../store";
import { getAutomations }      from "../api";


const ACCENT = {
  start:     { color: "#16a34a", bg: "#f0fdf4", label: "Start Node" },
  task:      { color: "#4f46e5", bg: "#eef2ff", label: "Task Node" },
  approval:  { color: "#d97706", bg: "#fffbeb", label: "Approval Node" },
  automated: { color: "#0891b2", bg: "#ecfeff", label: "Automated Step" },
  end:       { color: "#dc2626", bg: "#fef2f2", label: "End Node" },
};

const APPROVER_ROLES = [
  { value: "Manager",  label: "Manager" },
  { value: "HRBP",     label: "HR Business Partner" },
  { value: "Director", label: "Director" },
  { value: "VP",       label: "Vice President" },
  { value: "CEO",      label: "CEO" },
];

/*Reusable form primitives */

function Field({ label, hint, children }) {
  return (
    <div className="field">
      <label className="field-label">{label}</label>
      {children}
      {hint && <p className="field-hint">{hint}</p>}
    </div>
  );
}

function TextInput({ value, onChange, placeholder, type = "text" }) {
  return (
    <input
      type={type}
      className="field-input"
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

function TextArea({ value, onChange, placeholder, rows = 3 }) {
  return (
    <textarea
      className="field-textarea"
      value={value}
      placeholder={placeholder}
      rows={rows}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

function SelectInput({ value, onChange, options, placeholder = "Select…" }) {
  return (
    <select
      className="field-select"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      <option value="">{placeholder}</option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  );
}

function KeyValueEditor({ pairs = [], onChange }) {
  const update = (index, field, val) => {
    const next = [...pairs];
    next[index] = { ...next[index], [field]: val };
    onChange(next);
  };

  const remove = (index) => onChange(pairs.filter((_, i) => i !== index));
  const add    = ()      => onChange([...pairs, { key: "", value: "" }]);

  return (
    <div>
      {pairs.map((pair, index) => (
        <div key={index} className="kv-row">
          <input
            className="kv-input"
            placeholder="key"
            value={pair.key}
            onChange={(e) => update(index, "key", e.target.value)}
          />
          <input
            className="kv-input"
            placeholder="value"
            value={pair.value}
            onChange={(e) => update(index, "value", e.target.value)}
          />
          <button className="kv-remove-btn btn" onClick={() => remove(index)}>
            &times;
          </button>
        </div>
      ))}
      <button className="kv-add-btn btn" onClick={add}>
        + Add field
      </button>
    </div>
  );
}

/* Per-type configuration forms */

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
  const selectedAction = actions.find((a) => a.id === data.actionId);

  const handleActionChange = (actionId) => {
    const action = actions.find((a) => a.id === actionId);
    const params = {};
    action?.params.forEach((p) => { params[p] = ""; });
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
          onChange={handleActionChange}
          options={actions.map((a) => ({ value: a.id, label: a.label }))}
          placeholder="Select action…"
        />
      </Field>
      {selectedAction?.params.map((param) => (
        <Field key={param} label={param}>
          <TextInput
            value={data.params?.[param] || ""}
            placeholder={`Enter ${param}…`}
            onChange={(v) => update({ params: { ...data.params, [param]: v } })}
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
        <label className="field-checkbox-row">
          <input
            type="checkbox"
            className="field-checkbox"
            checked={!!data.showSummary}
            onChange={(e) => update({ showSummary: e.target.checked })}
          />
          Generate summary report on completion
        </label>
      </Field>
    </>
  );
}

/*  Main panel */

const FORM_MAP = {
  start:     StartForm,
  task:      TaskForm,
  approval:  ApprovalForm,
  automated: AutomatedForm,
  end:       EndForm,
};

export default function NodeFormPanel() {
  const { nodes, selectedNodeId, updateNodeData, deleteNode, setSelectedNodeId } = useStore();
  const [actions, setActions] = useState([]);

  const node = nodes.find((n) => n.id === selectedNodeId);

  useEffect(() => {
    getAutomations().then(setActions);
  }, []);

  /* Empty state — no node selected */
  if (!node) {
    return (
      <div className="form-panel-empty">
        <div className="form-panel-empty-icon">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </div>
        <p className="form-panel-empty-title">No node selected</p>
        <p className="form-panel-empty-hint">
          Click any node on the canvas<br />to view and edit its properties.
        </p>
      </div>
    );
  }

  const accent = ACCENT[node.type] || ACCENT.task;
  const Form   = FORM_MAP[node.type];
  const update = (data) => updateNodeData(node.id, data);

  return (
    <div className="form-panel">

      {/* Header — accent bg/color are dynamic per node type */}
      <div
        className="form-panel-header"
        style={{ background: accent.bg }}
      >
        <div>
          <p className="form-panel-header-type" style={{ color: accent.color }}>
            {accent.label}
          </p>
          <p className="form-panel-header-id">{node.id}</p>
        </div>
        <div className="form-panel-header-actions">
          <button
            className="btn btn-ghost"
            title="Deselect node"
            onClick={() => setSelectedNodeId(null)}
          >
            &times;
          </button>
          <button
            className="btn btn-danger"
            title="Delete node"
            onClick={() => deleteNode(node.id)}
          >
            Delete
          </button>
        </div>
      </div>

      {/* Form body */}
      <div className="form-panel-body">
        {Form
          ? <Form data={node.data} update={update} actions={actions} />
          : <p style={{ fontSize: 12, color: "#9ca3af" }}>No configuration available.</p>
        }
      </div>

    </div>
  );
}