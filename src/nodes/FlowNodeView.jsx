import React, { useEffect, useLayoutEffect, useRef, useState } from "react";

import { Box } from "@mui/material";
import DefaultNodeCard from "./DefaultCard";
import DraggableNode from "./DraggableNode";
import DynamicConnector from "../connectors/DynamicConnector";
import FlowNode from "../core/FlowNode";
import { getContentParts } from "../utils/flowUtils";
import { toPxNumber } from "../styles";
import { useNodeStyle } from "../hooks/useNodeStyle";

const FlowNodeView = ({
  node,
  type,
  variant,
  style,
  plugin,
  registerRef,
  onDrag,
  onConnect,
}) => {
  const hasChildren = Array.isArray(node.children) && node.children.length > 0;
  const isVirtualRoot = !!node.virtual;

  const {
    baseStyle,
    nodeStyle,
    edgeStyle,
    plugin: _plugin,
  } = useNodeStyle({
    node,
    type,
    variant,
    style,
    plugin,
  });

  const {
    direction = "vertical",
    lineColor = baseStyle.lineColor,
    lineWidth = baseStyle.lineWidth,
    lineStyle = baseStyle.lineStyle,
    gap = baseStyle.gap,
    levelGap = baseStyle.levelGap ?? 2.5,
    nodeSx = {},
    borderWidth,
    borderColor = baseStyle.borderColor,
    cardWidth,
    shape,
    shadowLevel,
    minHeight,
    showDots = baseStyle.showDots ?? false,
    dotRadius = baseStyle.dotRadius ?? 4,
    dotColor = baseStyle.dotColor,
    showArrow = baseStyle.showArrow ?? true,
    arrowSize = baseStyle.arrowSize ?? 6,
    animated = baseStyle.animated ?? false,
    animationSpeed = baseStyle.animationSpeed ?? 1,
    gradient = baseStyle.gradient ?? null,
    curvature = baseStyle.curvature ?? 0.5,
    connectorType = baseStyle.connectorType ?? "curved",
    startGap = baseStyle.startGap ?? 8,
    endGap = baseStyle.endGap ?? 10,
    selectionColor = baseStyle.selectionColor ?? "#64748b",
  } = nodeStyle;

  const edgeProps = {
    lineColor: edgeStyle.lineColor ?? lineColor,
    lineWidth: edgeStyle.lineWidth ?? lineWidth,
    lineStyle: edgeStyle.lineStyle ?? lineStyle,
    showDots: edgeStyle.showDots ?? showDots,
    dotRadius: edgeStyle.dotRadius ?? dotRadius,
    dotColor: edgeStyle.dotColor ?? dotColor,
    showArrow: edgeStyle.showArrow ?? showArrow,
    arrowSize: edgeStyle.arrowSize ?? arrowSize,
    animated: edgeStyle.animated ?? animated,
    animationSpeed: edgeStyle.animationSpeed ?? animationSpeed,
    gradient: edgeStyle.gradient ?? gradient,
    curvature: edgeStyle.curvature ?? curvature,
    connectorType: edgeStyle.connectorType ?? connectorType,
    startGap: edgeStyle.startGap ?? startGap,
    endGap: edgeStyle.endGap ?? endGap,
  };

  const isHorizontal = direction === "horizontal";

  const strokeWidth = toPxNumber(edgeProps.lineWidth, 1.5);
  const dashStyle =
    edgeProps.lineStyle === "dashed" || edgeProps.lineStyle === "dotted"
      ? edgeProps.lineStyle
      : "solid";

  const containerRef = useRef(null);
  const parentRef = useRef(null);
  const childRefs = useRef({});
  const [childElList, setChildElList] = useState([]);

  const [connectorTick, setConnectorTick] = useState(0);

  const handleDrag = (newOffset) => {
    setConnectorTick((t) => t + 1);
    if (onDrag) onDrag(newOffset);
  };

  useLayoutEffect(() => {
    const els = (node.children || [])
      .map((c) => childRefs.current[c.id])
      .filter(Boolean);
    setChildElList(els);
  }, [node.children]);

  useEffect(() => {
    const t = setTimeout(() => {
      const els = (node.children || [])
        .map((c) => childRefs.current[c.id])
        .filter(Boolean);
      setChildElList(els);
    }, 0);
    return () => clearTimeout(t);
  }, [node.children]);

  const { title, subtitle, metaEntries } = getContentParts(node);

  const renderContent = () => {
    if (_plugin && typeof _plugin.node === "function") {
      return _plugin.node({
        node,
        title,
        subtitle,
        metaEntries,
        nodeStyle,
        baseStyle,
      });
    }
    return (
      <DefaultNodeCard
        title={title}
        subtitle={subtitle}
        metaEntries={metaEntries}
        nodeStyle={nodeStyle}
        baseStyle={baseStyle}
        variant={variant}
        borderWidth={borderWidth}
        borderColor={borderColor}
        cardWidth={cardWidth}
        shape={shape}
        shadowLevel={shadowLevel}
        minHeight={minHeight}
        nodeSx={nodeSx}
      />
    );
  };

  if (isVirtualRoot) {
    return (
      <Box
        ref={containerRef}
        sx={{
          display: "flex",
          flexDirection: isHorizontal ? "row" : "column",
          alignItems: "flex-end",
          gap,
          position: "relative",
        }}
      >
        {node.children.map((child) => (
          <FlowNode
            key={child.id}
            node={child}
            type={type}
            variant={variant}
            style={style}
            plugin={plugin}
            registerRef={(el) => (childRefs.current[child.id] = el)}
            onDrag={() => setConnectorTick((t) => t + 1)}
            isRoot={false}
            onConnect={onConnect}
          />
        ))}
      </Box>
    );
  }

  return (
    <Box
      ref={containerRef}
      sx={{
        display: "inline-flex",
        flexDirection: isHorizontal ? "row" : "column",
        alignItems: "center",
        position: "relative",
      }}
    >
      <DraggableNode
        registerRef={(el) => {
          parentRef.current = el;
          if (registerRef) registerRef(el);
        }}
        onDrag={handleDrag}
        nodeId={node.id}
        selectionColor={selectionColor}
        initialPosition={node._pastePosition}
        onConnect={onConnect}
      >
        {renderContent()}
      </DraggableNode>

      {hasChildren && (
        <>
          {node.children.map((child, index) => {
            let childEdgeProps = { ...edgeProps };
            if (_plugin && typeof _plugin.edge === "function") {
              const childSpecificStyle = _plugin.edge({
                node,
                child,
                style: nodeStyle,
              });
              if (childSpecificStyle) {
                childEdgeProps = {
                  lineColor:
                    childSpecificStyle.lineColor ?? childEdgeProps.lineColor,
                  lineWidth:
                    childSpecificStyle.lineWidth ?? childEdgeProps.lineWidth,
                  lineStyle:
                    childSpecificStyle.lineStyle ?? childEdgeProps.lineStyle,
                  showDots:
                    childSpecificStyle.showDots ?? childEdgeProps.showDots,
                  dotRadius:
                    childSpecificStyle.dotRadius ?? childEdgeProps.dotRadius,
                  dotColor:
                    childSpecificStyle.dotColor ?? childEdgeProps.dotColor,
                  showArrow:
                    childSpecificStyle.showArrow ?? childEdgeProps.showArrow,
                  arrowSize:
                    childSpecificStyle.arrowSize ?? childEdgeProps.arrowSize,
                  animated:
                    childSpecificStyle.animated ?? childEdgeProps.animated,
                  animationSpeed:
                    childSpecificStyle.animationSpeed ??
                    childEdgeProps.animationSpeed,
                  gradient:
                    childSpecificStyle.gradient ?? childEdgeProps.gradient,
                  curvature:
                    childSpecificStyle.curvature ?? childEdgeProps.curvature,
                  connectorType:
                    childSpecificStyle.connectorType ??
                    childEdgeProps.connectorType,
                  startGap:
                    childSpecificStyle.startGap ?? childEdgeProps.startGap,
                  endGap: childSpecificStyle.endGap ?? childEdgeProps.endGap,
                  label: childSpecificStyle.label,
                  labelStyle: childSpecificStyle.labelStyle,
                  labelPosition: childSpecificStyle.labelPosition,
                  labelOffsetX: childSpecificStyle.labelOffsetX,
                  labelOffsetY: childSpecificStyle.labelOffsetY,
                };
              }
            }

            const childStrokeWidth = toPxNumber(childEdgeProps.lineWidth, 1.5);
            const childDashStyle =
              childEdgeProps.lineStyle === "dashed" ||
              childEdgeProps.lineStyle === "dotted"
                ? childEdgeProps.lineStyle
                : "solid";

            return (
              <DynamicConnector
                key={child.id}
                containerEl={containerRef.current}
                parentEl={parentRef.current}
                childEls={[childElList[index]]}
                stroke={childEdgeProps.lineColor}
                strokeWidth={childStrokeWidth}
                lineStyle={childDashStyle}
                tick={connectorTick}
                orientation={direction}
                showDots={childEdgeProps.showDots}
                dotRadius={childEdgeProps.dotRadius}
                dotColor={childEdgeProps.dotColor}
                showArrow={childEdgeProps.showArrow}
                arrowSize={childEdgeProps.arrowSize}
                animated={childEdgeProps.animated}
                animationSpeed={childEdgeProps.animationSpeed}
                gradient={childEdgeProps.gradient}
                curvature={childEdgeProps.curvature}
                connectorType={childEdgeProps.connectorType}
                startGap={childEdgeProps.startGap}
                endGap={childEdgeProps.endGap}
                label={childEdgeProps.label}
                labelStyle={childEdgeProps.labelStyle}
                labelPosition={childEdgeProps.labelPosition}
                labelOffsetX={childEdgeProps.labelOffsetX}
                labelOffsetY={childEdgeProps.labelOffsetY}
              />
            );
          })}

          <Box
            sx={{
              display: "flex",
              flexDirection: isHorizontal ? "column" : "row",
              ...(isHorizontal
                ? {
                    marginLeft: levelGap,
                    rowGap: gap,
                  }
                : {
                    marginTop: levelGap,
                    columnGap: gap,
                  }),
              position: "relative",
              alignItems: "flex-start",
              justifyContent: "center",
            }}
          >
            {node.children.map((child) => (
              <FlowNode
                key={child.id}
                node={child}
                type={type}
                variant={variant}
                style={style}
                plugin={plugin}
                registerRef={(el) => (childRefs.current[child.id] = el)}
                onDrag={() => setConnectorTick((t) => t + 1)}
                isRoot={false}
                onConnect={onConnect}
              />
            ))}
          </Box>
        </>
      )}
    </Box>
  );
};

export default FlowNodeView;
