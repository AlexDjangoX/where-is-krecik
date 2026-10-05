"use client";

import type React from "react";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

type Position = { top: number; left: number };

type DragAxis = "both" | "x" | "y";

const NUDGE = 4;
const NUDGE_SHIFT = 20;
const ARROW_KEYS = new Set(["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"]);

/**
 * Smooth, jitter-free draggable hook backed by the Pointer Events API.
 *
 * Architecture:
 * • `setPointerCapture` keeps the element receiving move/up events even when
 *   the pointer leaves it, eliminating the "cursor escapes element" edge case
 *   and replacing two separate mouse + touch code paths with one.
 * • Element dimensions are read once at drag-start (`sizeRef`) so `applyTransform`
 *   — called on every animation frame — never triggers a layout read.
 * • React state (`position`) is written only on drag-end; during the drag we
 *   write `translate3d` directly to the DOM (compositor-thread only, zero renders).
 *
 * Usage:
 *   const { position, dragRef, handlePointerDown, handleKeyDown, setPosition } =
 *     useDraggable(initialPosition, storageKey);
 *
 *   <div
 *     ref={dragRef}
 *     style={{ position: 'absolute', top: position.top, left: position.left }}
 *     onPointerDown={handlePointerDown}
 *     onKeyDown={handleKeyDown}
 *     tabIndex={0}
 *     aria-label="Draggable panel — use arrow keys to reposition"
 *   />
 *
 * Child elements that must receive their own pointer events (buttons, inputs)
 * should call e.stopPropagation() on their onPointerDown handlers.
 *
 * @param storageKey Pass a stable string (module-level constant) to avoid
 *   resetting the saved position on every render.
 */
