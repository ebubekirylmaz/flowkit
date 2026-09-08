import React, { useCallback, useEffect, useRef, useState } from "react";

import { Box } from "@mui/material";
import { useSelection } from "../selection/SelectionContext";

const DraggableNode = ({
  children,
  registerRef,
  onDrag,
  nodeId,
  selectionColor = "#373739",
  initialPosition,
  onConnect,
}) => {
  const [offset, setOffset] = useState(() =>
    initialPosition ? { ...initialPosition } : { x: 0, y: 0 },
  );

  useEffect(() => {
    if (initialPosition) {
      setOffset({ ...initialPosition });
    } else {
      setOffset({ x: 0, y: 0 });
    }
  }, [initialPosition]);

  const localRef = useRef(null);
  const lastDeltaRef = useRef({ x: 0, y: 0 });
  const onDragRef = useRef(onDrag);
  const didDragRef = useRef(false);

  const {
    isSelected,
    selectNode,
    toggleSelection,
    clearSelection,
    registerNodeHandlers,
    moveSelectedNodes,
    selectedIds,
  } = useSelection();

  const selected = isSelected(nodeId);

  useEffect(() => {
    onDragRef.current = onDrag;
  }, [onDrag]);

  useEffect(() => {
    if (!nodeId) return;

    return registerNodeHandlers(nodeId, {
      setOffset,
      onDrag: () => onDragRef.current?.(),
    });
  }, [nodeId, registerNodeHandlers]);

  const setRef = useCallback(
    (el) => {
      localRef.current = el;
      registerRef?.(el);
    },
    [registerRef],
  );

  useEffect(() => {
    const el = localRef.current;
    if (!el) return;

    const onClickCapture = (e) => {
      if (didDragRef.current) {
        e.stopPropagation();
        e.preventDefault();
        didDragRef.current = false;
      }
    };

    el.addEventListener("click", onClickCapture, true);
    return () => el.removeEventListener("click", onClickCapture, true);
  }, []);

  const handleMouseDown = useCallback(
    (e) => {
      if (e.button !== 0) return;
      e.stopPropagation();

      didDragRef.current = false;

      if (onConnect && e.altKey) {
        e.preventDefault();
        onConnect(nodeId, [...selectedIds]);
        return;
      }

      if (e.shiftKey || e.ctrlKey || e.metaKey) {
        toggleSelection(nodeId);
        return;
      }

      if (!selected) {
        clearSelection();
        selectNode(nodeId);
      }

      const startX = e.clientX;
      const startY = e.clientY;
      const startOffset = { ...offset };
      lastDeltaRef.current = { x: 0, y: 0 };

      const handleMove = (ev) => {
        const dx = ev.clientX - startX;
        const dy = ev.clientY - startY;

        if (!didDragRef.current && (Math.abs(dx) > 3 || Math.abs(dy) > 3)) {
          didDragRef.current = true;
        }

        const deltaDx = dx - lastDeltaRef.current.x;
        const deltaDy = dy - lastDeltaRef.current.y;
        lastDeltaRef.current = { x: dx, y: dy };

        setOffset({
          x: startOffset.x + dx,
          y: startOffset.y + dy,
        });

        if (selectedIds.size > 1) {
          moveSelectedNodes(deltaDx, deltaDy, nodeId);
        }

        onDragRef.current?.();
      };

      const handleUp = () => {
        window.removeEventListener("mousemove", handleMove);
        window.removeEventListener("mouseup", handleUp);
      };

      window.addEventListener("mousemove", handleMove);
      window.addEventListener("mouseup", handleUp);
    },
    [
      nodeId,
      offset,
      selected,
      selectedIds,
      selectNode,
      toggleSelection,
      clearSelection,
      moveSelectedNodes,
      onConnect,
    ],
  );

  return (
    <Box
      ref={setRef}
      data-node-id={nodeId}
      onMouseDown={handleMouseDown}
      sx={{
        display: "inline-flex",
        flexDirection: "column",
        alignItems: "center",
        position: "relative",
        transform: `translate(${offset.x}px, ${offset.y}px)`,
        cursor: "grab",
        "&:active": { cursor: "grabbing" },
      }}
    >
      {children}
      {selected &&
        selectedIds.size > 1 &&
        [
          {
            top: -10,
            left: -6,
            borderTop: 2,
            borderLeft: 2,
            color: selectionColor,
          },
          {
            top: -8,
            right: -12,
            borderTop: 2,
            borderRight: 2,
            color: selectionColor,
          },
          {
            bottom: -14,
            left: -6,
            borderBottom: 2,
            borderLeft: 2,
            color: selectionColor,
          },
          {
            bottom: -16,
            right: -12,
            borderBottom: 2,
            borderRight: 2,
            color: selectionColor,
          },
        ].map((pos, i) => (
          <Box
            key={i}
            sx={{
              position: "absolute",
              width: 10,
              height: 10,
              borderStyle: "solid",
              borderColor: selectionColor,
              borderWidth: 0,
              pointerEvents: "none",
              ...pos,
            }}
          />
        ))}
    </Box>
  );
};

export default DraggableNode;
