import React, { useEffect, useMemo, useRef, useState } from "react";
import { assertLinkedGraph, buildTreeFromLinked } from "../utils/flowUtils";

import { Box } from "@mui/material";
import FlowNodeView from "../nodes/FlowNodeView";

const FlowBoardItem = ({
  flow,
  flowId,
  position: initialPosition,
  onPositionChange,
  variant,
  style,
  plugin,
  label,
  divider,
}) => {
  const [position, setPosition] = useState(
    () => initialPosition || { x: 0, y: 0 },
  );

  useEffect(() => {
    if (initialPosition) setPosition({ ...initialPosition });
  }, [initialPosition?.x, initialPosition?.y]);

  const didDragRef = useRef(false);

  const namespacedFlow = useMemo(() => {
    if (flowId == null) return flow;
    const prefix = `${flowId}::`;
    const ns = (id) =>
      typeof id === "string" && !id.startsWith(prefix) ? `${prefix}${id}` : id;

    const nodes = {};
    for (const [id, node] of Object.entries(flow?.nodes || {})) {
      const nextArr = Array.isArray(node.next)
        ? node.next.map((n) => (typeof n === "string" ? ns(n) : n))
        : node.next != null
          ? ns(node.next)
          : undefined;
      nodes[ns(id)] = {
        ...node,
        id: ns(id),
        next: nextArr,
        previous: node.previous != null ? ns(node.previous) : undefined,
      };
    }
    const roots = Array.isArray(flow?.roots) ? flow.roots.map(ns) : flow?.roots;
    return { ...flow, nodes, roots };
  }, [flow, flowId]);

  const { nodesById, roots } = useMemo(
    () => assertLinkedGraph(namespacedFlow),
    [namespacedFlow],
  );

  const treesData = useMemo(() => {
    if (!roots?.length) return [];
    return roots
      .map((rootId) => buildTreeFromLinked(rootId, nodesById))
      .filter(Boolean);
  }, [nodesById, roots]);

  const handleMouseDown = (e) => {
    if (e.button !== 0) return;
    if (e.target?.closest?.(".MuiCard-root") || e.target?.closest?.("button"))
      return;

    e.stopPropagation();
    didDragRef.current = false;

    const startX = e.clientX;
    const startY = e.clientY;
    const startPosition = { ...position };
    let lastPosition = startPosition;

    const onMove = (ev) => {
      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;
      if (!didDragRef.current && (Math.abs(dx) > 3 || Math.abs(dy) > 3)) {
        didDragRef.current = true;
      }
      lastPosition = { x: startPosition.x + dx, y: startPosition.y + dy };
      setPosition(lastPosition);
    };

    const onUp = () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      if (didDragRef.current) onPositionChange?.(lastPosition);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  if (!treesData.length) return null;

  return (
    <Box
      data-flow-id={label}
      onMouseDown={handleMouseDown}
      sx={{
        position: "absolute",
        left: "50%",
        top: "50%",
        transform: `translate(${position.x}px, ${position.y}px)`,
        cursor: "grab",
        "&:active": { cursor: "grabbing" },
      }}
    >
      {label != null && (
        <Box
          sx={{
            position: "absolute",
            top: -28,
            left: 0,
            fontSize: 12,
            fontWeight: 600,
            opacity: 0.6,
            pointerEvents: "none",
            whiteSpace: "nowrap",
          }}
        >
          {label}
        </Box>
      )}
      {divider != null && <Box sx={{ width: "100%", mb: 1 }}>{divider}</Box>}
      <Box sx={{ display: "flex", gap: 4, alignItems: "flex-start" }}>
        {treesData.map((tree, idx) => (
          <FlowNodeView
            key={tree.id || `tree-${idx}`}
            node={tree}
            variant={variant}
            style={style}
            plugin={plugin}
          />
        ))}
      </Box>
    </Box>
  );
};

export default FlowBoardItem;
