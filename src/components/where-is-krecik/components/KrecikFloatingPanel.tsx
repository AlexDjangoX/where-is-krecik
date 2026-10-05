"use client";

import { ChevronDown, GripVertical } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import {
  stackedDefaultPosition,
  type Size,
  type ViewportInsets,
} from "@/components/reusable/interaction/floating-panel-geometry";
import { useFloatingPanel } from "@/components/reusable/interaction/useFloatingPanel";
import { cn } from "@/lib/utils";

import type { GamePhase } from "@/components/where-is-krecik/types";

const STORAGE_KEY = "where-is-krecik-panel-v2";
const VIEWPORT: ViewportInsets = { top: 84, bottom: 24, gutter: 16 };
const PANEL_WIDTH = 360;
/** Height is content-driven; this only seeds the rect before the first measurement. */
const MIN_SIZE: Size = { width: PANEL_WIDTH, height: 52 };
const INITIAL_RECT = {
  top: 96,
  left: 16,
  width: PANEL_WIDTH,
  height: 600,
} as const;

type KrecikFloatingPanelProps = {
  phase: GamePhase;
  children: ReactNode;
};

/**
 * Draggable shell for the game's control panel, built on the app's shared
 * floating-panel hook (pointer drag on the header, arrow-key nudge, position
 * persisted). The panel is as tall as its content — it never scrolls unless
 * the viewport itself is shorter than the content.
 */
export function KrecikFloatingPanel({
  phase,
  children,
}: KrecikFloatingPanelProps) {
  const t = useTranslations("where-is-krecik");
  const [collapsed, setCollapsed] = useState(false);
  const elementRef = useRef<HTMLElement | null>(null);

  const defaultPosition = useCallback(
    (size: Size) => stackedDefaultPosition(0, size, VIEWPORT, 0),
    [],
  );

  const {
    rect,
    panelRef: assignPanelRef,
    setPanelSize,
    handleDragPointerDown,
    handleKeyDown,
  } = useFloatingPanel({
    storageKey: STORAGE_KEY,
    initialRect: INITIAL_RECT,
    defaultPosition,
    minSize: MIN_SIZE,
    viewportInsets: VIEWPORT,
  });

  const panelRef = useCallback(
    (element: HTMLElement | null) => {
      elementRef.current = element;
      assignPanelRef(element);
    },
    [assignPanelRef],
  );

  // Keep the hook's rect in step with the rendered height so viewport clamping
  // (drag bounds, window resize) uses the real size of the content.
  useEffect(() => {
    const element = elementRef.current;
    if (!element || typeof ResizeObserver === "undefined") return;

    const sync = () =>
      setPanelSize({ width: PANEL_WIDTH, height: element.offsetHeight });
    sync();

    const observer = new ResizeObserver(sync);
    observer.observe(element);
    return () => observer.disconnect();
  }, [setPanelSize, collapsed, phase]);

  const style = useMemo(
    () => ({
      top: rect.top,
      left: rect.left,
      width: PANEL_WIDTH,
      maxHeight: `calc(100dvh - ${VIEWPORT.top + VIEWPORT.bottom}px)`,
      zIndex: 40,
    }),
    [rect.left, rect.top],
  );

  return (
    <aside
      ref={panelRef}
      data-floating-panel
      data-testid="krecik-floating-panel"
      data-collapsed={collapsed}
      role="complementary"
      aria-label={t("floating.controls")}
      tabIndex={0}
      style={style}
      onKeyDown={handleKeyDown}
      className="fixed flex flex-col overflow-hidden rounded-2xl border border-lime-300/70 bg-lime-50 shadow-[0_24px_60px_-20px_rgba(63,98,18,0.45)] outline-none focus-visible:ring-3 focus-visible:ring-amber-400/70 dark:border-lime-500/20 dark:bg-lime-950"
    >
      <div
        data-testid="krecik-floating-panel-handle"
        onPointerDown={handleDragPointerDown}
        className="flex shrink-0 cursor-grab items-center gap-2 border-b border-lime-300/60 bg-lime-100/70 px-3 py-2 select-none active:cursor-grabbing dark:border-lime-500/20 dark:bg-lime-900/40"
      >
        <GripVertical
          aria-hidden
          className="size-4 shrink-0 text-lime-700/70 dark:text-lime-200/70"
        />
        <div className="min-w-0 flex-1 leading-tight">
          <p className="text-sm font-semibold text-lime-950 dark:text-lime-50">
            {t(`floating.${phase}`)}
          </p>
          <p className="truncate text-[0.7rem] text-lime-900/60 dark:text-lime-100/60">
            {t("floating.dragHint")}
          </p>
        </div>
        <button
          type="button"
          data-testid="krecik-floating-panel-collapse"
          aria-expanded={!collapsed}
          aria-label={collapsed ? t("floating.expand") : t("floating.collapse")}
          onPointerDown={(event) => event.stopPropagation()}
          onClick={() => setCollapsed((value) => !value)}
          className="flex size-7 shrink-0 items-center justify-center rounded-lg text-lime-800 transition-colors outline-none hover:bg-lime-200/70 focus-visible:ring-3 focus-visible:ring-amber-400/70 dark:text-lime-100 dark:hover:bg-lime-800/60"
        >
          <ChevronDown
            className={cn(
              "size-4 transition-transform",
              collapsed && "-rotate-90",
            )}
          />
        </button>
      </div>

      {!collapsed ? (
        // Scrolls only if the viewport is shorter than the content.
        <div className="flex min-h-0 flex-col overflow-y-auto overscroll-y-contain">
          {children}
        </div>
      ) : null}
    </aside>
  );
}
