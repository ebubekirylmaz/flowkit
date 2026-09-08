import AnimatedNode from "./AnimatedNode";
import Iconify from "../Iconify";
import LoadingNode from "./LoadingNode";
import React from "react";

import { Card, Chip, Tooltip, Typography, alpha } from "@mui/material";

const ActionNode = ({
  visible,
  delay,
  isLoading,
  action,
  status,
  tooltip,
  icon,
  accentColor,
  statusColor,
}) => {
  if (isLoading) {
    return <LoadingNode visible={visible} delay={delay} accentColor={accentColor} />;
  }

  const color = accentColor || "#64748b";
  const chipColor = statusColor || color;

  const card = (
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
          borderColor: alpha(color, 0.3),
          boxShadow: `0 1px 2px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.02) inset`,
          transition: "border-color 0.2s ease, box-shadow 0.2s ease, transform 0.15s ease",
          "&:hover": {
            borderColor: color,
            boxShadow: `0 8px 20px -6px ${alpha(color, 0.35)}, 0 0 0 1px ${alpha(color, 0.4)}`,
            transform: "translateY(-2px)",
            cursor: "pointer",
          },
        }}
      >
        <Iconify
          icon={icon}
          width={20}
          height={20}
          sx={{
            width: 40,
            height: 40,
            p: "10px",
            borderRadius: "50%",
            background: `linear-gradient(155deg, ${alpha(color, 0.22)}, ${alpha(color, 0.08)})`,
            border: "1px solid",
            borderColor: alpha(color, 0.3),
            color,
          }}
        />
        <Typography
          variant="caption"
          sx={{
            textAlign: "center",
            fontSize: "0.72rem",
            fontWeight: 700,
            lineHeight: 1.25,
            letterSpacing: 0.1,
          }}
        >
          {action}
        </Typography>
        {status && (
          <Chip
            label={status}
            size="small"
            sx={{
              height: 19,
              fontSize: "0.58rem",
              fontWeight: 700,
              bgcolor: alpha(chipColor, 0.14),
              color: chipColor,
              border: "1px solid",
              borderColor: alpha(chipColor, 0.3),
              "& .MuiChip-label": { px: 0.85 },
            }}
          />
        )}
      </Card>
    </AnimatedNode>
  );

  if (!tooltip) return card;

  return (
    <Tooltip title={tooltip} placement="right">
      {card}
    </Tooltip>
  );
};

export default ActionNode;
