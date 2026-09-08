import FlowNodeView from "../nodes/FlowNodeView";
import FlowViewport from "./FlowViewport";
import React, { forwardRef } from "react";
import { SelectionProvider } from "../selection/SelectionContext";
import { getBaseStyleForVariant } from "../styles";

const FlowNode = forwardRef(function FlowNode(
  {
    isRoot = false,
    onAddNode,
    variant,
    nodesById,
    onPaste,
    onCut,
    onConnect,
    floatingNodes,
    style,
    plugin,
    node,
    height,
    initialZoom,
    centered,
    minZoom,
    maxZoom,
    fitViewPadding,
    fitViewMaxZoom,
    fitViewOnMount,
    fitViewOnResize,
    fitViewOnNodesChange,
    onInit,
    ...props
  },
  ref,
) {
  if (!isRoot) {
    if (!node) return null;
    return (
      <FlowNodeView
        node={node}
        onAddNode={onAddNode}
        variant={variant}
        style={style}
        plugin={plugin}
        onConnect={onConnect}
        {...props}
      />
    );
  }

  const baseStyle = getBaseStyleForVariant(variant);
  const selectionColor = baseStyle.selectionColor ?? "#64748b";

  return (
    <SelectionProvider>
      <FlowViewport
        ref={ref}
        selectionColor={selectionColor}
        nodesById={nodesById}
        onPaste={onPaste}
        onCut={onCut}
        onConnect={onConnect}
        floatingNodes={floatingNodes}
        variant={variant}
        style={style}
        plugin={plugin}
        height={height}
        initialZoom={initialZoom}
        centered={centered}
        minZoom={minZoom}
        maxZoom={maxZoom}
        fitViewPadding={fitViewPadding}
        fitViewMaxZoom={fitViewMaxZoom}
        fitViewOnMount={fitViewOnMount}
        fitViewOnResize={fitViewOnResize}
        fitViewOnNodesChange={fitViewOnNodesChange}
        onInit={onInit}
      >
        {node && (
          <FlowNodeView
            node={node}
            onAddNode={onAddNode}
            variant={variant}
            style={style}
            plugin={plugin}
            onConnect={onConnect}
            {...props}
          />
        )}
      </FlowViewport>
    </SelectionProvider>
  );
});

export default FlowNode;
