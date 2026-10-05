"use client";

import { ChevronDown, GripVertical } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState, type ReactNode } from "react";

import DraggableWrapper from "@/components/reusable/interaction/DraggableWrapper";
import { cn } from "@/lib/utils";

import type { GamePhase } from "@/components/where-is-krecik/types";

const STORAGE_KEY = "where-is-krecik-panel-v2";
const INITIAL_POSITION = { top: 96, left: 16 };
/** Match the chrome row (`h-22`) so the panel stays below the header. */
const HEADER_HEIGHT = 88;

type KrecikFloatingPanelProps = {
  phase: GamePhase;
  children: ReactNode;
};

/**
 * Draggable shell for the game's control panel, using lexical-mini's
 * `DraggableWrapper` (pointer drag, arrow-key nudge, position persisted).
 */
export function KrecikFloatingPanel({
  phase,
  children,
}: KrecikFloatingPanelProps) {
  const t = useTranslations("where-is-krecik");
  const [collapsed, setCollapsed] = useState(true);

  return (
    <DraggableWrapper
      initialPosition={INITIAL_POSITION}
      storageKey={STORAGE_KEY}
      headerHeight={HEADER_HEIGHT}
      ariaLabel={t("floating.controls")}
      className="z-40 flex w-90 max-h-[calc(100dvh-112px)] flex-col overflow-hidden rounded-2xl border border-lime-300/70 bg-lime-50 shadow-[0_24px_60px_-20px_rgba(63,98,18,0.45)] outline-none focus-visible:ring-3 focus-visible:ring-amber-400/70 dark:border-lime-500/20 dark:bg-lime-950"
    >
      <aside
        data-testid="krecik-floating-panel"
        data-collapsed={collapsed}
        role="complementary"
        className="flex min-h-0 flex-col"
      >
        <div
          data-testid="krecik-floating-panel-handle"
          className="flex shrink-0 cursor-grab items-center gap-2 border-b border-lime-300/60 bg-lime-100/70 px-3 py-2 select-none dark:border-lime-500/20 dark:bg-lime-900/40"
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
            aria-label={
              collapsed ? t("floating.expand") : t("floating.collapse")
            }
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
          <div className="flex min-h-0 flex-col overflow-y-auto overscroll-y-contain">
            {children}
          </div>
        ) : null}
      </aside>
    </DraggableWrapper>
  );
}
