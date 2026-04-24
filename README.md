#  HR Workflow Designer

A visual, browser-based workflow builder for HR processes such as onboarding, approvals, and automation flows.
This prototype demonstrates **React Flow integration, dynamic node configuration, branching logic, and workflow simulation**.

---

##  Overview

The HR Workflow Designer allows an HR admin to:

* Visually create workflows using drag-and-drop
* Configure each step using dynamic forms
* Define branching logic (YES / NO)
* Simulate workflow execution step-by-step

This is a **frontend-only prototype** with a mock API layer.

---

##  Features

###  Workflow Canvas

* Drag & drop nodes from sidebar
* Connect nodes with edges
* Pan, zoom, and navigate freely
* Visual grid and controls

---

###  Node Types

| Type          | Description                           |
| ------------- | ------------------------------------- |
| **Start**     | Entry point of workflow               |
| **Task**      | Human task (assignee, due date)       |
| **Approval**  | Decision node with YES/NO branching   |
| **Automated** | System action with dynamic parameters |
| **End**       | Workflow completion                   |

---

###  Node Configuration Panel

* Opens when a node is selected
* Controlled React forms
* Real-time updates via Zustand
* Dynamic fields for Automated nodes

---

###  Edge Configuration (Branching)

* Click edge to edit
* Assign labels:

  * `YES`
  * `NO`
* Used for conditional flow (Approval nodes)

---

###  Workflow Simulation

* Runs workflow from Start node
* Traverses graph using edges
* Approval nodes follow **YES path**
* Displays execution logs step-by-step

---

###  Validation

* Only **one Start node allowed**
* At least **one End node required**
* Prevents invalid workflows during simulation

---

##  Tech Stack

| Layer            | Technology             |
| ---------------- | ---------------------- |
| Frontend         | React (Vite)           |
| Graph Engine     | React Flow             |
| State Management | Zustand                |
| Styling          | CSS + Inline Styles    |
| API              | Mock (local functions) |

---

##  Project Structure

```bash
src/
 ├── components/
 │    ├── WorkflowCanvas.jsx   # React Flow canvas + connections
 │    ├── NodeSidebar.jsx      # Drag & drop node palette
 │    ├── NodeFormPanel.jsx    # Node configuration UI
 │    ├── EdgeFormPanel.jsx    # Edge label editing
 │    └── SandboxPanel.jsx     # Simulation runner
 │
 ├── store.js                 # Zustand global state
 ├── api.js                   # Mock API (simulate + automations)
 ├── App.jsx                  # Layout
 ├── main.jsx                 # Entry point
 └── styles.css               # UI styling
```

---

##  Installation

###  Prerequisites

* Node.js ≥ 18
* npm ≥ 9

Check versions:

```bash
node -v
npm -v
```

---

###  Install Dependencies

```bash
npm install
npm install reactflow zustand
```

---

##  Running the App

```bash
npm run dev
```

App runs at:

```bash
http://localhost:5173
```

---

##  Build for Production

```bash
npm run build
npm run preview
```

---

##  Usage Guide

### 1. Create Workflow

* Drag nodes from sidebar
* Drop onto canvas

---

### 2. Configure Nodes

* Click node → edit in right panel
* Fill required fields

---

### 3. Connect Nodes

* Drag from one node to another
* Edges automatically created

---

### 4. Add Branching

* Click edge → set label:

  * YES
  * NO

---

### 5. Run Simulation

* Click **Run Workflow**
* View execution logs

---

##  Architecture Notes

### 🔹 State Management (Zustand)

* Central store for:

  * nodes
  * edges
  * selection
* Keeps React Flow in sync
* Enables easy updates & scalability

---

### 🔹 Graph Model

* Nodes → workflow steps
* Edges → execution path
* Edge labels → branching logic

---

### 🔹 Dynamic Forms

* Based on `node.type`
* Automated node:

  * Fetches action
  * Dynamically renders parameters

---

### 🔹 Simulation Engine

* Starts from Start node
* Traverses edges
* Approval nodes:

  * Follow **YES branch**
* Stops when no next node

---

## Design Decisions

*  Zustand over Redux (lighter, faster)
*  No form library (manual control)
*  Mock API for flexibility
*  Edge-based branching (simple + scalable)
*  UI kept minimal but structured

---

##  Scalability

This design supports:

* Adding new node types easily
* Extending branching logic
* Backend integration (API replacement)
* Workflow persistence (future)
* TypeScript conversion

---

##  Assumptions

* Single Start node per workflow
* Graph is acyclic
* Approval uses YES path by default
* No backend persistence
* Parameters are simple strings

---

##  Known Limitations

* No cycle detection (can be added)
* No save/load workflows
* No undo/redo
* No multi-condition branching
* Simulation is linear (no concurrency)

---

##  Future Improvements

*  Cycle detection + highlighting
*  Save/load workflows (JSON)
*  Conditional expressions
*  UI polish (Tailwind / UI library)
*  Path animation during execution

---

##  Summary

This project demonstrates:

* React Flow expertise
* Graph-based thinking
* Dynamic UI forms
* Clean state architecture
* Scalable frontend design

---

**Author:** Hemanth
<br>
**Type:** Frontend Prototype
