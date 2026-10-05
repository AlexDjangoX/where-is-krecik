"use client";

import { LayoutGroup, motion, useAnimation } from "framer-motion";
import { useEffect, useMemo } from "react";

import { cn } from "@/lib/utils";

import {
  columnLabel,
  containsPosition,
  formatCoordinate,
  positionsEqual,
  rowLabel,
} from "@/components/where-is-krecik/lib/grid";
import type { GameState, Position } from "@/components/where-is-krecik/types";
import {
  KrecikCell,
  type MoleMotion,
} from "@/components/where-is-krecik/components/KrecikCell";

type KrecikGridProps = {
  state: GameState;
  onCellClick: (position: Position) => void;
  /** Increment to trigger a shake (invalid move feedback). */
  shakeKey: number;
};

/**
 * Decides whether the mole is drawn and how it should animate into its cell:
 * - hidden while playing unless the demo toggle is on;
 * - "pop" out of the hole on reveal and after a wormhole teleport;
 * - "slide" between holes otherwise (setup start changes, visible moves).
 */
function resolveMoleMotion(state: GameState): {
  visible: boolean;
  motion: MoleMotion;
  key: string;
} {
  const {
    gamePhase,
    currentMolePosition,
    showMoleDuringPlay,
    lastMove,
    moveCount,
  } = state;
  if (currentMolePosition === null) {
    return { visible: false, motion: "slide", key: "mole" };
  }
  if (gamePhase === "revealed") {
    return { visible: true, motion: "pop", key: "revealed" };
  }
  if (gamePhase === "playing") {
    if (!showMoleDuringPlay)
      return { visible: false, motion: "slide", key: "mole" };
    const teleported =
      lastMove !== null && lastMove.ok && lastMove.teleportedTo !== undefined;
    return teleported
      ? { visible: true, motion: "pop", key: `teleport-${moveCount}` }
      : { visible: true, motion: "slide", key: "mole" };
  }
  return { visible: true, motion: "slide", key: "mole" };
}

export function KrecikGrid({ state, onCellClick, shakeKey }: KrecikGridProps) {
  const {
    gridSize,
    gamePhase,
    blockedCells,
    wormholes,
    startingPosition,
    currentMolePosition,
    pendingWormholeEntrance,
  } = state;

  const interactive = gamePhase === "setup";
  const mole = resolveMoleMotion(state);

  const rows = useMemo(
    () => Array.from({ length: gridSize }, (_, index) => index),
    [gridSize],
  );

  const shakeControls = useAnimation();
  useEffect(() => {
    if (shakeKey === 0) return;
    void shakeControls.start({
      x: [0, -10, 10, -8, 8, -4, 4, 0],
      transition: { duration: 0.45 },
    });
  }, [shakeKey, shakeControls]);

  return (
    <motion.div
      data-testid="krecik-grid"
      data-phase={gamePhase}
      data-mole-visible={mole.visible}
      animate={shakeControls}
      className="mx-auto w-full max-w-[min(92vw,680px)] rounded-2xl border border-lime-300/70 bg-lime-50 p-3 shadow-sm sm:p-4 dark:border-lime-500/20 dark:bg-lime-950/50"
    >
      <LayoutGroup id="krecik-grid">
        <div
          className="grid gap-1.5 sm:gap-2"
          style={{
            gridTemplateColumns: `minmax(1.5rem,auto) repeat(${gridSize}, minmax(0, 1fr))`,
          }}
        >
          {/* top-left corner spacer */}
          <div />
          {rows.map((column) => (
            <div
              key={`col-${column}`}
              className={cn(
                "flex items-end justify-center pb-1 font-medium text-lime-900/70 dark:text-lime-100/70",
                gridSize > 6 ? "text-xs" : "text-sm",
              )}
            >
              {columnLabel(column)}
            </div>
          ))}

          {rows.map((row) => (
            <RowCells
              key={`row-${row}`}
              row={row}
              columns={rows}
              gridSize={gridSize}
              blockedCells={blockedCells}
              wormholes={wormholes}
              startingPosition={startingPosition}
              currentMolePosition={currentMolePosition}
              pendingWormholeEntrance={pendingWormholeEntrance}
              moleVisible={mole.visible}
              moleMotion={mole.motion}
              moleKey={mole.key}
              interactive={interactive}
              onCellClick={onCellClick}
            />
          ))}
        </div>
      </LayoutGroup>
    </motion.div>
  );
}

type RowCellsProps = {
  row: number;
  columns: number[];
  gridSize: number;
  blockedCells: Position[];
  wormholes: GameState["wormholes"];
  startingPosition: Position | null;
  currentMolePosition: Position | null;
  pendingWormholeEntrance: Position | null;
  moleVisible: boolean;
  moleMotion: MoleMotion;
  moleKey: string;
  interactive: boolean;
  onCellClick: (position: Position) => void;
};

function RowCells({
  row,
  columns,
  gridSize,
  blockedCells,
  wormholes,
  startingPosition,
  currentMolePosition,
  pendingWormholeEntrance,
  moleVisible,
  moleMotion,
  moleKey,
  interactive,
  onCellClick,
}: RowCellsProps) {
  return (
    <>
      <div
        className={cn(
          "flex items-center justify-center pr-1 font-medium text-lime-900/70 dark:text-lime-100/70",
          gridSize > 6 ? "text-xs" : "text-sm",
        )}
      >
        {rowLabel(row)}
      </div>
      {columns.map((column) => {
        const position = { row, column };
        const entranceIndex = wormholes.findIndex((wormhole) =>
          positionsEqual(wormhole.entrance, position),
        );
        const destinationIndex = wormholes.findIndex((wormhole) =>
          positionsEqual(wormhole.destination, position),
        );
        const isMoleHere =
          moleVisible &&
          currentMolePosition !== null &&
          positionsEqual(currentMolePosition, position);

        return (
          <KrecikCell
            key={formatCoordinate(position)}
            position={position}
            gridSize={gridSize}
            isBlocked={containsPosition(blockedCells, position)}
            isStart={
              startingPosition !== null &&
              positionsEqual(startingPosition, position)
            }
            isPendingEntrance={
              pendingWormholeEntrance !== null &&
              positionsEqual(pendingWormholeEntrance, position)
            }
            entranceOf={entranceIndex === -1 ? null : entranceIndex}
            entranceDestinationLabel={
              entranceIndex === -1
                ? null
                : formatCoordinate(wormholes[entranceIndex].destination)
            }
            destinationOf={destinationIndex === -1 ? null : destinationIndex}
            showMole={isMoleHere}
            moleMotion={moleMotion}
            moleKey={moleKey}
            interactive={interactive}
            onClick={onCellClick}
          />
        );
      })}
    </>
  );
}
