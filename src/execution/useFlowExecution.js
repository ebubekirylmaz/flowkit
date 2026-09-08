import { useCallback, useRef, useState } from "react";

import { executeGraph, resetExecution } from "./executeGraph.js";

export function useFlowExecution(graph, handlers) {
  const [statusByNodeId, setStatusByNodeId] = useState({});
  const [isRunning, setIsRunning] = useState(false);
  const abortRef = useRef(null);

  const setStatus = useCallback(
    (nodeId, status) =>
      setStatusByNodeId((prev) =>
        prev[nodeId] === status ? prev : { ...prev, [nodeId]: status },
      ),
    [],
  );

  const run = useCallback(async (handlersOverride) => {
    if (abortRef.current) return;

    const controller = new AbortController();
    abortRef.current = controller;
    setIsRunning(true);
    resetExecution(graph, setStatus);

    try {
      return await executeGraph(graph, handlersOverride || handlers, {
        signal: controller.signal,
        onStatusChange: setStatus,
      });
    } finally {
      abortRef.current = null;
      setIsRunning(false);
    }
  }, [graph, handlers, setStatus]);

  const cancel = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const reset = useCallback(() => {
    if (abortRef.current) return;
    resetExecution(graph, setStatus);
  }, [graph, setStatus]);

  return { run, cancel, reset, statusByNodeId, isRunning };
}
