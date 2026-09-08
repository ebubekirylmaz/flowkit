import { Box } from "@mui/material";
import FlowNodeView from "../nodes/FlowNodeView";
import { buildDetachedTree } from "../utils/flowUtils";

import React, { useMemo } from "react";

const FloatingGraph = ({ structure, variant, style, plugin, onConnect }) => {
  const position = structure?._pastePosition || { x: 0, y: 0 };

  const treesData = useMemo(() => {
    if (!structure?.roots?.length || !structure?.nodes) return [];
    return structure.roots
      .map((rootId) => buildDetachedTree(rootId, structure.nodes))
      .filter(Boolean);
  }, [structure]);

  if (!treesData.length) return null;

  return (
    <Box
      sx={{
        position: "absolute",
        left: "50%",
        top: "50%",
        transform: `translate(${position.x}px, ${position.y}px)`,
        display: "flex",
        gap: 2,
      }}
    >
      {treesData.map((tree, idx) => (
        <FlowNodeView
          key={tree.id || `floating-${idx}`}
          node={tree}
          variant={variant}
          style={style}
          plugin={plugin}
          onConnect={onConnect}
        />
      ))}
    </Box>
  );
};

export default FloatingGraph;
