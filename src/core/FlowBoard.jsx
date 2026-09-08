import React, { forwardRef, useMemo } from "react";

import FlowBoardItem from "./FlowBoardItem";
import FlowViewport from "./FlowViewport";
import { SelectionProvider } from "../selection/SelectionContext";
import { getBaseStyleForVariant } from "../styles";

export const FlowBoard = forwardRef(function FlowBoard(
  {
    flows = [],
    variant = "simple",
    style,
    plugin,
    initialZoom = 1,
    height = "100vh",
    gap = 480,
    onFlowPositionChange,
    minZoom,
    maxZoom,
    fitViewPadding,
    fitViewMaxZoom,
    fitViewOnMount,
    fitViewOnResize,
    fitViewOnNodesChange,
    onInit,
  },
  ref,
) {
  const baseStyle = getBaseStyleForVariant(variant);
  const selectionColor = baseStyle.selectionColor ?? "#64748b";

  const positionedFlows = useMemo(() => {
    const count = flows.length;
    return flows.map((flow, index) => {
      const fallback = {
        x: (index - (count - 1) / 2) * gap,
        y: 0,
      };
      return {
        flow,
        id: flow?.id ?? index,
        position: flow?.position ?? fallback,
      };
    });
  }, [flows, gap]);

  const mergedNodesById = useMemo(() => {
    const merged = {};
    for (const { flow } of positionedFlows) {
      if (flow?.nodes) Object.assign(merged, flow.nodes);
    }
    return merged;
  }, [positionedFlows]);

  return (
    <SelectionProvider>
      <FlowViewport
        ref={ref}
        selectionColor={selectionColor}
        nodesById={mergedNodesById}
        variant={variant}
        style={style}
        plugin={plugin}
        height={height}
        initialZoom={initialZoom}
        minZoom={minZoom}
        maxZoom={maxZoom}
        fitViewPadding={fitViewPadding}
        fitViewMaxZoom={fitViewMaxZoom}
        fitViewOnMount={fitViewOnMount}
        fitViewOnResize={fitViewOnResize}
        fitViewOnNodesChange={fitViewOnNodesChange}
        onInit={onInit}
      >
        {positionedFlows.map(({ flow, id, position }) => (
          <FlowBoardItem
            key={id}
            flow={flow}
            flowId={id}
            label={flow?.label}
            divider={flow?.divider}
            position={position}
            onPositionChange={
              onFlowPositionChange
                ? (pos) => onFlowPositionChange(id, pos)
                : undefined
            }
            variant={flow?.variant ?? variant}
            style={style}
            plugin={plugin}
          />
        ))}
      </FlowViewport>
    </SelectionProvider>
  );
});

export default FlowBoard;
