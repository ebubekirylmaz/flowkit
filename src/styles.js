export const toPxNumber = (v, fallback = 1) => {
  if (v == null) return fallback;
  if (typeof v === "number") return v;
  const n = parseFloat(String(v));
  return Number.isFinite(n) ? n : fallback;
};

export const getBaseStyleForVariant = (v) => {
  switch (v) {
    case "card":
      return {
        lineColor: "#b1b1b7",
        lineWidth: "2px",
        lineStyle: "solid",
        gap: 56,
        shape: 10,
        bg: "background.paper",
        hoverBg: "grey.50",
        borderColor: "#e2e8f0",
        selectionColor: "#64748b",
        showDots: false,
        showArrow: true,
        arrowSize: 6,
        animated: false,
        animationSpeed: 1,
        gradient: null,
        curvature: 0.5,
        connectorType: "curved",
      };
    case "pill":
      return {
        lineColor: "#8b5cf6",
        lineWidth: "2px",
        lineStyle: "solid",
        gap: 48,
        shape: 9999,
        bg: "rgba(139, 92, 246, 0.08)",
        hoverBg: "rgba(139, 92, 246, 0.16)",
        borderColor: "#8b5cf6",
        selectionColor: "#8b5cf6",
        showDots: false,
        showArrow: true,
        arrowSize: 6,
        animated: false,
        animationSpeed: 1,
        gradient: null,
        curvature: 0.4,
        connectorType: "curved",
      };
    case "n8n":
      return {
        lineColor: "#b1b1b7",
        lineWidth: "2px",
        lineStyle: "solid",
        gap: 60,
        shape: 8,
        bg: "#ffffff",
        hoverBg: "#f8fafc",
        borderColor: "#e2e8f0",
        selectionColor: "#ff6d5a",
        showDots: false,
        showArrow: true,
        arrowSize: 6,
        animated: false,
        animationSpeed: 1,
        gradient: null,
        curvature: 0.5,
        connectorType: "curved",
      };
    case "simple":
    default:
      return {
        lineColor: "#b1b1b7",
        lineWidth: "2px",
        lineStyle: "solid",
        gap: 50,
        shape: 8,
        bg: "background.paper",
        hoverBg: "grey.50",
        borderColor: "#e2e8f0",
        selectionColor: "#64748b",
        showDots: false,
        showArrow: true,
        arrowSize: 6,
        animated: false,
        animationSpeed: 1,
        gradient: null,
        curvature: 0.5,
        connectorType: "curved",
      };
  }
};

export const getDecisionNodeStyle = (nodeType) => {
  const styles = {
    start: { bg: "#E8F5E9", borderColor: "#4CAF50", shape: 8 },
    decision: { bg: "#FFF3E0", borderColor: "#FF9800", shape: 24 },
    process: { bg: "#E3F2FD", borderColor: "#2196F3", shape: 8 },
    end: { bg: "#FFEBEE", borderColor: "#F44336", shape: 8 },
  };
  return styles[nodeType] || styles.process;
};

export const applySemanticTokens = (styleObj, base) => {
  const s = { ...styleObj };

  const borderWeightMap = { light: 1, normal: 3, bold: 5 };
  if (
    typeof s.border === "string" &&
    ["light", "normal", "bold"].includes(s.border)
  ) {
    const w = borderWeightMap[s.border];
    if (s.borderWidth == null) s.borderWidth = w;
    if (s.lineWidth == null) s.lineWidth = `${w}px`;
    if (!s.borderColor)
      s.borderColor = base.borderColor || base.lineColor || "#E0E0E0";
  } else if (
    typeof s.border === "string" &&
    (s.border.startsWith("#") || s.border.startsWith("rgb"))
  ) {
    s.borderColor = s.border;
  }

  const sizeMap = {
    small: { cardWidth: 140, gap: 20 },
    medium: { cardWidth: 180, gap: 30 },
    large: { cardWidth: 220, gap: 40 },
  };
  if (s.size && sizeMap[s.size]) {
    const { cardWidth, gap } = sizeMap[s.size];
    if (s.cardWidth == null) s.cardWidth = cardWidth;
    if (s.gap == null) s.gap = gap;
  }

  if (s.shape === "square") {
    const defaultSize = 140;
    if (s.cardWidth != null && s.minHeight == null) s.minHeight = s.cardWidth;
    else if (s.minHeight != null && s.cardWidth == null)
      s.cardWidth = s.minHeight;
    else if (s.cardWidth == null && s.minHeight == null) {
      s.cardWidth = defaultSize;
      s.minHeight = defaultSize;
    }
  }

  if (s.shape === "vertical") {
    const defaultWidth = 160;
    if (s.cardWidth == null) s.cardWidth = defaultWidth;
    if (s.minHeight == null) s.minHeight = Math.max(s.cardWidth * 1.3, 110);
  }

  const shadowVariantMap = { none: 0, soft: 2, heavy: 6 };
  if (s.shadow && shadowVariantMap[s.shadow] != null && s.shadowLevel == null) {
    s.shadowLevel = shadowVariantMap[s.shadow];
  }

  return s;
};
