"use client";

import type React from "react";

import useDraggable from "@/components/reusable/use-draggable/useDraggable";

interface DraggableWrapperProps {
  children: React.ReactNode;
  initialPosition?: { top: number; left: number };
  storageKey: string;
  className?: string;
  ariaLabel?: string;
  /** Pixels from the top of the viewport that the element must stay below (e.g. a fixed header). */
  headerHeight?: number;
}

/**
 * A `position: fixed` wrapper that makes its children freely draggable.
 * Viewport clamping and resize re-clamping are handled by `useDraggable`.
 *
 * Child elements that must receive their own pointer events (buttons, inputs)
 * should call e.stopPropagation() on their onPointerDown handlers.
 */
const DraggableWrapper: React.FC<DraggableWrapperProps> = ({
  children,
  initialPosition = { top: 0, left: 0 },
  storageKey,
  className = "",
  ariaLabel = "Draggable panel — use arrow keys to reposition",
  headerHeight = 0,
}) => {
  const { position, ready, dragRef, handlePointerDown, handleKeyDown } =
    useDraggable(initialPosition, storageKey, headerHeight);

  return (
    <div
      ref={dragRef}
      data-floating-panel
      className={className}
      style={{
        position: "fixed",
        top: `${position.top}px`,
        left: `${position.left}px`,
        cursor: "grab",
        userSelect: "none",
        visibility: ready ? "visible" : "hidden",
      }}
      onPointerDown={handlePointerDown}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      aria-label={ariaLabel}
    >
      {children}
    </div>
  );
};

export default DraggableWrapper;