const useDraggable = (
  initialPosition: Position = { top: 0, left: 0 },
  storageKey: string,
  headerHeight = 0,
  dragAxis: DragAxis = "both",
) => {
  // Always start from initialPosition so SSR and the first client render match.
  // Restored coordinates are applied in useLayoutEffect, before paint.
  const [position, setPositionState] = useState<Position>(initialPosition);
  const [ready, setReady] = useState(false);

  // Mirror kept in a ref so drag callbacks see the latest committed position
  // without needing to be recreated on every state change.
  //
  // Invariant: every code path that calls setPositionState also updates this
  // ref synchronously (endDrag, handleKeyDown, setPosition, onResize). The raw
  // setPositionState setter is intentionally not exported so callers cannot
  // bypass this invariant and leave committedRef stale.
  const committedRef = useRef<Position>(initialPosition);

  // Stable refs for props that are expected to be constant but might change.
  const headerHeightRef = useRef(headerHeight);
  const storageKeyRef = useRef(storageKey);
  const dragAxisRef = useRef(dragAxis);

  useEffect(() => {
    headerHeightRef.current = headerHeight;
  }, [headerHeight]);
  useEffect(() => {
    storageKeyRef.current = storageKey;
  }, [storageKey]);
  useEffect(() => {
    dragAxisRef.current = dragAxis;
  }, [dragAxis]);

  // Ref to the draggable DOM element — populated via dragRef callback ref.
  const elementRef = useRef<HTMLElement | null>(null);

  // Element dimensions cached at drag-start so applyTransform never reads
  // offsetWidth/offsetHeight (which force layout) on the hot animation path.
  const sizeRef = useRef({ w: 0, h: 0 });

  // Drag state lives outside React to avoid re-renders during move.
  const drag = useRef({
    active: false,
    startX: 0,
    startY: 0,
    finalTop: 0,
    finalLeft: 0,
  });

  // Single rAF slot — cancel before scheduling a new frame.
  const rafId = useRef(0);

  // AbortController used to remove per-drag element listeners in one call.
  // If the element is removed from the DOM mid-drag, aborting ensures no
  // listeners linger on a detached node.
  const dragAbortRef = useRef<AbortController | null>(null);

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  /**
   * Clamp a proposed position to the visible viewport.
   * Takes explicit dimensions so callers can pass sizeRef (hot path) or
   * el.offsetWidth (non-hot paths like resize/keyboard) as appropriate.
   */
  const clampPos = useCallback(
    (rawTop: number, rawLeft: number, w: number, h: number): Position => {
      const vw = document.documentElement.clientWidth;
      const vh = document.documentElement.clientHeight;
      // When an element is taller/wider than the viewport, `vh - h` / `vw - w`
      // becomes negative. Clamp the upper bound to the lower bound so the
      // result is always ≥ headerHeight (top) or ≥ 0 (left) rather than NaN.
      return {
        top: Math.max(
          headerHeightRef.current,
          Math.min(rawTop, Math.max(headerHeightRef.current, vh - h)),
        ),
        left: Math.max(0, Math.min(rawLeft, Math.max(0, vw - w))),
      };
    },
    [],
  );

  const savePosition = useCallback((next: Position) => {
    try {
      const axis = dragAxisRef.current;
      const payload =
        axis === "y"
          ? { top: next.top }
          : axis === "x"
            ? { left: next.left }
            : next;
      localStorage.setItem(storageKeyRef.current, JSON.stringify(payload));
    } catch {
      // QuotaExceededError (private browsing) — silently swallow.
    }
  }, []);

  useLayoutEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved) as { top?: unknown; left?: unknown };
        const axis = dragAxisRef.current;
        let next: Position | null = null;

        if (
          axis === "y" &&
          typeof parsed.top === "number" &&
          isFinite(parsed.top)
        ) {
          next = { top: parsed.top, left: initialPosition.left };
        } else if (
          axis === "x" &&
          typeof parsed.left === "number" &&
          isFinite(parsed.left)
        ) {
          next = { top: initialPosition.top, left: parsed.left };
        } else if (
          typeof parsed.top === "number" &&
          typeof parsed.left === "number" &&
          isFinite(parsed.top) &&
          isFinite(parsed.left)
        ) {
          next = { top: parsed.top, left: parsed.left };
        }

        if (next) {
          const el = elementRef.current;
          const resolved =
            el && el.offsetWidth > 0 && el.offsetHeight > 0
              ? clampPos(next.top, next.left, el.offsetWidth, el.offsetHeight)
              : next;

          committedRef.current = resolved;
          setPositionState(resolved);
        }
      }
    } catch {
      // Ignore corrupted storage
    }
    setReady(true);
    // initialPosition is intentionally omitted — callers must pass a stable value.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey, clampPos]);

  // ---------------------------------------------------------------------------
  // Callback ref — consumers MUST attach this to the draggable element.
  //
  // • Sets touch-action: none so the browser does not initiate scroll/zoom
  //   before pointer events fire.
  // • Clamps the saved position to the actual viewport on mount (only if the
  //   element has non-zero dimensions at that point).
  // ---------------------------------------------------------------------------

  const dragRef = useCallback((el: HTMLElement | null) => {
    elementRef.current = el;
    if (!el) return;

    el.style.touchAction = "none";
  }, []);

  useLayoutEffect(() => {
    const el = elementRef.current;
    if (!el || el.offsetWidth <= 0 || el.offsetHeight <= 0) return;

    const clamped = clampPos(
      committedRef.current.top,
      committedRef.current.left,
      el.offsetWidth,
      el.offsetHeight,
    );
    if (
      clamped.top === committedRef.current.top &&
      clamped.left === committedRef.current.left
    ) {
      return;
    }

    committedRef.current = clamped;
    setPositionState(clamped);
  }, [clampPos, position]);

  // ---------------------------------------------------------------------------
  // Core drag helpers
  // ---------------------------------------------------------------------------

  const applyTransform = useCallback(
    (clientX: number, clientY: number) => {
      const el = elementRef.current;
      if (!el || !drag.current.active) return;
      const { startX, startY } = drag.current;
      const { top: cTop, left: cLeft } = committedRef.current;

      // Uses sizeRef — no layout read on this hot path.
      const axis = dragAxisRef.current;
      const clamped = clampPos(
        axis === "x" ? cTop : cTop + (clientY - startY),
        axis === "y" ? cLeft : cLeft + (clientX - startX),
        sizeRef.current.w,
        sizeRef.current.h,
      );
      drag.current.finalTop = clamped.top;
      drag.current.finalLeft = clamped.left;

      el.style.transform = `translate3d(${Math.round(clamped.left - cLeft)}px, ${Math.round(clamped.top - cTop)}px, 0)`;
    },
    [clampPos],
  );

  const startDrag = useCallback(
    (element: HTMLElement, clientX: number, clientY: number) => {
      elementRef.current = element;
      // Cache dimensions once per drag — eliminates layout reads on the hot path.
      sizeRef.current = { w: element.offsetWidth, h: element.offsetHeight };
      drag.current = {
        active: true,
        startX: clientX,
        startY: clientY,
        finalTop: committedRef.current.top,
        finalLeft: committedRef.current.left,
      };
      element.style.willChange = "transform";
      element.style.cursor = "grabbing";
      if (typeof document !== "undefined") {
        document.body.classList.add("dragging");
      }
    },
    [],
  );

  const endDrag = useCallback(() => {
    if (!drag.current.active) return;
    drag.current.active = false;
    cancelAnimationFrame(rafId.current);

    const el = elementRef.current;
    if (el) {
      el.style.transform = "";
      el.style.willChange = "";
      el.style.cursor = "";
    }

    const next: Position = {
      top: drag.current.finalTop,
      left: drag.current.finalLeft,
    };
    committedRef.current = next;
    setPositionState(next);
    savePosition(next);
    if (typeof document !== "undefined") {
      document.body.classList.remove("dragging");
    }
    // Focus the element after a drag so arrow-key nudging works immediately.
    el?.focus({ preventScroll: true });
  }, [savePosition]);

  // ---------------------------------------------------------------------------
  // Unified Pointer Events handler
  //
  // Covers mouse, touch, and stylus in a single code path.
  // setPointerCapture redirects all subsequent move/up events to this element
  // even when the pointer leaves its bounds — eliminating the "cursor escapes"
  // edge case that plagued the old mousemove-on-document approach.
  // ---------------------------------------------------------------------------

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLElement>) => {
      // Ignore secondary pointers (multi-touch) while a drag is already active.
      if (drag.current.active) return;

      // Don't steal pointer events from interactive children (buttons, inputs,
      // links, etc.). Without this, tapping a button inside the drag container
      // would call preventDefault + setPointerCapture before the button can
      // fire its own click, breaking all child interactions on touch devices.
      //
      // composedPath() traverses shadow boundaries, so this check works even
      // when the click originates inside a shadow tree (e.g. emoji-mart's
      // <em-emoji-picker>). The old target.closest() approach failed for shadow
      // DOM because e.target was retargeted to the shadow host, and closest()
      // cannot cross the shadow boundary.
      const composed = e.nativeEvent.composedPath() as EventTarget[];
      if (
        composed.some(
          (node) =>
            node instanceof HTMLElement &&
            node !== e.currentTarget &&
            node.matches(
              'button, input, select, textarea, a, [role="button"], [role="slider"]',
            ),
        )
      )
        return;

      e.preventDefault();
      const el = e.currentTarget;
      el.setPointerCapture(e.pointerId);
      startDrag(el, e.clientX, e.clientY);

      // Each drag gets its own AbortController so all three listeners can be
      // torn down in a single abort() call — from onEnd, from unmount cleanup,
      // or if the element is detached mid-drag.
      const controller = new AbortController();
      dragAbortRef.current?.abort(); // cancel any previous (shouldn't happen, but safe)
      dragAbortRef.current = controller;
      const { signal } = controller;

      // onMove and onEnd close over `drag`, `rafId`, and `elementRef` via refs —
      // all of which are stable object identities. applyTransform and endDrag
      // are stable useCallbacks. Safe to capture directly in these closures.
      const onMove = (evt: PointerEvent) => {
        if (!drag.current.active) return;
        cancelAnimationFrame(rafId.current);
        const x = evt.clientX;
        const y = evt.clientY;
        rafId.current = requestAnimationFrame(() => applyTransform(x, y));
      };

      const onEnd = () => {
        controller.abort(); // removes all three listeners atomically
        dragAbortRef.current = null;
        endDrag();
      };

      el.addEventListener("pointermove", onMove, { signal });
      el.addEventListener("pointerup", onEnd, { signal });
      // pointercancel fires on OS interruptions (e.g. incoming call on mobile).
      el.addEventListener("pointercancel", onEnd, { signal });
    },
    [startDrag, applyTransform, endDrag],
  );

  // ---------------------------------------------------------------------------
  // Keyboard nudging
  // ---------------------------------------------------------------------------

  /** Arrow-key nudging. Add tabIndex={0} to the element to enable focus. */
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLElement>) => {
      // Guard first, then preventDefault — never called on non-arrow keys.
      if (!ARROW_KEYS.has(e.key)) return;

      const el = elementRef.current;
      if (!el) return;

      e.preventDefault();
      const step = e.shiftKey ? NUDGE_SHIFT : NUDGE;
      const { top, left } = committedRef.current;

      let newTop = top;
      let newLeft = left;
      const axis = dragAxisRef.current;
      if (e.key === "ArrowUp" || e.key === "ArrowDown") {
        if (axis === "x") return;
        if (e.key === "ArrowUp") newTop -= step;
        else newTop += step;
      } else {
        if (axis === "y") return;
        if (e.key === "ArrowLeft") newLeft -= step;
        else newLeft += step;
      }

      const next = clampPos(newTop, newLeft, el.offsetWidth, el.offsetHeight);
      committedRef.current = next;
      setPositionState(next);
      savePosition(next);
    },
    [clampPos, savePosition],
  );

  // ---------------------------------------------------------------------------
  // Viewport resize — re-clamp position when window dimensions change.
  // ---------------------------------------------------------------------------

  useEffect(() => {
    const onResize = () => {
      const el = elementRef.current;
      if (!el) return;
      const clamped = clampPos(
        committedRef.current.top,
        committedRef.current.left,
        el.offsetWidth,
        el.offsetHeight,
      );
      if (
        clamped.top !== committedRef.current.top ||
        clamped.left !== committedRef.current.left
      ) {
        committedRef.current = clamped;
        setPositionState(clamped);
        savePosition(clamped);
      }
    };

    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [clampPos, savePosition]);

  // ---------------------------------------------------------------------------
  // Unmount cleanup
  //
  // If the component unmounts mid-drag (e.g. the player is closed while being
  // dragged), ensure we leave no stale body classes, transforms, or rAF slots.
  // ---------------------------------------------------------------------------

  useEffect(() => {
    return () => {
      cancelAnimationFrame(rafId.current);
      // Abort any in-flight drag listeners — prevents leaks if the element is
      // removed from the DOM while a drag is in progress.
      dragAbortRef.current?.abort();
      dragAbortRef.current = null;
      if (drag.current.active) {
        drag.current.active = false;
        if (typeof document !== "undefined") {
          document.body.classList.remove("dragging");
        }
        const el = elementRef.current;
        if (el) {
          el.style.transform = "";
          el.style.willChange = "";
          el.style.cursor = "";
        }
      }
    };
  }, []);

  // ---------------------------------------------------------------------------
  // External position control (e.g. centering on mount/resize)
  // ---------------------------------------------------------------------------

  const setPosition = useCallback(
    (posOrUpdater: Position | ((prev: Position) => Position)) => {
      const el = elementRef.current;
      if (el) {
        el.style.transform = "";
        el.style.willChange = "";
      }
      setPositionState((prev) => {
        const next =
          typeof posOrUpdater === "function"
            ? posOrUpdater(prev)
            : posOrUpdater;
        committedRef.current = next;
        return next;
      });
    },
    [],
  );

  return {
    position,
    ready,
    dragRef,
    handlePointerDown,
    handleKeyDown,
    setPosition,
  };
};

export default useDraggable;
