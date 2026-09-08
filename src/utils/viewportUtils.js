export const DEFAULT_MIN_ZOOM = 0.25;
export const DEFAULT_MAX_ZOOM = 2.5;
export const DEFAULT_FIT_VIEW_PADDING = 40;

export const clampZoomValue = (zoom, minZoom, maxZoom) =>
  Math.min(maxZoom, Math.max(minZoom, zoom));

export const computeFitTransform = ({
  bounds,
  containerWidth,
  containerHeight,
  padding = DEFAULT_FIT_VIEW_PADDING,
  minZoom = DEFAULT_MIN_ZOOM,
  maxZoom = DEFAULT_MAX_ZOOM,
}) => {
  const availableWidth = Math.max(0, containerWidth - 2 * padding);
  const availableHeight = Math.max(0, containerHeight - 2 * padding);

  const scaleX = bounds.width > 0 ? availableWidth / bounds.width : Infinity;
  const scaleY = bounds.height > 0 ? availableHeight / bounds.height : Infinity;
  const rawZoom = Math.min(scaleX, scaleY);

  const zoom = clampZoomValue(rawZoom, minZoom, maxZoom);

  const centerX = bounds.x + bounds.width / 2;
  const centerY = bounds.y + bounds.height / 2;

  return {
    zoom,
    offset: {
      x: -zoom * centerX,
      y: -zoom * centerY,
    },
  };
};

export const computeContentBounds = (containerEl, { zoom, offset }) => {
  if (!containerEl) return null;

  const nodeEls = containerEl.querySelectorAll("[data-node-id]");
  if (nodeEls.length === 0) return null;

  const containerRect = containerEl.getBoundingClientRect();
  const originX = containerRect.left + containerRect.width / 2;
  const originY = containerRect.top + containerRect.height / 2;

  const toContentX = (screenX) => (screenX - originX - offset.x) / zoom;
  const toContentY = (screenY) => (screenY - originY - offset.y) / zoom;

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  nodeEls.forEach((el) => {
    const rect = el.getBoundingClientRect();
    minX = Math.min(minX, toContentX(rect.left));
    maxX = Math.max(maxX, toContentX(rect.right));
    minY = Math.min(minY, toContentY(rect.top));
    maxY = Math.max(maxY, toContentY(rect.bottom));
  });

  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
};

export const computeFitViewState = (
  containerEl,
  { zoom, offset, padding, minZoom, maxZoom },
) => {
  const bounds = computeContentBounds(containerEl, { zoom, offset });
  if (!bounds) return null;

  return computeFitTransform({
    bounds,
    containerWidth: containerEl.clientWidth,
    containerHeight: containerEl.clientHeight,
    padding,
    minZoom,
    maxZoom,
  });
};
