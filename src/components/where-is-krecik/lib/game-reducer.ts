import type {
  Direction,
  GameState,
  Position,
  SetupTool,
  Wormhole,
} from "@/components/where-is-krecik/types";
import {
  allPositions,
  centrePosition,
  clampGridSize,
  containsPosition,
  DEFAULT_GRID_SIZE,
  isInsideGrid,
  positionsEqual,
} from "@/components/where-is-krecik/lib/grid";
import {
  findWormholeAt,
  resolveMove,
} from "@/components/where-is-krecik/lib/movement";

export type GameAction =
  | { type: "setGridSize"; size: number }
  | { type: "selectTool"; tool: SetupTool }
  | { type: "cellClicked"; position: Position }
  | { type: "startRound" }
  | { type: "move"; direction: Direction }
  | { type: "reveal" }
  | { type: "newRound" }
  | { type: "replayRound" }
  | { type: "toggleShowMole" }
  | { type: "resetGame" };

/**
 * Krecik always has a start so the teacher can begin a round at any point during
 * setup: the centre cell, or failing that the first cell in reading order that
 * is neither a rock nor a wormhole entrance.
 */
export function defaultStartPosition(
  gridSize: number,
  blockedCells: readonly Position[],
  wormholes: readonly Wormhole[],
): Position | null {
  const isFree = (position: Position) =>
    !containsPosition(blockedCells, position) &&
    findWormholeAt(wormholes, position) === undefined;
  const centre = centrePosition(gridSize);
  if (isFree(centre)) return centre;
  return allPositions(gridSize).find(isFree) ?? null;
}

export function createInitialState(): GameState {
  const start = centrePosition(DEFAULT_GRID_SIZE);
  return {
    gridSize: DEFAULT_GRID_SIZE,
    gamePhase: "setup",
    selectedTool: "moleStart",
    startingPosition: start,
    currentMolePosition: { ...start },
    blockedCells: [],
    wormholes: [],
    pendingWormholeEntrance: null,
    lastMove: null,
    moveCount: 0,
    invalidMoveCount: 0,
    showMoleDuringPlay: false,
    moveHistory: [],
  };
}

function isWormholeEntrance(state: GameState, position: Position): boolean {
  return findWormholeAt(state.wormholes, position) !== undefined;
}

function isStart(state: GameState, position: Position): boolean {
  return (
    state.startingPosition !== null &&
    positionsEqual(state.startingPosition, position)
  );
}

function isBlocked(state: GameState, position: Position): boolean {
  return containsPosition(state.blockedCells, position);
}

function removeWormholeAt(
  wormholes: readonly Wormhole[],
  entrance: Position,
): Wormhole[] {
  return wormholes.filter(
    (wormhole) => !positionsEqual(wormhole.entrance, entrance),
  );
}

function handleCellClicked(state: GameState, position: Position): GameState {
  if (!isInsideGrid(position, state.gridSize)) return state;

  switch (state.selectedTool) {
    case "moleStart": {
      if (isBlocked(state, position) || isWormholeEntrance(state, position)) {
        return state;
      }
      return {
        ...state,
        startingPosition: { ...position },
        currentMolePosition: { ...position },
      };
    }

    case "blocked": {
      if (isBlocked(state, position)) {
        return {
          ...state,
          blockedCells: state.blockedCells.filter(
            (cell) => !positionsEqual(cell, position),
          ),
        };
      }
      if (isStart(state, position) || isWormholeEntrance(state, position)) {
        return state;
      }
      return {
        ...state,
        blockedCells: [...state.blockedCells, { ...position }],
      };
    }

    case "wormholeEntrance": {
      if (isWormholeEntrance(state, position)) {
        return {
          ...state,
          wormholes: removeWormholeAt(state.wormholes, position),
          pendingWormholeEntrance: null,
        };
      }
      if (isBlocked(state, position) || isStart(state, position)) {
        return state;
      }
      return {
        ...state,
        pendingWormholeEntrance: { ...position },
        selectedTool: "wormholeDestination",
      };
    }

    case "wormholeDestination": {
      const pending = state.pendingWormholeEntrance;
      if (pending === null) {
        if (isWormholeEntrance(state, position)) {
          return {
            ...state,
            wormholes: removeWormholeAt(state.wormholes, position),
          };
        }
        return state;
      }
      // The exit may be any cell on the board except the entrance itself.
      if (positionsEqual(pending, position)) {
        return state;
      }
      return {
        ...state,
        wormholes: [
          ...state.wormholes,
          { entrance: { ...pending }, destination: { ...position } },
        ],
        pendingWormholeEntrance: null,
        selectedTool: "wormholeEntrance",
      };
    }
  }
}

