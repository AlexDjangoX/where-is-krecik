"use client";

import { useCallback, useEffect, useReducer } from "react";
import { useTranslations } from "next-intl";

import { toast } from "@/lib/shared/toast";

import {
  createInitialState,
  gameReducer,
} from "@/components/where-is-krecik/lib/game-reducer";
import { formatCoordinate } from "@/components/where-is-krecik/lib/grid";
import type {
  Direction,
  Position,
  SetupTool,
} from "@/components/where-is-krecik/types";
import { DirectionPad } from "@/components/where-is-krecik/components/DirectionPad";
import { KrecikFloatingPanel } from "@/components/where-is-krecik/components/KrecikFloatingPanel";
import { KrecikGrid } from "@/components/where-is-krecik/components/KrecikGrid";
import { RevealPanel } from "@/components/where-is-krecik/components/RevealPanel";
import { SetupPanel } from "@/components/where-is-krecik/components/SetupPanel";

export function WhereIsKrecikGame() {
  const t = useTranslations("where-is-krecik");
  const [state, dispatch] = useReducer(
    gameReducer,
    undefined,
    createInitialState,
  );
  // Each rejected move bumps this counter; grid and pad shake when it changes.
  const shakeKey = state.invalidMoveCount;

  useEffect(() => {
    if (shakeKey === 0) return;
    toast.error(t("toast.invalidTitle"), {
      description: t("toast.invalidDescription"),
      duration: 1500,
    });
  }, [shakeKey, t]);

  const handleCellClick = useCallback(
    (position: Position) => dispatch({ type: "cellClicked", position }),
    [],
  );
  const handleGridSize = useCallback(
    (size: number) => dispatch({ type: "setGridSize", size }),
    [],
  );
  const handleSelectTool = useCallback(
    (tool: SetupTool) => dispatch({ type: "selectTool", tool }),
    [],
  );
  const handleStartRound = useCallback(
    () => dispatch({ type: "startRound" }),
    [],
  );
  const handleMove = useCallback(
    (direction: Direction) => dispatch({ type: "move", direction }),
    [],
  );
  const handleReveal = useCallback(() => dispatch({ type: "reveal" }), []);
  const handleNewRound = useCallback(() => dispatch({ type: "newRound" }), []);
  const handleReplay = useCallback(() => dispatch({ type: "replayRound" }), []);
  const handleReset = useCallback(() => dispatch({ type: "resetGame" }), []);
  const handleToggleShowMole = useCallback(
    () => dispatch({ type: "toggleShowMole" }),
    [],
  );

  const panel = (
    <>
      {state.gamePhase === "setup" ? (
        <SetupPanel
          state={state}
          onGridSizeChange={handleGridSize}
          onSelectTool={handleSelectTool}
          onStartRound={handleStartRound}
          onToggleShowMole={handleToggleShowMole}
        />
      ) : null}
      {state.gamePhase === "playing" ? (
        <DirectionPad
          onMove={handleMove}
          onReveal={handleReveal}
          moveCount={state.moveCount}
          lastMove={state.lastMove}
          shakeKey={shakeKey}
          showMole={state.showMoleDuringPlay}
          onToggleShowMole={handleToggleShowMole}
        />
      ) : null}
      {state.gamePhase === "revealed" && state.currentMolePosition ? (
        <RevealPanel
          position={state.currentMolePosition}
          startingPosition={state.startingPosition}
          moveCount={state.moveCount}
          moveHistory={state.moveHistory}
          onReplayRound={handleReplay}
          onNewRound={handleNewRound}
          onResetGame={handleReset}
        />
      ) : null}
    </>
  );

  return (
    <main
      data-testid="where-is-krecik"
      data-layout="floating"
      data-phase={state.gamePhase}
      className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6 lg:py-10"
    >
      <header className="text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-lime-950 sm:text-4xl dark:text-lime-50">
          {t("page.title")}
        </h1>
        <p className="mt-1.5 text-sm text-lime-900/70 sm:text-base dark:text-lime-100/70">
          {state.gamePhase === "setup" &&
            (state.startingPosition
              ? t("page.setupReady", {
                  coordinate: formatCoordinate(state.startingPosition),
                })
              : t("page.setupEmpty"))}
          {state.gamePhase === "playing" &&
            (state.showMoleDuringPlay
              ? t("page.playingDemo")
              : t("page.playingHidden"))}
          {state.gamePhase === "revealed" && t("page.revealed")}
        </p>
      </header>

      {/* Board is centred; the control panel floats beside it (draggable,
          position remembered) — same classroom layout as lexical-mini. */}
      <KrecikGrid
        state={state}
        onCellClick={handleCellClick}
        shakeKey={shakeKey}
      />

      <KrecikFloatingPanel phase={state.gamePhase}>
        {panel}
      </KrecikFloatingPanel>
    </main>
  );
}
