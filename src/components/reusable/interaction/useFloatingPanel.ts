"use client";

import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";

import {
  clampPanelRect,
  clampSize,
  isValidPanelRect,
  keyboardResizeDelta,
  resizePanelRect,
  sizeConstraintsForViewport,
  type FloatingPanelRect,
  type Point,
  type ResizeHandle,
  type Size,
  type ViewportInsets,
} from "@/components/reusable/interaction/floating-panel-geometry";
import { isFloatingPanelRootKeyboardTarget } from "@/components/reusable/interaction/floating-panel-keyboard";

const NUDGE = 4;
const NUDGE_SHIFT = 20;
const ARROW_KEYS = new Set(["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"]);

export type UseFloatingPanelOptions = {
  storageKey: string;
  initialRect: FloatingPanelRect;
  defaultPosition: (size: Size) => Point;
  minSize: Size;
  viewportInsets: ViewportInsets;
};

function warnStorageDev(message: string, detail?: unknown) {
  if (process.env.NODE_ENV === "development") {
    console.warn(message, detail);
  }
}

function tryPointerCapture(element: HTMLElement, pointerId: number) {
  try {
    element.setPointerCapture(pointerId);
  } catch {
    // Gracefully degrade when capture is unsupported.
  }
}

function readStoredRect(storageKey: string): FloatingPanelRect | null {
  try {
    const saved = localStorage.getItem(storageKey);
    if (!saved) return null;

    const parsed: unknown = JSON.parse(saved);
    if (!isValidPanelRect(parsed)) {
      warnStorageDev(
        `[useFloatingPanel] Ignoring invalid stored rect for ${storageKey}`,
        parsed,
      );
      return null;
    }
    return parsed;
  } catch (error) {
    warnStorageDev(
      `[useFloatingPanel] Failed to parse stored rect for ${storageKey}`,
      error,
    );
    return null;
  }
}

function writeStoredRect(storageKey: string, rect: FloatingPanelRect) {
  try {
    localStorage.setItem(storageKey, JSON.stringify(rect));
  } catch (error) {
    warnStorageDev(
      `[useFloatingPanel] Failed to persist rect for ${storageKey}`,
      error,
    );
  }
}

function resolvePanelRectFromStorage(
  storageKey: string,
  initialRect: FloatingPanelRect,
  defaultPosition: (size: Size) => Point,
  minSize: Size,
  viewportInsets: ViewportInsets,
): FloatingPanelRect {
  const stored = readStoredRect(storageKey);
  if (stored) {
    return stored;
  }

  const constraints = sizeConstraintsForViewport(minSize, viewportInsets);
  const size = clampSize(initialRect, constraints);
  const position = defaultPosition(size);
  return { ...position, ...size };
}

