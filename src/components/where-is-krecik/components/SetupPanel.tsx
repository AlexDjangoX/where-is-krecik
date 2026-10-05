"use client";

import {
  ArrowUpFromDot,
  Ban,
  Minus,
  Orbit,
  Play,
  Plus,
  Rabbit,
} from "lucide-react";
import { useTranslations } from "next-intl";
import type { ComponentType } from "react";

import { cn } from "@/lib/utils";

import {
  formatCoordinate,
  MAX_GRID_SIZE,
  MIN_GRID_SIZE,
} from "@/components/where-is-krecik/lib/grid";
import { wormholeColor } from "@/components/where-is-krecik/lib/wormhole-colors";
import type { GameState, SetupTool } from "@/components/where-is-krecik/types";
import {
  BUTTON_EMERALD,
  BUTTON_LIME,
  CELL,
  HEADING,
  HOLE,
  LABEL,
  PANEL,
  SOLID_BUTTON,
  TEXT,
} from "@/components/where-is-krecik/components/panel-styles";
import { ShowKrecikToggle } from "@/components/where-is-krecik/components/ShowKrecikToggle";

type SetupPanelProps = {
  state: GameState;
  onGridSizeChange: (size: number) => void;
  onSelectTool: (tool: SetupTool) => void;
  onStartRound: () => void;
  onToggleShowMole: () => void;
};

const TOOLS: {
  tool: SetupTool;
  icon: ComponentType<{ className?: string }>;
  /** Icon colour inside the dark hole, echoing the marker used on the board. */
  iconClass: string;
}[] = [
  {
    tool: "moleStart",
    icon: Rabbit,
    iconClass: "text-amber-300",
  },
  {
    tool: "blocked",
    icon: Ban,
    iconClass: "text-stone-300",
  },
  {
    tool: "wormholeEntrance",
    icon: Orbit,
    iconClass: "text-violet-300",
  },
  {
    tool: "wormholeDestination",
    icon: ArrowUpFromDot,
    iconClass: "text-sky-300",
  },
];

