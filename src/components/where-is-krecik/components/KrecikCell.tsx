"use client";

import { motion } from "framer-motion";
import { Mountain } from "lucide-react";
import { useTranslations } from "next-intl";

import { cn } from "@/lib/utils";

import { formatCoordinate } from "@/components/where-is-krecik/lib/grid";
import { wormholeColor } from "@/components/where-is-krecik/lib/wormhole-colors";
import type { Position } from "@/components/where-is-krecik/types";
import { KrecikMole } from "@/components/where-is-krecik/components/KrecikMole";
import { WormholeExit } from "@/components/where-is-krecik/components/WormholeExit";
import { WormholeSpiral } from "@/components/where-is-krecik/components/WormholeSpiral";

export type KrecikCellProps = {
  position: Position;
  gridSize: number;
  isBlocked: boolean;
  isStart: boolean;
  isPendingEntrance: boolean;
  /** Index of the wormhole whose entrance is on this cell, if any. */
  entranceOf: number | null;
  /** Destination coordinate label shown on an entrance badge. */
  entranceDestinationLabel: string | null;
  /** Index of the wormhole whose destination is on this cell, if any. */
  destinationOf: number | null;
  showMole: boolean;
  /** "pop": burst out of the hole (reveal / teleport). "slide": glide from the previous hole. */
  moleMotion: MoleMotion;
  /** Changing the key remounts the mole so a "pop" replays. */
  moleKey: string;
  interactive: boolean;
  onClick?: (position: Position) => void;
};

export type MoleMotion = "slide" | "pop";

