import Iconify from "../Iconify";

import React, { useEffect, useState } from "react";
import { alpha, styled } from "@mui/material/styles";

const ANIMATION_DELAY_MS = 200;

const MainContainer = styled("div", {
  shouldForwardProp: (prop) => prop !== "$style",
})(({ theme, $style = {} }) => {
  const {
    minWidth = 280,
    minHeight = 220,
    maxWidth = 320,
    maxHeight = "auto",
    borderRadius = 20,
    borderColor = "rgba(255, 255, 255, 0.08)",
    bgFrom,
    bgTo,
  } = $style;

  const defaultFrom = alpha(theme.palette.secondary.light, 0.2);
  const defaultTo = alpha(theme.palette.primary.main, 0.3);

  return {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    justifyContent: "flex-start",
    color: "#ffffff",
    borderRadius,
    padding: "24px",
    border: `1px solid ${borderColor}`,
    backdropFilter: "blur(10px)",
    transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
    cursor: "pointer",
    position: "relative",
    overflow: "hidden",
    minWidth,
    minHeight,
    maxWidth,
    maxHeight,
    background: `linear-gradient(135deg, ${bgFrom || defaultFrom}, ${
      bgTo || defaultTo
    })`,
    boxShadow: "0 2px 10px rgba(0, 0, 0, 0.2)",
  };
});

const HeaderRow = styled("div")({
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  width: "100%",
  gap: "16px",
  marginBottom: "16px",
  minHeight: "44px",
});

const IconContainer = styled("div", {
  shouldForwardProp: (prop) => prop !== "$style",
})(({ $style = {} }) => {
  const {
    bg = "rgba(255, 255, 255, 0.1)",
    hoverBg = "rgba(255, 255, 255, 0.2)",
    borderRadius = 14,
    padding = 10,
    borderColor = "rgba(255, 255, 255, 0.1)",
  } = $style;

  return {
    backgroundColor: bg,
    borderRadius,
    padding,
    transition: "all 0.4s ease",
    backdropFilter: "blur(5px)",
    border: `1px solid ${borderColor}`,
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",

    '[data-hovered="true"] &': {
      backgroundColor: hoverBg,
    },
  };
});

const LabelText = styled("div", {
  shouldForwardProp: (prop) => prop !== "$style",
})(({ $style = {} }) => {
  const {
    color = "#ffffff",
    fontWeight = 700,
    fontSize = 15,
    letterSpacing = 0.3,
  } = $style;

  return {
    fontWeight,
    fontSize,
    letterSpacing: `${letterSpacing}px`,
    textAlign: "left",
    transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
    lineHeight: "1.2",
    opacity: 0,
    transform: "translateX(10px)",
    color,
    flex: 1,

    '&[data-animated="true"]': {
      opacity: 1,
      transform: "translateX(0)",
    },
  };
});

const DescriptionText = styled("div")(({ theme }) => ({
  fontSize: "12px",
  fontWeight: 400,
  color: alpha("#fff", 0.6),
  textAlign: "left",
  lineHeight: "1.5",
  width: "100%",
  flex: 1,
  opacity: 0,
  transform: "translateY(10px)",
  transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1) 0.1s",
  marginBottom: "16px",
  display: "-webkit-box",
  WebkitLineClamp: 4,
  WebkitBoxOrient: "vertical",
  overflow: "hidden",

  '&[data-animated="true"]': {
    opacity: 1,
    transform: "translateY(0)",
  },
}));

const ActionText = styled("div")(({ theme }) => ({
  fontSize: "10px",
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "1px",
  color: alpha("#fff", 0.4),
  marginTop: "auto",
  textAlign: "left",
  width: "100%",
  fontFamily: "monospace",
  opacity: 0,
  transform: "translateY(5px)",
  transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1) 0.2s",

  '&[data-animated="true"]': {
    opacity: 1,
    transform: "translateY(0)",
  },
}));

const getIcon = (node) => {
  if (node.icon) return node.icon;
  if (node.type === "CONDITION" || node.type === "decision")
    return "mdi:help-circle-outline";
  if (node.type === "NORMAL") return "mdi:checkbox-blank-circle-outline";
  return "mdi:map-marker";
};

const InfoNode = ({ node, nodeStyle = {}, children }) => {
  const [animated, setAnimated] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const label = node.label || node.title || node.name || node.id || "Get Data";

  const action = node.action || "SYSTEM:DEFAULT_ACTION";
  const description =
    node.description || "Description of the operation goes here.";

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), ANIMATION_DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  const layoutStyle = {
    ...nodeStyle,
    minWidth: nodeStyle.cardWidth || nodeStyle.minWidth || 280,
    minHeight: nodeStyle.minHeight || 220,
  };

  const iconContainerStyle = {
    iconBg: nodeStyle.iconBg,
    iconHoverBg: nodeStyle.iconHoverBg,
    iconBorderRadius: nodeStyle.iconRadius,
    iconPadding: nodeStyle.iconPadding,
    iconBorderColor: nodeStyle.iconBorderColor,
  };

  const labelStyle = {
    labelColor: nodeStyle.labelColor,
    labelFontSize: nodeStyle.labelFontSize,
    labelFontWeight: nodeStyle.labelFontWeight,
    labelLetterSpacing: nodeStyle.labelLetterSpacing,
  };

  const icon = getIcon(node);

  return (
    <MainContainer
      $style={layoutStyle}
      data-hovered={isHovered}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <HeaderRow>
        <IconContainer $style={iconContainerStyle}>
          <Iconify
            icon={icon}
            width={24}
            height={24}
            sx={{
              filter: "none",
              color: nodeStyle.iconColor || "#ffffff",
            }}
          />
        </IconContainer>

        <LabelText data-animated={animated} $style={labelStyle}>
          {label}
        </LabelText>
      </HeaderRow>

      {description && (
        <DescriptionText data-animated={animated}>
          {description}
        </DescriptionText>
      )}

      {action && <ActionText data-animated={animated}>{action}</ActionText>}

      {children}
    </MainContainer>
  );
};

export default InfoNode;
