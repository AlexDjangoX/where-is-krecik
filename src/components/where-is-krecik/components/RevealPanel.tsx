"use client";

import { motion } from "framer-motion";
import { Repeat, RotateCcw, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import Confetti from "react-confetti";

import useWindowSize from "@/hooks/useWindowSize";
import { cn } from "@/lib/utils";

import { formatCoordinate } from "@/components/where-is-krecik/lib/grid";
import type { Direction, Position } from "@/components/where-is-krecik/types";
import {
  DirectionArrow,
  useDirectionLabels,
} from "@/components/where-is-krecik/components/DirectionArrow";
import {
  BUTTON_EMERALD,
  BUTTON_QUIET,
  CELL,
  PANEL,
  SOLID_BUTTON,
  TEXT,
} from "@/components/where-is-krecik/components/panel-styles";

type RevealPanelProps = {
  position: Position;
  startingPosition: Position | null;
  moveCount: number;
  moveHistory: readonly Direction[];
  onReplayRound: () => void;
  onNewRound: () => void;
  onResetGame: () => void;
};

export function RevealPanel({
  position,
  startingPosition,
  moveCount,
  moveHistory,
  onReplayRound,
  onNewRound,
  onResetGame,
}: RevealPanelProps) {
  const t = useTranslations("where-is-krecik");
  const directionLabels = useDirectionLabels();
  const { width, height } = useWindowSize();
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => setShowConfetti(false), 5000);
    return () => window.clearTimeout(timer);
  }, []);

  const coordinate = formatCoordinate(position);

  return (
    <section
      data-testid="krecik-reveal-panel"
      className={cn(PANEL, "items-center text-center")}
    >
      {showConfetti && width > 0 ? (
        <Confetti
          width={width}
          height={height}
          recycle={false}
          numberOfPieces={400}
          style={{ position: "fixed", inset: 0, pointerEvents: "none" }}
        />
      ) : null}

      <motion.div
        initial={{ scale: 0.6, opacity: 0, rotate: -6 }}
        animate={{ scale: 1, opacity: 1, rotate: 0 }}
        transition={{
          type: "spring",
          stiffness: 220,
          damping: 12,
          delay: 0.25,
        }}
        className={cn(
          CELL,
          "flex w-full flex-col items-center gap-1 px-4 py-5",
        )}
      >
        <p className={cn(TEXT, "text-xs font-medium tracking-wide uppercase")}>
          {t("reveal.wasAt")}
        </p>
        <p
          data-testid="krecik-reveal-coordinate"
          className="text-6xl font-semibold tracking-tight text-lime-800 tabular-nums sm:text-7xl dark:text-lime-200"
        >
          {coordinate}!
        </p>
        <p className={TEXT}>
          {startingPosition
            ? t("reveal.startedAt", {
                coordinate: formatCoordinate(startingPosition),
                moves: t("reveal.moves", { count: moveCount }),
              })
            : t("reveal.moves", { count: moveCount })}
        </p>
      </motion.div>

      {moveHistory.length > 0 ? (
        <div
          data-testid="krecik-move-history"
          className={cn(
            CELL,
            "flex w-full flex-col items-center gap-2 px-3 py-3",
          )}
        >
          <span
            className={cn(TEXT, "text-xs font-medium tracking-wide uppercase")}
          >
            {t("reveal.path")}
          </span>
          <ol
            aria-label={moveHistory.map((d) => directionLabels[d]).join(", ")}
            className="flex flex-wrap justify-center gap-1.5"
          >
            {moveHistory.map((direction, index) => (
              <li
                key={`${direction}-${index}`}
                title={directionLabels[direction]}
                className="flex size-8 items-center justify-center rounded-lg bg-lime-600 text-white dark:bg-lime-500"
              >
                <DirectionArrow direction={direction} className="size-5" />
              </li>
            ))}
          </ol>
        </div>
      ) : null}

      <div className="mt-auto flex w-full flex-col gap-2">
        <button
          type="button"
          data-testid="krecik-replay-round"
          onClick={onReplayRound}
          className={cn(SOLID_BUTTON, BUTTON_EMERALD, "h-11 w-full")}
        >
          <Repeat className="size-4" />
          {t("reveal.replay")}
        </button>
        <div className="grid w-full grid-cols-2 gap-2">
          <button
            type="button"
            data-testid="krecik-new-round"
            onClick={onNewRound}
            className={cn(
              SOLID_BUTTON,
              BUTTON_QUIET,
              "h-11 text-sm font-medium",
            )}
          >
            <Sparkles className="size-4" />
            {t("reveal.newRound")}
          </button>
          <button
            type="button"
            data-testid="krecik-reset-game"
            onClick={onResetGame}
            className={cn(
              SOLID_BUTTON,
              BUTTON_QUIET,
              "h-11 text-sm font-medium",
            )}
          >
            <RotateCcw className="size-4" />
            {t("reveal.newGame")}
          </button>
        </div>
        <p className={cn(TEXT, "text-xs leading-relaxed")}>
          {t("reveal.help", {
            start: startingPosition
              ? formatCoordinate(startingPosition)
              : t("reveal.theStart"),
          })}
        </p>
      </div>
    </section>
  );
}
