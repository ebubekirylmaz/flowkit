import React, { useId, useLayoutEffect, useMemo, useState } from "react";

import { Box } from "@mui/material";

const DynamicConnector = ({
  containerEl,
  parentEl,
  childEls,
  stroke = "#b1b1b7",
  strokeWidth = 2,
  lineStyle = "solid",
  tick = 0,
  orientation = "vertical",
  showDots = false,
  dotRadius = 4,
  dotColor,
  showArrow = true,
  arrowSize = 6,
  animated = false,
  animationSpeed = 1,
  gradient = null,
  curvature = 0.5,
  connectorType = "curved",
  label = null,
  labelStyle = {},
  labelPosition = 0.5,
  labelOffsetX = 0,
  labelOffsetY = -10,
  startGap = 8,
  endGap = 10,
}) => {
  const uniqueId = useId();
  const [dims, setDims] = useState(null);
  const [points, setPoints] = useState({
    parent: null,
    children: [],
  });

  const isHorizontal = orientation === "horizontal";

  useLayoutEffect(() => {
    if (!containerEl || !parentEl || !childEls?.length) return;

    const update = () => {
      const cRect = containerEl.getBoundingClientRect();
      const pRect = parentEl.getBoundingClientRect();

      const scaleX = containerEl.offsetWidth
        ? cRect.width / containerEl.offsetWidth || 1
        : 1;
      const scaleY = containerEl.offsetHeight
        ? cRect.height / containerEl.offsetHeight || 1
        : 1;

      let parentPoint;
      let childPoints = [];

      const headRoom = showArrow ? arrowSize * strokeWidth * 0.5 : 0;
      const tailInset = startGap;
      const headInset = endGap + headRoom;

      if (isHorizontal) {
        parentPoint = {
          x: (pRect.right - cRect.left) / scaleX + tailInset,
          y: (pRect.top + pRect.height / 2 - cRect.top) / scaleY,
        };

        childPoints = childEls.map((el) => {
          if (!el) return { x: parentPoint.x + 100, y: parentPoint.y };
          const r = el.getBoundingClientRect();
          const x = (r.left - cRect.left) / scaleX - headInset;
          return {
            x: Math.max(x, parentPoint.x),
            y: (r.top + r.height / 2 - cRect.top) / scaleY,
          };
        });
      } else {
        parentPoint = {
          x: (pRect.left + pRect.width / 2 - cRect.left) / scaleX,
          y: (pRect.bottom - cRect.top) / scaleY + tailInset,
        };

        childPoints = childEls.map((el) => {
          if (!el) return { x: parentPoint.x, y: parentPoint.y + 100 };
          const r = el.getBoundingClientRect();
          const y = (r.top - cRect.top) / scaleY - headInset;
          return {
            x: (r.left + r.width / 2 - cRect.left) / scaleX,
            y: Math.max(y, parentPoint.y),
          };
        });
      }

      setPoints({ parent: parentPoint, children: childPoints });
      setDims({ w: cRect.width / scaleX, h: cRect.height / scaleY });
    };

    update();

    const ro = new ResizeObserver(update);
    ro.observe(containerEl);
    ro.observe(parentEl);
    childEls.forEach((el) => el && ro.observe(el));

    return () => ro.disconnect();
  }, [
    containerEl,
    parentEl,
    childEls,
    tick,
    isHorizontal,
    showArrow,
    arrowSize,
    strokeWidth,
    startGap,
    endGap,
  ]);

  const ids = useMemo(
    () => ({
      gradient: `gradient-${uniqueId}`,
      arrow: `arrow-${uniqueId}`,
    }),
    [uniqueId],
  );

  const getPath = (from, to) => {
    const isCornered =
      connectorType === "cornered" || connectorType === "normal";

    if (isCornered) {
      if (isHorizontal) {
        const midX = from.x + (to.x - from.x) / 2;
        return `M ${from.x} ${from.y} L ${midX} ${from.y} L ${midX} ${to.y} L ${to.x} ${to.y}`;
      }

      const midY = from.y + (to.y - from.y) / 2;
      return `M ${from.x} ${from.y} L ${from.x} ${midY} L ${to.x} ${midY} L ${to.x} ${to.y}`;
    }

    const dx = Math.abs(to.x - from.x);
    const dy = Math.abs(to.y - from.y);
    const distance = Math.sqrt(dx * dx + dy * dy);

    const baseCurvature = Math.max(40, Math.min(distance * curvature, 150));

    if (isHorizontal) {
      const cp1x = from.x + baseCurvature;
      const cp2x = to.x - baseCurvature;
      return `M ${from.x} ${from.y} C ${cp1x} ${from.y}, ${cp2x} ${to.y}, ${to.x} ${to.y}`;
    } else {
      const cp1y = from.y + baseCurvature;
      const cp2y = to.y - baseCurvature;
      return `M ${from.x} ${from.y} C ${from.x} ${cp1y}, ${to.x} ${cp2y}, ${to.x} ${to.y}`;
    }
  };

  const getDashArray = () => {
    if (lineStyle === "dashed") return `${strokeWidth * 4},${strokeWidth * 3}`;
    if (lineStyle === "dotted") return `${strokeWidth},${strokeWidth * 2}`;
    return undefined;
  };

  const animationStyle = animated
    ? `
    @keyframes flowAnimation {
      from { stroke-dashoffset: 24; }
      to { stroke-dashoffset: 0; }
    }
  `
    : "";

  if (!dims || !points.parent || !points.children.length) return null;

  const effectiveDotColor = dotColor || stroke;
  const dashArray = getDashArray();

  return (
    <>
      <svg
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          overflow: "visible",
          zIndex: 0,
        }}
        width="100%"
        height="100%"
        viewBox={`0 0 ${dims.w} ${dims.h}`}
      >
        <defs>
          {gradient && (
            <linearGradient
              id={ids.gradient}
              gradientUnits="userSpaceOnUse"
              x1={points.parent.x}
              y1={points.parent.y}
              x2={points.children[0]?.x || points.parent.x}
              y2={points.children[0]?.y || points.parent.y}
            >
              <stop offset="0%" stopColor={gradient.from} />
              <stop offset="100%" stopColor={gradient.to} />
            </linearGradient>
          )}

          {showArrow && (
            <marker
              id={ids.arrow}
              viewBox="0 0 10 10"
              refX="10"
              refY="5"
              markerWidth={arrowSize}
              markerHeight={arrowSize}
              orient="auto-start-reverse"
            >
              <path
                d="M 0.5 1 L 10 5 L 0.5 9 Z"
                fill={gradient ? `url(#${ids.gradient})` : stroke}
                stroke={gradient ? `url(#${ids.gradient})` : stroke}
                strokeWidth="1"
                strokeLinejoin="round"
              />
            </marker>
          )}

          {animated && <style>{animationStyle}</style>}
        </defs>

        {points.children.map((child, i) => {
          const pathD = getPath(points.parent, child);
          const pathStroke = gradient ? `url(#${ids.gradient})` : stroke;

          return (
            <g key={i}>
              <path
                d={pathD}
                fill="none"
                stroke={pathStroke}
                strokeWidth={strokeWidth}
                strokeDasharray={animated ? "8,4" : dashArray}
                strokeLinecap={dashArray || animated ? "round" : "butt"}
                strokeLinejoin="round"
                markerEnd={showArrow ? `url(#${ids.arrow})` : undefined}
                style={{
                  transition: "stroke 0.2s ease, stroke-width 0.2s ease",
                  ...(animated
                    ? {
                        animation: `flowAnimation ${
                          0.5 / animationSpeed
                        }s linear infinite`,
                      }
                    : {}),
                }}
              />
            </g>
          );
        })}

        {showDots && (
          <>
            <circle
              cx={points.parent.x}
              cy={points.parent.y}
              r={dotRadius}
              fill={gradient ? gradient.from : effectiveDotColor}
              stroke="#fff"
              strokeWidth={1.5}
              style={{
                filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.15))",
              }}
            />

            {!showArrow &&
              points.children.map((child, i) => {
                const dotFill = gradient ? gradient.to : effectiveDotColor;

                return (
                  <circle
                    key={i}
                    cx={child.x}
                    cy={child.y}
                    r={dotRadius}
                    fill={dotFill}
                    stroke="#fff"
                    strokeWidth={1.5}
                    style={{
                      filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.15))",
                    }}
                  />
                );
              })}
          </>
        )}
      </svg>

      {label &&
        points.children.map((child, i) => {
          const labelX =
            points.parent.x +
            (child.x - points.parent.x) * labelPosition +
            labelOffsetX;
          const labelY =
            points.parent.y +
            (child.y - points.parent.y) * labelPosition +
            labelOffsetY;

          return (
            <Box
              key={`label-${i}`}
              sx={{
                position: "absolute",
                left: labelX,
                top: labelY,
                transform: "translate(-50%, -50%)",
                px: 1,
                py: 0.5,
                borderRadius: 1,
                backgroundColor: "background.paper",
                border: 1,
                borderColor: labelStyle.color || stroke,
                fontSize: labelStyle.fontSize || "12px",
                fontWeight: labelStyle.fontWeight || 600,
                color: labelStyle.textColor || stroke,
                pointerEvents: "none",
                userSelect: "none",
                zIndex: 10,
                boxShadow: 1,
                whiteSpace: "nowrap",
              }}
            >
              {label}
            </Box>
          );
        })}
    </>
  );
};

export default DynamicConnector;
