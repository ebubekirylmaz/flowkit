import React from "react";

import { Box, Card, Typography } from "@mui/material";

const DefaultNodeCard = ({
  title,
  subtitle,
  metaEntries,
  nodeStyle,
  baseStyle,
  variant,
  borderWidth,
  borderColor,
  cardWidth,
  shape,
  shadowLevel,
  minHeight,
  nodeSx = {},
}) => {
  const effectiveWidth = cardWidth || 220;
  const effectiveBorderWidth = borderWidth || 1;
  const effectiveRadius =
    typeof shape === "number" ? shape : baseStyle.shape || 4;

  const effectiveShadow =
    typeof shadowLevel === "number" ? shadowLevel : variant === "card" ? 2 : 1;

  const effectiveMinHeight = minHeight || 80;

  return (
    <Card
      sx={{
        p: 2,
        width: effectiveWidth,
        minHeight: effectiveMinHeight,
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 1,
        position: "relative",
        borderRadius: effectiveRadius,
        bgcolor: nodeStyle.bg || "background.paper",
        border: `${effectiveBorderWidth}px solid ${
          borderColor || "transparent"
        }`,
        boxShadow: effectiveShadow,
        transition: "background-color 0.3s ease, box-shadow 0.3s ease",
        "&:hover": {
          bgcolor: nodeStyle.hoverBg || nodeStyle.bg || "grey.100",
          boxShadow: effectiveShadow + 1,
          cursor: "pointer",
        },
        ...nodeSx,
      }}
    >
      <Box sx={{ textAlign: "left", width: "100%" }}>
        <Typography
          variant="subtitle2"
          sx={{
            textAlign: "center",
            fontWeight: 600,
            fontSize: 13,
            mb: subtitle ? 0.5 : 0,
          }}
        >
          {title}
        </Typography>

        {subtitle && (
          <Typography
            variant="body2"
            sx={{
              color: "text.secondary",
              textAlign: "center",
              fontSize: 11,
              mb: metaEntries.length ? 0.5 : 0
            }}>
            {subtitle}
          </Typography>
        )}

        {metaEntries.length > 0 && (
          <Box sx={{ mt: 0.25 }}>
            {metaEntries.map(([key, value]) => (
              <Typography
                key={key}
                variant="caption"
                sx={{
                  color: "text.secondary",
                  textAlign: "center",
                  display: "block",
                  fontSize: 10
                }}>
                {key}: {String(value)}
              </Typography>
            ))}
          </Box>
        )}
      </Box>
    </Card>
  );
};

export default DefaultNodeCard;
