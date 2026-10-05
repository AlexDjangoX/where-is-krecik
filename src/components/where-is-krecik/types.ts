/**
 * Shared types for the "Where is Krecik?" hidden-mole classroom game.
 *
 * Coordinates are 0-based internally. `row: 0` is the top row (label "1"),
 * `column: 0` is the left column (label "A").
 */

export type Position = {
  row: number;
  column: number;
};

export type Wormhole = {
  entrance: Position;
  destination: Position;
};

export type Direction =
  | "up"
  | "down"
  | "left"
  | "right"
  | "upLeft"
  | "upRight"
  | "downLeft"
  | "downRight";

export type GamePhase = "setup" | "playing" | "revealed";

export type SetupTool =
  "moleStart" | "blocked" | "wormholeEntrance" | "wormholeDestination";

/** Board data that the movement engine needs; a subset of `GameState`. */
export type BoardConfig = {
  gridSize: number;
  blockedCells: readonly Position[];
  wormholes: readonly Wormhole[];
};

export type MoveResult =
  | {
      ok: true;
      direction: Direction;
      /** Position before the move. */
      from: Position;
      /** First open cell reached after leaping over blocked cells. */
      landed: Position;
      /** Present only when `landed` was a wormhole entrance. */
      teleportedTo?: Position;
      /** Authoritative new position of the mole. */
      final: Position;
    }
  | {
      ok: false;
      direction: Direction;
      from: Position;
      reason: "outOfBounds";
    };

export type GameState = {
  gridSize: number;
  gamePhase: GamePhase;
  selectedTool: SetupTool;
  startingPosition: Position | null;
  currentMolePosition: Position | null;
  blockedCells: Position[];
  wormholes: Wormhole[];
  /** Wormhole entrance chosen during setup, awaiting its destination. */
  pendingWormholeEntrance: Position | null;
  /** Result of the most recent move attempt while playing. */
  lastMove: MoveResult | null;
  /** Number of successful moves in the current round. */
  moveCount: number;
  /** Number of rejected (out-of-bounds) moves in the current round; drives UI feedback. */
  invalidMoveCount: number;
  /** Demo toggle: when true the mole stays visible while it moves. */
  showMoleDuringPlay: boolean;
  /** Successful moves of the current (or last revealed) round, in order. */
  moveHistory: Direction[];
};
