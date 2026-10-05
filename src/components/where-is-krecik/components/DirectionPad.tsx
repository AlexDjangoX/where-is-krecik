"use client";

import { motion, useAnimation } from "framer-motion";
import { Eye } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect } from "react";

import { cn } from "@/lib/utils";

import type { Direction, MoveResult } from "@/components/where-is-krecik/types";
import {
  DirectionArrow,
  useDirectionLabels,
} from "@/components/where-is-krecik/components/DirectionArrow";
import {
  BUTTON_EMERALD,
  BUTTON_LIME,
  CELL,
  HEADING,
  HOLE,
  PANEL,
  SOLID_BUTTON,
  TEXT,
} from "@/components/where-is-krecik/components/panel-styles";
import { ShowKrecikToggle } from "@/components/where-is-krecik/components/ShowKrecikToggle";

type DirectionPadProps = {
  onMove: (direction: Direction) => void;
  onReveal: () => void;
  moveCount: number;
  lastMove: MoveResult | null;
  /** Increment to trigger the invalid-move shake. */
  shakeKey: number;
  showMole: boolean;
  onToggleShowMole: () => void;
};

const PAD_LAYOUT: (Direction | null)[] = [
  "upLeft",
  "up",
  "upRight",
  "left",
  null,
  "right",
  "downLeft",
  "down",
  "downRight",
];

const KEY_TO_DIRECTION: Record<string, Direction> = {
  ArrowUp: "up",
  ArrowDown: "down",
  ArrowLeft: "left",
  ArrowRight: "right",
  // Numpad layout: 7 8 9 / 4 _ 6 / 1 2 3
  "7": "upLeft",
  "8": "up",
  "9": "upRight",
  "4": "left",
  "6": "right",
  "1": "downLeft",
  "2": "down",
  "3": "downRight",
};

/**
 * Keys that should not move Krecik: text inputs, and the floating panel root
 * (arrow keys there nudge the panel itself).
 */
function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return (
    tag === "INPUT" ||
    tag === "TEXTAREA" ||
    tag === "SELECT" ||
    target.isContentEditable ||
    target.hasAttribute("data-floating-panel") ||
    target.hasAttribute("data-resize-handle")
  );
}

export function DirectionPad({
  onMove,
  onReveal,
  moveCount,
  lastMove,
  shakeKey,
  showMole,
  onToggleShowMole,
}: DirectionPadProps) {
  const t = useTranslations("where-is-krecik");
  const directionLabels = useDirectionLabels();
  const controls = useAnimation();

  useEffect(() => {
    if (shakeKey === 0) return;
    void controls.start({
      x: [0, -6, 6, -4, 4, 0],
      transition: { duration: 0.35 },
    });
  }, [shakeKey, controls]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isTypingTarget(event.target)) return;
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      const direction = KEY_TO_DIRECTION[event.key];
      if (direction) {
        event.preventDefault();
        onMove(direction);
        return;
      }
      if (event.key === "r" || event.key === "R") {
        event.preventDefault();
        onReveal();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onMove, onReveal]);

  const invalid = lastMove !== null && !lastMove.ok;

  return (
    <section data-testid="krecik-direction-pad" className={PANEL}>
      <header className="px-1 pt-1">
        <h2 className={HEADING}>{t("pad.heading")}</h2>
        <p className={cn(TEXT, "mt-0.5")}>
          {showMole ? t("pad.demoHint") : t("pad.hiddenHint")}
        </p>
      </header>

      <ShowKrecikToggle checked={showMole} onToggle={onToggleShowMole} />

      {/* The pad is a mini 3×3 board: grass buttons around a hole in the middle. */}
      <motion.div
        animate={controls}
        className={cn(CELL, "mx-auto grid grid-cols-3 gap-2 p-2")}
        role="group"
        aria-label={t("pad.controls")}
      >
        {PAD_LAYOUT.map((direction, index) => {
          if (direction === null) {
            return (
              <div
                key="center"
                className="flex size-16 items-center justify-center rounded-xl border border-lime-700/15 bg-gradient-to-b from-lime-300 to-lime-400 sm:size-[4.5rem] dark:border-lime-300/10 dark:from-lime-700 dark:to-lime-800"
                aria-hidden
              >
                <span
                  className={cn(
                    HOLE,
                    "size-10 text-lg font-semibold transition-colors sm:size-11",
                    invalid && "text-rose-300",
                    !invalid && showMole && "text-amber-300",
                    !invalid && !showMole && "text-lime-100",
                  )}
                >
                  {showMole ? <Eye className="size-5" /> : "?"}
                </span>
              </div>
            );
          }
          return (
            <button
              key={direction}
              type="button"
              data-testid={`krecik-move-${direction}`}
              aria-label={directionLabels[direction]}
              onClick={() => onMove(direction)}
              className={cn(
                SOLID_BUTTON,
                BUTTON_LIME,
                "size-16 rounded-xl sm:size-[4.5rem]",
              )}
              style={{
                gridColumn: (index % 3) + 1,
                gridRow: Math.floor(index / 3) + 1,
              }}
            >
              <DirectionArrow direction={direction} className="size-7" />
            </button>
          );
        })}
      </motion.div>

      <div
        className={cn(
          CELL,
          "flex items-center justify-between px-3 py-2 text-sm",
        )}
      >
        <span className={TEXT}>
          {t("pad.moves")}{" "}
          <span
            data-testid="krecik-move-count"
            className="ml-1 font-semibold text-lime-950 tabular-nums dark:text-lime-50"
          >
            {moveCount}
          </span>
        </span>
        <span
          data-testid="krecik-move-feedback"
          className={cn(
            "rounded-md px-2 py-0.5 text-xs font-medium transition-colors",
            invalid
              ? "bg-rose-100 text-rose-800 dark:bg-rose-500/15 dark:text-rose-200"
              : "bg-lime-200 text-lime-900 dark:bg-lime-500/20 dark:text-lime-100",
          )}
          aria-live="polite"
        >
          {invalid
            ? t("pad.invalid")
            : lastMove
              ? t("pad.moved")
              : t("pad.ready")}
        </span>
      </div>

      <div className="mt-auto flex flex-col gap-2">
        <button
          type="button"
          data-testid="krecik-reveal"
          onClick={onReveal}
          className={cn(SOLID_BUTTON, BUTTON_EMERALD, "h-11 w-full")}
        >
          <Eye className="size-4" />
          {t("pad.reveal")}
        </button>
        <p className={cn(TEXT, "text-center text-xs")}>{t("pad.keys")}</p>
      </div>
    </section>
  );
}
