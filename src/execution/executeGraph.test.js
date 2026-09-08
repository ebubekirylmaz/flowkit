import { describe, expect, it } from "vitest";

import { executeGraph, resetExecution } from "./executeGraph.js";

function makeGraph() {
  return {
    nodes: {
      trigger: { id: "trigger", type: "trigger", next: "condition" },
      condition: {
        id: "condition",
        type: "condition",
        next: ["branchA", "branchB"],
      },
      branchA: { id: "branchA", type: "fail", next: "afterA" },
      afterA: { id: "afterA", type: "log" },
      branchB: { id: "branchB", type: "log", next: "afterB" },
      afterB: { id: "afterB", type: "log" },
    },
    roots: ["trigger"],
  };
}

const handlers = {
  trigger: async () => "triggered",
  condition: async () => "checked",
  fail: async () => {
    throw new Error("boom");
  },
  log: async (node) => `logged:${node.id}`,
};

describe("executeGraph", () => {
  it("runs nodes in topological order", async () => {
    const order = [];
    await executeGraph(makeGraph(), handlers, {
      onStatusChange: (id, status) => {
        if (status === "running") order.push(id);
      },
    });

    expect(order.slice(0, 2)).toEqual(["trigger", "condition"]);
    expect(order).toContain("branchA");
    expect(order).toContain("branchB");
  });

  it("halts only the failed subtree, leaving sibling branches unaffected", async () => {
    const statusByNode = {};
    await executeGraph(makeGraph(), handlers, {
      onStatusChange: (id, status) => {
        statusByNode[id] = status;
      },
    });

    expect(statusByNode.branchA).toBe("error");
    expect(statusByNode.afterA).toBe("skipped");
    expect(statusByNode.branchB).toBe("success");
    expect(statusByNode.afterB).toBe("success");
  });

  it("collects results only for successful nodes", async () => {
    const results = await executeGraph(makeGraph(), handlers, {});

    expect(results.afterB).toBe("logged:afterB");
    expect(results.branchA).toBeUndefined();
  });

  it("supports a per-node id handler override, taking priority over type", async () => {
    const graph = makeGraph();
    const statusByNode = {};

    await executeGraph(
      graph,
      {
        ...handlers,
        branchB: async () => {
          throw new Error("overridden to fail");
        },
      },
      { onStatusChange: (id, status) => (statusByNode[id] = status) },
    );

    expect(statusByNode.branchB).toBe("error");
    expect(statusByNode.afterB).toBe("skipped");
  });

  it("routes to only the branch a handler picks via { next }, skipping the rest", async () => {
    const graph = makeGraph();
    const statusByNode = {};

    await executeGraph(
      graph,
      {
        ...handlers,
        condition: async () => ({ next: ["branchB"] }),
      },
      { onStatusChange: (id, status) => (statusByNode[id] = status) },
    );

    expect(statusByNode.branchA).toBe("skipped");
    expect(statusByNode.afterA).toBe("skipped");
    expect(statusByNode.branchB).toBe("success");
    expect(statusByNode.afterB).toBe("success");
  });

  it("stops scheduling new nodes once the signal is aborted", async () => {
    const controller = new AbortController();
    const statusByNode = {};

    await executeGraph(makeGraph(), handlers, {
      signal: controller.signal,
      onStatusChange: (id, status) => {
        statusByNode[id] = status;
        if (id === "trigger" && status === "success") controller.abort();
      },
    });

    expect(statusByNode.trigger).toBe("success");
    expect(statusByNode.condition).not.toBe("success");
  });
});

describe("resetExecution", () => {
  it("sets every node back to idle", () => {
    const graph = makeGraph();
    const seen = [];
    resetExecution(graph, (id, status) => seen.push([id, status]));

    expect(seen).toHaveLength(Object.keys(graph.nodes).length);
    expect(seen.every(([, status]) => status === "idle")).toBe(true);
  });
});