export function useFloatingPanel({
  storageKey,
  initialRect,
  defaultPosition,
  minSize,
  viewportInsets,
}: UseFloatingPanelOptions) {
  const [rect, setRectState] = useState<FloatingPanelRect>(initialRect);
  const [storageHydrated, setStorageHydrated] = useState(false);
  const committedRef = useRef<FloatingPanelRect>(initialRect);
  const elementRef = useRef<HTMLElement | null>(null);
  const optionsRef = useRef({
    defaultPosition,
    minSize,
    viewportInsets,
    storageKey,
  });
  const drag = useRef({
    active: false,
    startX: 0,
    startY: 0,
    finalTop: 0,
    finalLeft: 0,
  });
  const rafId = useRef(0);
  const windowResizeRafRef = useRef(0);
  const dragAbortRef = useRef<AbortController | null>(null);
  const resizeAbortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    optionsRef.current = {
      defaultPosition,
      minSize,
      viewportInsets,
      storageKey,
    };
  }, [defaultPosition, minSize, storageKey, viewportInsets]);

  const commitRect = useCallback((next: FloatingPanelRect, persist = false) => {
    const clamped = clampPanelRect(
      next,
      optionsRef.current.minSize,
      optionsRef.current.viewportInsets,
    );
    const current = committedRef.current;

    if (
      clamped.top === current.top &&
      clamped.left === current.left &&
      clamped.width === current.width &&
      clamped.height === current.height
    ) {
      return clamped;
    }

    committedRef.current = clamped;
    setRectState(clamped);

    if (persist) {
      writeStoredRect(optionsRef.current.storageKey, clamped);
    }

    return clamped;
  }, []);

  const setPanelSize = useCallback(
    (size: Size, persist = false) => {
      commitRect(
        {
          ...committedRef.current,
          width: size.width,
          height: size.height,
        },
        persist,
      );
    },
    [commitRect],
  );

  useEffect(() => {
    let cancelled = false;

    queueMicrotask(() => {
      if (cancelled) return;

      const {
        defaultPosition: resolveDefaultPosition,
        minSize: minPanelSize,
        viewportInsets: insets,
      } = optionsRef.current;
      const resolved = resolvePanelRectFromStorage(
        storageKey,
        initialRect,
        resolveDefaultPosition,
        minPanelSize,
        insets,
      );
      commitRect(resolved);
      setStorageHydrated(true);
    });

    return () => {
      cancelled = true;
    };
    // Hydrate once per storage key; defaultPosition identity may change per render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey]);

  const panelRef = useCallback((element: HTMLElement | null) => {
    elementRef.current = element;
    if (element) {
      element.style.touchAction = "none";
    }
  }, []);

  useEffect(() => {
    const onResize = () => {
      cancelAnimationFrame(windowResizeRafRef.current);
      windowResizeRafRef.current = requestAnimationFrame(() => {
        commitRect(committedRef.current, true);
      });
    };

    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(windowResizeRafRef.current);
    };
  }, [commitRect]);

  const applyDragTransform = useCallback((clientX: number, clientY: number) => {
    const element = elementRef.current;
    if (!element || !drag.current.active) return;

    const { startX, startY } = drag.current;
    const { top, left } = committedRef.current;
    const next = clampPanelRect(
      {
        top: top + (clientY - startY),
        left: left + (clientX - startX),
        width: committedRef.current.width,
        height: committedRef.current.height,
      },
      optionsRef.current.minSize,
      optionsRef.current.viewportInsets,
    );

    drag.current.finalTop = next.top;
    drag.current.finalLeft = next.left;
    element.style.transform = `translate3d(${Math.round(next.left - left)}px, ${Math.round(next.top - top)}px, 0)`;
  }, []);

  const endDrag = useCallback(() => {
    if (!drag.current.active) return;

    drag.current.active = false;
    cancelAnimationFrame(rafId.current);

    const element = elementRef.current;
    if (element) {
      element.style.transform = "";
      element.style.willChange = "";
      element.style.cursor = "";
    }

    commitRect(
      {
        ...committedRef.current,
        top: drag.current.finalTop,
        left: drag.current.finalLeft,
      },
      true,
    );

    document.body.classList.remove("dragging");
    element?.focus({ preventScroll: true });
  }, [commitRect]);

  const handleDragPointerDown = useCallback(
    (event: React.PointerEvent<HTMLElement>) => {
      if (drag.current.active) return;

      event.preventDefault();
      const element = event.currentTarget.closest(
        "[data-floating-panel]",
      ) as HTMLElement | null;
      if (!element) return;

      elementRef.current = element;
      tryPointerCapture(element, event.pointerId);

      drag.current = {
        active: true,
        startX: event.clientX,
        startY: event.clientY,
        finalTop: committedRef.current.top,
        finalLeft: committedRef.current.left,
      };

      element.style.willChange = "transform";
      element.style.cursor = "grabbing";
      document.body.classList.add("dragging");

      const controller = new AbortController();
      dragAbortRef.current?.abort();
      dragAbortRef.current = controller;
      const { signal } = controller;

      const onMove = (moveEvent: PointerEvent) => {
        if (!drag.current.active) return;
        cancelAnimationFrame(rafId.current);
        const x = moveEvent.clientX;
        const y = moveEvent.clientY;
        rafId.current = requestAnimationFrame(() => applyDragTransform(x, y));
      };

      const onEnd = () => {
        controller.abort();
        dragAbortRef.current = null;
        endDrag();
      };

      element.addEventListener("pointermove", onMove, { signal });
      element.addEventListener("pointerup", onEnd, { signal });
      element.addEventListener("pointercancel", onEnd, { signal });
    },
    [applyDragTransform, endDrag],
  );

  const handleResizePointerDown = useCallback(
    (event: React.PointerEvent<HTMLElement>) => {
      event.preventDefault();
      event.stopPropagation();

      const panel = event.currentTarget.closest(
        "[data-floating-panel]",
      ) as HTMLElement | null;
      if (panel) {
        elementRef.current = panel;
      }

      const handle = (event.currentTarget.getAttribute("data-resize-handle") ??
        "se") as ResizeHandle;

      const resizeHandle = event.currentTarget;
      tryPointerCapture(resizeHandle, event.pointerId);

      const startX = event.clientX;
      const startY = event.clientY;
      const base = committedRef.current;
      let finalRect = base;

      const controller = new AbortController();
      resizeAbortRef.current?.abort();
      resizeAbortRef.current = controller;
      const { signal } = controller;

      const onMove = (moveEvent: PointerEvent) => {
        cancelAnimationFrame(rafId.current);
        const dx = moveEvent.clientX - startX;
        const dy = moveEvent.clientY - startY;

        rafId.current = requestAnimationFrame(() => {
          finalRect = resizePanelRect(
            base,
            { dx, dy },
            handle,
            optionsRef.current.minSize,
            optionsRef.current.viewportInsets,
          );
          commitRect(finalRect, false);
        });
      };

      const onEnd = () => {
        controller.abort();
        resizeAbortRef.current = null;
        cancelAnimationFrame(rafId.current);
        commitRect(finalRect, true);
      };

      resizeHandle.addEventListener("pointermove", onMove, { signal });
      resizeHandle.addEventListener("pointerup", onEnd, { signal });
      resizeHandle.addEventListener("pointercancel", onEnd, { signal });
    },
    [commitRect],
  );

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLElement>) => {
      if (
        !isFloatingPanelRootKeyboardTarget(event.target, event.currentTarget)
      ) {
        return;
      }
      if (!ARROW_KEYS.has(event.key)) return;

      event.preventDefault();
      const step = event.shiftKey ? NUDGE_SHIFT : NUDGE;
      const { top, left, width, height } = committedRef.current;

      const nextTop =
        event.key === "ArrowUp"
          ? top - step
          : event.key === "ArrowDown"
            ? top + step
            : top;
      const nextLeft =
        event.key === "ArrowLeft"
          ? left - step
          : event.key === "ArrowRight"
            ? left + step
            : left;

      commitRect({ top: nextTop, left: nextLeft, width, height }, true);
    },
    [commitRect],
  );

  const handleResizeKeyDown = useCallback(
    (handle: ResizeHandle) => (event: React.KeyboardEvent<HTMLElement>) => {
      if (!ARROW_KEYS.has(event.key)) return;

      event.preventDefault();
      event.stopPropagation();

      const step = event.shiftKey ? NUDGE_SHIFT : NUDGE;
      const delta = keyboardResizeDelta(handle, event.key, step);
      if (!delta) return;

      commitRect(
        resizePanelRect(
          committedRef.current,
          delta,
          handle,
          optionsRef.current.minSize,
          optionsRef.current.viewportInsets,
        ),
        true,
      );
    },
    [commitRect],
  );

  useEffect(() => {
    return () => {
      cancelAnimationFrame(rafId.current);
      cancelAnimationFrame(windowResizeRafRef.current);
      dragAbortRef.current?.abort();
      resizeAbortRef.current?.abort();
      if (drag.current.active) {
        drag.current.active = false;
        document.body.classList.remove("dragging");
      }
    };
  }, []);

  return {
    rect,
    panelRef,
    setPanelSize,
    storageHydrated,
    handleDragPointerDown,
    handleResizePointerDown,
    handleResizeKeyDown,
    handleKeyDown,
  };
}