function handleSetGridSize(state: GameState, size: number): GameState {
  const gridSize = clampGridSize(size);
  if (gridSize === state.gridSize) return state;

  const inside = (position: Position) => isInsideGrid(position, gridSize);
  const blockedCells = state.blockedCells.filter(inside);
  const wormholes = state.wormholes.filter(
    (wormhole) => inside(wormhole.entrance) && inside(wormhole.destination),
  );
  const startingPosition =
    state.startingPosition && inside(state.startingPosition)
      ? state.startingPosition
      : defaultStartPosition(gridSize, blockedCells, wormholes);

  return {
    ...state,
    gridSize,
    startingPosition,
    currentMolePosition: startingPosition ? { ...startingPosition } : null,
    blockedCells,
    wormholes,
    pendingWormholeEntrance: null,
    selectedTool:
      state.selectedTool === "wormholeDestination"
        ? "wormholeEntrance"
        : state.selectedTool,
  };
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "setGridSize":
      if (state.gamePhase !== "setup") return state;
      return handleSetGridSize(state, action.size);

    case "selectTool": {
      if (state.gamePhase !== "setup") return state;
      if (action.tool === state.selectedTool) return state;
      return {
        ...state,
        selectedTool: action.tool,
        pendingWormholeEntrance:
          action.tool === "wormholeDestination"
            ? state.pendingWormholeEntrance
            : null,
      };
    }

    case "cellClicked":
      if (state.gamePhase !== "setup") return state;
      return handleCellClicked(state, action.position);

    case "startRound": {
      if (state.gamePhase !== "setup") return state;
      if (state.startingPosition === null) return state;
      return {
        ...state,
        gamePhase: "playing",
        currentMolePosition: { ...state.startingPosition },
        pendingWormholeEntrance: null,
        lastMove: null,
        moveCount: 0,
        invalidMoveCount: 0,
        moveHistory: [],
      };
    }

    case "move": {
      if (state.gamePhase !== "playing") return state;
      if (state.currentMolePosition === null) return state;
      const result = resolveMove(
        state,
        state.currentMolePosition,
        action.direction,
      );
      if (!result.ok) {
        return {
          ...state,
          lastMove: result,
          invalidMoveCount: state.invalidMoveCount + 1,
        };
      }
      return {
        ...state,
        currentMolePosition: { ...result.final },
        lastMove: result,
        moveCount: state.moveCount + 1,
        moveHistory: [...state.moveHistory, action.direction],
      };
    }

    case "reveal":
      if (state.gamePhase !== "playing") return state;
      return { ...state, gamePhase: "revealed" };

    case "newRound": {
      if (state.gamePhase === "setup") return state;
      // Keep the previous start (a round cannot be running without one) so the
      // next round can begin straight away; the teacher may still click a
      // different hole.
      return {
        ...state,
        gamePhase: "setup",
        selectedTool: "moleStart",
        currentMolePosition: state.startingPosition,
        pendingWormholeEntrance: null,
        lastMove: null,
        moveCount: 0,
        invalidMoveCount: 0,
        moveHistory: [],
      };
    }

    case "replayRound": {
      // Same board, same start: straight back into play so the teacher can
      // run the identical round again (e.g. with the demo toggle on).
      if (state.gamePhase !== "revealed") return state;
      return {
        ...state,
        gamePhase: "playing",
        currentMolePosition: state.startingPosition,
        lastMove: null,
        moveCount: 0,
        invalidMoveCount: 0,
        moveHistory: [],
      };
    }

    case "toggleShowMole":
      return { ...state, showMoleDuringPlay: !state.showMoleDuringPlay };

    case "resetGame":
      return createInitialState();
  }
}