export function SetupPanel({
  state,
  onGridSizeChange,
  onSelectTool,
  onStartRound,
  onToggleShowMole,
}: SetupPanelProps) {
  const t = useTranslations("where-is-krecik");
  const activeTool = TOOLS.find((entry) => entry.tool === state.selectedTool)!;
  const canStart = state.startingPosition !== null;

  return (
    <section data-testid="krecik-setup-panel" className={PANEL}>
      <header className="px-1 pt-1">
        <h2 className={HEADING}>{t("setup.heading")}</h2>
        <p className={cn(TEXT, "mt-0.5")}>{t("setup.intro")}</p>
      </header>

      {/* Board size */}
      <div
        className={cn(
          CELL,
          "flex items-center justify-between gap-3 px-3 py-2.5",
        )}
      >
        <span className={LABEL}>{t("setup.boardSize")}</span>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            aria-label={t("setup.smallerBoard")}
            data-testid="krecik-grid-smaller"
            disabled={state.gridSize <= MIN_GRID_SIZE}
            onClick={() => onGridSizeChange(state.gridSize - 1)}
            className={cn(SOLID_BUTTON, BUTTON_LIME, "size-8 rounded-lg")}
          >
            <Minus className="size-4" />
          </button>
          <span
            data-testid="krecik-grid-size"
            className="min-w-14 text-center text-base font-semibold text-lime-950 tabular-nums dark:text-lime-50"
          >
            {state.gridSize} × {state.gridSize}
          </span>
          <button
            type="button"
            aria-label={t("setup.biggerBoard")}
            data-testid="krecik-grid-bigger"
            disabled={state.gridSize >= MAX_GRID_SIZE}
            onClick={() => onGridSizeChange(state.gridSize + 1)}
            className={cn(SOLID_BUTTON, BUTTON_LIME, "size-8 rounded-lg")}
          >
            <Plus className="size-4" />
          </button>
        </div>
      </div>

      {/* Tools: each looks like a small grass cell with a hole for the icon */}
      <div className="flex flex-col gap-2">
        <span className={cn(LABEL, "px-1")}>{t("setup.tool")}</span>
        <div className="grid grid-cols-2 gap-2">
          {TOOLS.map(({ tool, icon: Icon, iconClass }) => {
            const active = tool === state.selectedTool;
            return (
              <button
                key={tool}
                type="button"
                data-testid={`krecik-tool-${tool}`}
                aria-pressed={active}
                onClick={() => onSelectTool(tool)}
                className={cn(
                  "flex items-center gap-2.5 rounded-xl border px-2.5 py-2 text-left text-sm font-medium transition-all outline-none focus-visible:ring-3 focus-visible:ring-amber-400/70",
                  active
                    ? "border-lime-700/20 bg-linear-to-b from-lime-300 to-lime-400 text-lime-950 shadow-sm ring-3 ring-amber-400 ring-offset-2 ring-offset-lime-50 dark:from-lime-600 dark:to-lime-700 dark:text-lime-50 dark:ring-offset-lime-950"
                    : "border-lime-700/10 bg-white/70 text-lime-900 hover:bg-white dark:border-lime-300/10 dark:bg-lime-900/40 dark:text-lime-100 dark:hover:bg-lime-900/70",
                )}
              >
                <span className={cn(HOLE, "size-8")}>
                  <Icon className={cn("size-4", iconClass)} />
                </span>
                <span className="leading-tight">
                  {t(`setup.tools.${tool}.label`)}
                </span>
              </button>
            );
          })}
        </div>
        <p
          data-testid="krecik-tool-hint"
          className={cn(CELL, TEXT, "px-3 py-2.5 leading-relaxed")}
        >
          {t(`setup.tools.${activeTool.tool}.hint`)}
        </p>
      </div>

      {/* Summary */}
      <dl
        className={cn(
          CELL,
          "divide-y divide-lime-700/10 px-3 text-sm dark:divide-lime-300/10",
        )}
      >
        <div className="flex items-center justify-between gap-3 py-2">
          <dt className={TEXT}>{t("setup.startsAt")}</dt>
          <dd
            data-testid="krecik-start-summary"
            className="font-semibold text-lime-950 tabular-nums dark:text-lime-50"
          >
            {state.startingPosition
              ? formatCoordinate(state.startingPosition)
              : "—"}
          </dd>
        </div>
        <div className="flex items-start justify-between gap-3 py-2">
          <dt className={TEXT}>{t("setup.rocks")}</dt>
          <dd className="text-right font-semibold text-lime-950 tabular-nums dark:text-lime-50">
            {state.blockedCells.length === 0
              ? t("setup.none")
              : state.blockedCells.map(formatCoordinate).join(", ")}
          </dd>
        </div>
        <div className="flex items-start justify-between gap-3 py-2">
          <dt className={TEXT}>{t("setup.wormholes")}</dt>
          <dd className="flex flex-wrap justify-end gap-1.5">
            {state.wormholes.length === 0 ? (
              <span className="font-semibold text-lime-950 dark:text-lime-50">
                {t("setup.none")}
              </span>
            ) : (
              state.wormholes.map((wormhole, index) => (
                <span
                  key={formatCoordinate(wormhole.entrance)}
                  className={cn(
                    "rounded-md px-1.5 py-0.5 text-xs font-semibold tabular-nums",
                    wormholeColor(index).badge,
                  )}
                >
                  {formatCoordinate(wormhole.entrance)} →{" "}
                  {formatCoordinate(wormhole.destination)}
                </span>
              ))
            )}
          </dd>
        </div>
      </dl>

      <div className="mt-auto flex flex-col gap-3">
        <ShowKrecikToggle
          checked={state.showMoleDuringPlay}
          onToggle={onToggleShowMole}
        />
        <button
          type="button"
          data-testid="krecik-start-round"
          disabled={!canStart}
          onClick={onStartRound}
          className={cn(SOLID_BUTTON, BUTTON_EMERALD, "h-11 w-full")}
        >
          <Play className="size-4" />
          {t("setup.startRound")}
        </button>
        {!canStart ? (
          <p className={cn(TEXT, "-mt-1 text-center text-xs")}>
            {t("setup.placeFirst")}
          </p>
        ) : null}
      </div>
    </section>
  );
}
