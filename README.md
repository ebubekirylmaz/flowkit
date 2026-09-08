# FlowKit

A node-based workflow editor library — plus a real execution engine on top of it, so the diagrams you build aren't just static boxes and arrows.

```bash
npm install @ebubekirylmaz/flowkit
```

**[Live demo →](#)** _(a PR-review-bot pipeline built on this package — coming soon)_

## The problem

Composing a multi-step automation — trigger → fetch data → transform → branch on a condition → call an AI step → notify — usually means either writing imperative glue code, or paying for a hosted tool like n8n, Zapier, or Make. Most teams that build their own visual builder just import [React Flow](https://reactflow.dev/) for the canvas and stop there: you get boxes and arrows, but no actual execution model underneath.

FlowKit is the other half of that: a canvas engine built from scratch (pan/zoom, drag, connect, multi-select, cut/paste — no canvas library involved) paired with a topological execution engine that actually runs the graph — node by node, branch by branch — and shows you exactly which step failed and which downstream steps got skipped because of it.

## Install

```bash
npm install @ebubekirylmaz/flowkit react react-dom @mui/material styled-components
```

`react`, `react-dom`, `@mui/material`, and `styled-components` are peer dependencies — bring your own versions.

## Usage

```jsx
import { Flow, useFlowExecution } from "@ebubekirylmaz/flowkit";

const graph = {
  nodes: {
    start: { id: "start", label: "Start", next: "end" },
    end: { id: "end", label: "Done", previous: "start" },
  },
  roots: ["start"],
};

function App() {
  const { run, statusByNodeId } = useFlowExecution(graph, {
    default: async (node) => `handled ${node.id}`,
  });

  return <Flow data={graph} variant="n8n" fitViewOnMount height="100vh" />;
}
```

See the [live demo](#) for a fuller example — custom node rendering via the plugin pattern, branching, and failure isolation.

## Editor features

- Hand-rolled pan/zoom viewport (wheel-zoom, drag-to-pan, `fitView`/`zoomIn`/`zoomOut` via an imperative ref API)
- Drag-to-move nodes, rubber-band and shift-click multi-select, group dragging
- Cut / paste (`⌘X` / `⌘V`) with automatic reparenting of orphaned children
- Hand-built SVG connectors — bezier or right-angle paths, labels, arrowheads, animated dash-offset
- A plugin-object pattern (`plugin.node`, `plugin.edge`) for fully custom node/edge rendering, instead of a fixed `nodeTypes` registry
- Theming presets (`simple`, `card`, `pill`, `n8n`) plus semantic style tokens (`border: "bold"`, `size: "large"`, …)

## Execution engine

- `executeGraph(graph, handlers, options)` walks the same linked-list graph the editor already uses — no separate data model
- Branches (`next: [a, b]`) run in parallel by default; a handler can instead return `{ next: ["a"] }` to route to just one of them — that's how a condition node picks a single path instead of fanning out into both
- Handlers are looked up by node id first (for one-off overrides), then by node type, then a default fallback
- A handler that throws marks its node `"error"` and its entire subtree `"skipped"` — sibling branches elsewhere in the graph are untouched and keep running; a branch a condition didn't pick is marked `"skipped"` the same way
- `useFlowExecution(graph, handlers)` wraps it in a hook: `{ run, cancel, reset, statusByNodeId, isRunning }`
- Handlers are just `async (node, ctx) => result` — nothing about the engine is mock-specific; wire up real `fetch`/LLM calls and it behaves the same way

## Why this architecture

- **Linked-list graph, not an edges array.** Each node stores `previous`/`next` pointers rather than a separate edges list. It's a deliberate constraint (adding real DAG convergence — a node with multiple parents — isn't supported yet, see Future Work) but it kept both the editor's tree-surgery logic (cut/paste/reparenting) and the execution traversal simple to reason about.
- **Plugin objects over a type registry.** `plugin.node(...)`/`plugin.edge(...)` are render-prop-style functions a consumer passes in, rather than a fixed `{ trigger: TriggerNode, ... }` map. It's less conventional than React Flow's `nodeTypes`, but it means style resolution, per-edge labels, and per-node custom rendering all flow through one mechanism.
- **No canvas library.** The viewport is a single CSS `transform: translate() scale()` on a wrapper div, with absolute-positioned node divs and an SVG overlay for edges. It's the same core technique React Flow itself uses — just without the abstraction layer on top.

## Stack

React 18, MUI v7, styled-components, Vite, Vitest.

## Getting started (this repo)

```bash
npm install
npm run build
npm test
```

## Future work

- **TypeScript** — the codebase is untyped JS/JSX today; a migration is a deliberate future step, not an oversight (see the JSDoc on the execution engine's public functions for what that would look like).
- **Minimap** — not implemented yet; a synced, click-to-jump overview of the canvas.
- **DAG convergence** — a node with more than one parent isn't representable in the current linked-list model; the execution engine would need a real dependency-count join instead of a single-parent assumption.

## Origin

The editor half of this library — viewport, drag/connect/selection, the SVG connector renderer — started as a component inside a production component library and was iterated on there for 8+ months across 22 pull requests before being extracted into this standalone package. The execution engine is new: built specifically to turn that editor into something that actually runs, not just draws.

## License

MIT
