import { useMemo } from "react";

import {
  applySemanticTokens,
  getBaseStyleForVariant,
  getDecisionNodeStyle,
} from "../styles";

export const useNodeStyle = ({ node, type, variant, style, plugin }) => {
  return useMemo(() => {
    const baseStyle = getBaseStyleForVariant(variant);

    const variantTokens =
      variant === "decision" ? getDecisionNodeStyle(node?.type) : {};

    let styleTokens = {};
    if (typeof style === "function") {
      styleTokens = style(node) || {};
    } else if (style && typeof style === "object") {
      styleTokens = style;
    }

    let resolvedPlugin = null;
    if (plugin) {
      if (typeof plugin === "function") {
        resolvedPlugin = plugin(type, node) || null;
      } else if (typeof plugin === "object") {
        resolvedPlugin = plugin;
      }
    }

    let pluginTokens = {};
    if (resolvedPlugin && typeof resolvedPlugin.style === "function") {
      pluginTokens =
        resolvedPlugin.style({
          node,
          style: styleTokens,
        }) || {};
    }

    let pluginEdgeTokens = {};
    if (resolvedPlugin && typeof resolvedPlugin.edge === "function") {
      pluginEdgeTokens =
        resolvedPlugin.edge({
          node,
          style: styleTokens,
        }) || {};
    }

    const rawNodeStyle = {
      ...baseStyle,
      ...variantTokens,
      ...styleTokens,
      ...pluginTokens,
    };

    const nodeStyle = applySemanticTokens(rawNodeStyle, baseStyle);

    const edgeStyle = {
      ...pluginEdgeTokens,
    };

    return {
      baseStyle,
      nodeStyle,
      edgeStyle,
      plugin: resolvedPlugin,
    };
  }, [node, type, variant, style, plugin]);
};
