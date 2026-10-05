export type Point = { top: number; left: number };
export type Size = { width: number; height: number };
export type FloatingPanelRect = Point & Size;

export type ResizeHandle = "n" | "s" | "e" | "w" | "ne" | "nw" | "se" | "sw";

export type ViewportInsets = {
  top: number;
  bottom: number;
  gutter: number;
};

export type SizeConstraints = {
  minWidth: number;
  minHeight: number;
  maxWidth: number;
  maxHeight: number;
};

function readViewportSize() {
  return {
    width: document.documentElement.clientWidth,
    height: document.documentElement.clientHeight,
  };
}

export function sizeConstraintsForViewport(
  minSize: Size,
  insets: ViewportInsets,
  viewport = readViewportSize(),
): SizeConstraints {
  return {
    minWidth: minSize.width,
    minHeight: minSize.height,
    maxWidth: Math.max(minSize.width, viewport.width - insets.gutter * 2),
    maxHeight: Math.max(
      minSize.height,
      viewport.height - insets.top - insets.bottom,
    ),
  };
}

export function clampSize(size: Size, constraints: SizeConstraints): Size {
  return {
    width: Math.max(
      constraints.minWidth,
      Math.min(size.width, constraints.maxWidth),
    ),
    height: Math.max(
      constraints.minHeight,
      Math.min(size.height, constraints.maxHeight),
    ),
  };
}

function clampPosition(
  position: Point,
  panelSize: Size,
  insets: ViewportInsets,
  viewport = readViewportSize(),
): Point {
  return {
    top: Math.max(
      insets.top,
      Math.min(
        position.top,
        viewport.height - insets.bottom - panelSize.height,
      ),
    ),
    left: Math.max(
      insets.gutter,
      Math.min(position.left, viewport.width - insets.gutter - panelSize.width),
    ),
  };
}

export function clampPanelRect(
  rect: FloatingPanelRect,
  minSize: Size,
  insets: ViewportInsets,
  viewport = readViewportSize(),
): FloatingPanelRect {
  const constraints = sizeConstraintsForViewport(minSize, insets, viewport);
  const size = clampSize(rect, constraints);
  const position = clampPosition(
    { top: rect.top, left: rect.left },
    size,
    insets,
    viewport,
  );

  return { ...position, ...size };
}

export function resizePanelRect(
  base: FloatingPanelRect,
  delta: { dx: number; dy: number },
  handle: ResizeHandle,
  minSize: Size,
  insets: ViewportInsets,
  viewport = readViewportSize(),
): FloatingPanelRect {
  let { top, left, width, height } = base;

  if (handle.includes("e")) {
    width = base.width + delta.dx;
  }
  if (handle.includes("w")) {
    width = base.width - delta.dx;
    left = base.left + delta.dx;
  }
  if (handle.includes("s")) {
    height = base.height + delta.dy;
  }
  if (handle.includes("n")) {
    height = base.height - delta.dy;
    top = base.top + delta.dy;
  }

  const constraints = sizeConstraintsForViewport(minSize, insets, viewport);
  const clampedWidth = Math.max(
    constraints.minWidth,
    Math.min(width, constraints.maxWidth),
  );
  const clampedHeight = Math.max(
    constraints.minHeight,
    Math.min(height, constraints.maxHeight),
  );

  if (handle.includes("w")) {
    left = base.left + base.width - clampedWidth;
  }
  if (handle.includes("n")) {
    top = base.top + base.height - clampedHeight;
  }

  return clampPanelRect(
    { top, left, width: clampedWidth, height: clampedHeight },
    minSize,
    insets,
    viewport,
  );
}

export function keyboardResizeDelta(
  handle: ResizeHandle,
  key: string,
  step: number,
): { dx: number; dy: number } | null {
  const horizontal =
    key === "ArrowRight" ? step : key === "ArrowLeft" ? -step : 0;
  const vertical = key === "ArrowDown" ? step : key === "ArrowUp" ? -step : 0;

  if (horizontal === 0 && vertical === 0) {
    return null;
  }

  let dx = 0;
  let dy = 0;

  if (handle.includes("e") && horizontal !== 0) {
    dx = horizontal;
  } else if (handle.includes("w") && horizontal !== 0) {
    dx = horizontal;
  }

  if (handle.includes("s") && vertical !== 0) {
    dy = vertical;
  } else if (handle.includes("n") && vertical !== 0) {
    dy = vertical;
  }

  if (dx === 0 && dy === 0) {
    return null;
  }

  return { dx, dy };
}

export function stackedDefaultPosition(
  stackIndex: number,
  panelSize: Size,
  insets: ViewportInsets,
  stackGap: number,
  viewport = readViewportSize(),
): Point {
  return {
    left: Math.max(
      insets.gutter,
      viewport.width - panelSize.width - insets.gutter,
    ),
    top: insets.top + stackIndex * (panelSize.height + stackGap),
  };
}

export function isValidPanelRect(value: unknown): value is FloatingPanelRect {
  if (!value || typeof value !== "object") return false;

  const rect = value as Record<string, unknown>;
  return (
    typeof rect.top === "number" &&
    typeof rect.left === "number" &&
    typeof rect.width === "number" &&
    typeof rect.height === "number" &&
    isFinite(rect.top) &&
    isFinite(rect.left) &&
    isFinite(rect.width) &&
    isFinite(rect.height)
  );
}
