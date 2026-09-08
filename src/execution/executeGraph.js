import { toNextArray } from "../utils/flowUtils.js";

export async function executeGraph(graph, handlers = {}, options = {}) {
  const { onStatusChange, signal } = options;
  const nodesById = graph?.nodes || {};
  const roots = graph?.roots || [];
  const results = {};

  const isCancelled = () => !!signal?.aborted;
  const setStatus = (nodeId, status) => onStatusChange?.(nodeId, status);

  const skipSubtree = (nodeId) => {
    const node = nodesById[nodeId];
    if (!node) return;
    toNextArray(node.next).forEach((childId) => {
      if (!nodesById[childId]) return;
      setStatus(childId, "skipped");
      skipSubtree(childId);
    });
  };

  const runNode = async (nodeId) => {
    if (isCancelled()) return;
    const node = nodesById[nodeId];
    if (!node) return;

    setStatus(nodeId, "running");
    const handler = handlers[node.id] || handlers[node.type] || handlers.default;

    try {
      results[nodeId] = handler
        ? await handler(node, { isCancelled, results })
        : undefined;
    } catch (error) {
      setStatus(nodeId, "error");
      skipSubtree(nodeId);
      return;
    }

    if (isCancelled()) {
      setStatus(nodeId, "idle");
      return;
    }

    setStatus(nodeId, "success");

    const allChildren = toNextArray(node.next);
    const routedNext = results[nodeId]?.next;
    const chosen = Array.isArray(routedNext)
      ? allChildren.filter((id) => routedNext.includes(id))
      : allChildren;

    allChildren
      .filter((id) => !chosen.includes(id))
      .forEach((skippedId) => {
        if (!nodesById[skippedId]) return;
        setStatus(skippedId, "skipped");
        skipSubtree(skippedId);
      });

    await Promise.all(chosen.map(runNode));
  };

  await Promise.all(roots.map(runNode));

  return results;
}

export function resetExecution(graph, onStatusChange) {
  Object.keys(graph?.nodes || {}).forEach((id) => onStatusChange(id, "idle"));
}