export function KrecikCell({
  position,
  gridSize,
  isBlocked,
  isStart,
  isPendingEntrance,
  entranceOf,
  entranceDestinationLabel,
  destinationOf,
  showMole,
  moleMotion,
  moleKey,
  interactive,
  onClick,
}: KrecikCellProps) {
  const t = useTranslations("where-is-krecik");
  const moleCelebrating = moleMotion === "pop";
  const coordinate = formatCoordinate(position);
  const compact = gridSize > 6;
  const entranceColor = entranceOf !== null ? wormholeColor(entranceOf) : null;
  const destinationColor =
    destinationOf !== null ? wormholeColor(destinationOf) : null;

  const description = [
    coordinate,
    isBlocked ? t("cell.blocked") : null,
    entranceOf !== null && entranceDestinationLabel !== null
      ? t("cell.wormholeTo", { destination: entranceDestinationLabel })
      : null,
    destinationOf !== null ? t("cell.wormholeExit") : null,
    isStart ? t("cell.startsHere") : null,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <button
      type="button"
      data-testid={`krecik-cell-${coordinate}`}
      data-coordinate={coordinate}
      aria-label={description}
      onClick={interactive && onClick ? () => onClick(position) : undefined}
      tabIndex={interactive ? 0 : -1}
      className={cn(
        "relative aspect-square w-full rounded-xl border border-lime-700/15 bg-linear-to-b from-lime-300 to-lime-400 p-[8%] outline-none transition-transform dark:border-lime-300/10 dark:from-lime-700 dark:to-lime-800",
        interactive &&
          "cursor-pointer hover:scale-[1.03] hover:from-lime-200 hover:to-lime-300 focus-visible:ring-3 focus-visible:ring-amber-400/70 dark:hover:from-lime-600 dark:hover:to-lime-700",
        !interactive && "cursor-default",
        isStart &&
          "ring-3 ring-amber-400 ring-offset-2 ring-offset-lime-50 dark:ring-offset-lime-950",
        isPendingEntrance && "ring-3 ring-dashed ring-violet-500",
        entranceColor && `ring-3 ${entranceColor.ring}`,
        destinationColor &&
          !entranceColor &&
          `ring-3 ring-offset-1 ${destinationColor.ring}`,
      )}
    >
      {/* The hole (a wormhole entrance is a glowing vortex instead of a plain hole) */}
      {!isBlocked ? (
        <span
          aria-hidden
          className={cn(
            "absolute inset-[22%] overflow-hidden rounded-full",
            entranceColor
              ? cn(
                  entranceColor.fill,
                  "shadow-[0_0_14px_2px_rgba(255,255,255,0.35)]",
                )
              : "bg-linear-to-b from-amber-900 to-stone-950 shadow-[inset_0_6px_10px_rgba(0,0,0,0.55)]",
          )}
        >
          {entranceColor ? (
            // Darkens toward the centre so the spiral looks like it sinks into the hole.
            <span className="absolute inset-0 rounded-full bg-[radial-gradient(circle,rgba(0,0,0,0.75)_0%,rgba(0,0,0,0.25)_45%,transparent_75%)]" />
          ) : null}
        </span>
      ) : null}

      {/* Blocked boulder */}
      {isBlocked ? (
        <span
          aria-hidden
          className="absolute inset-[12%] flex items-center justify-center rounded-[40%] bg-linear-to-br from-stone-400 to-stone-600 shadow-md dark:from-stone-500 dark:to-stone-700"
        >
          <Mountain className="h-[55%] w-[55%] text-stone-800/70 dark:text-stone-900" />
        </span>
      ) : null}

      {/* Wormhole entrance: spinning spiral vortex */}
      {entranceColor && !showMole ? (
        <span
          aria-hidden
          data-testid="krecik-wormhole-spiral"
          className="absolute inset-[20%] flex items-center justify-center text-white"
        >
          <WormholeSpiral />
        </span>
      ) : null}

      {/* Wormhole exit: rings ripple out of the hole with a rising arrow, in the wormhole's colour */}
      {destinationColor && !entranceColor && !showMole ? (
        <span
          aria-hidden
          data-testid="krecik-wormhole-exit"
          className={cn(
            "absolute inset-[22%] flex items-center justify-center overflow-hidden rounded-full",
            destinationColor.exit,
          )}
        >
          <WormholeExit />
        </span>
      ) : null}

      {/* Badges */}
      {entranceColor && entranceDestinationLabel && !compact ? (
        <span
          className={cn(
            "absolute -top-1.5 -right-1.5 z-10 rounded-full px-1.5 py-0.5 text-[10px] leading-none font-bold shadow",
            entranceColor.badge,
          )}
        >
          → {entranceDestinationLabel}
        </span>
      ) : null}
      {destinationColor && !compact && !entranceColor ? (
        <span
          className={cn(
            "absolute -top-1.5 -right-1.5 z-10 rounded-full px-1.5 py-0.5 text-[10px] leading-none font-bold shadow",
            destinationColor.badge,
          )}
        >
          exit
        </span>
      ) : null}

      {/* Krecik */}
      {showMole ? (
        <motion.span
          key={moleKey}
          data-testid="krecik-mole"
          data-motion={moleMotion}
          className="absolute inset-[8%] z-20 flex items-end justify-center"
          // Shared layoutId lets Krecik glide from his previous hole to this one.
          layoutId={moleMotion === "slide" ? "krecik-mole" : undefined}
          initial={
            moleMotion === "pop"
              ? { y: "60%", scale: 0.3, opacity: 0 }
              : { opacity: 0 }
          }
          animate={{ y: "0%", scale: 1, opacity: 1 }}
          transition={
            moleMotion === "pop"
              ? { type: "spring", stiffness: 260, damping: 14, mass: 0.9 }
              : {
                  type: "spring",
                  stiffness: 320,
                  damping: 26,
                  opacity: { duration: 0.15 },
                }
          }
        >
          <KrecikMole celebrating={moleCelebrating} />
        </motion.span>
      ) : null}

      {/* Coordinate hint */}
      {!compact ? (
        <span
          aria-hidden
          className="absolute bottom-1 left-1.5 text-[10px] font-semibold text-lime-900/60 dark:text-lime-100/60"
        >
          {coordinate}
        </span>
      ) : null}
    </button>
  );
}
