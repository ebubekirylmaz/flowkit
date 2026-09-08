import AnimatedNode from "./AnimatedNode";
import React from "react";

import { Card, CircularProgress, Typography, alpha } from "@mui/material";

const LoadingNode = ({ visible, delay, accentColor }) => {
  const color = accentColor || "#6366f1";

  return (
    <AnimatedNode visible={visible} delay={delay}>
      <Card
        elevation={0}
        sx={{
          p: 1.75,
          width: 188,
          minHeight: 120,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 1,
          borderRadius: 3,
          bgcolor: "background.paper",
          border: "1px solid",
          borderColor: alpha(color, 0.4),
          boxShadow: `0 0 0 3px ${alpha(color, 0.12)}`,
        }}
      >
        <CircularProgress size={26} thickness={4} sx={{ color }} />
        <Typography
          variant="caption"
          sx={{
            textAlign: "center",
            fontSize: "0.68rem",
            fontWeight: 600,
            color: "text.secondary",
          }}
        >
          Running…
        </Typography>
      </Card>
    </AnimatedNode>
  );
};

export default LoadingNode;
