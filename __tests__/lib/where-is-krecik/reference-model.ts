/**
 * Independent, deliberately naive reference implementation of the movement
 * rules. It shares NO code with `src/components/where-is-krecik/lib/movement.ts`:
 * it materialises the whole board as a matrix of cell kinds and walks it one
 * cell at a time using explicit per-direction arithmetic.
 *
 * Tests compare the production engine against this model. A bug would have to
 * appear identically in both, differently-structured, implementations to slip
 * through.
 */
import type {
  BoardConfig,
  Direction,
  MoveResult,
  Position,
} from "@/components/where-is-krecik/types";

type CellKind =
  | { kind: "open" }
  | { kind: "blocked" }
  | { kind: "entrance"; destination: Position };

function buildMatrix(board: BoardConfig): CellKind[][] {
  const matrix: CellKind[][] = [];
  for (let r = 0; r < board.gridSize; r += 1) {
    const row: CellKind[] = [];
    for (let c = 0; c < board.gridSize; c += 1) {
      row.push({ kind: "open" });
    }
    matrix.push(row);
  }
  for (const blocked of board.blockedCells) {
    matrix[blocked.row][blocked.column] = { kind: "blocked" };
  }
  for (const wormhole of board.wormholes) {
    matrix[wormhole.entrance.row][wormhole.entrance.column] = {
      kind: "entrance",
      destination: {
        row: wormhole.destination.row,
        column: wormhole.destination.column,
      },
    };
  }
  return matrix;
}

function rowChange(direction: Direction): number {
  switch (direction) {
    case "up":
    case "upLeft":
    case "upRight":
      return -1;
    case "down":
    case "downLeft":
    case "downRight":
      return 1;
    default:
      return 0;
  }
}

function columnChange(direction: Direction): number {
  switch (direction) {
    case "left":
    case "upLeft":
    case "downLeft":
      return -1;
    case "right":
    case "upRight":
    case "downRight":
      return 1;
    default:
      return 0;
  }
}

export function referenceResolveMove(
  board: BoardConfig,
  from: Position,
  direction: Direction,
): MoveResult {
  const matrix = buildMatrix(board);
  const n = board.gridSize;
  const dr = rowChange(direction);
  const dc = columnChange(direction);

  // Walk at most n steps; the board cannot be wider than that.
  for (let distance = 1; distance <= n; distance += 1) {
    const r = from.row + dr * distance;
    const c = from.column + dc * distance;
    const outside = r < 0 || c < 0 || r >= n || c >= n;
    if (outside) {
      return { ok: false, direction, from, reason: "outOfBounds" };
    }
    const cell = matrix[r][c];
    if (cell.kind === "blocked") {
      continue;
    }
    const landed = { row: r, column: c };
    if (cell.kind === "entrance") {
      return {
        ok: true,
        direction,
        from,
        landed,
        teleportedTo: { ...cell.destination },
        final: { ...cell.destination },
      };
    }
    return { ok: true, direction, from, landed, final: { ...landed } };
  }

  return { ok: false, direction, from, reason: "outOfBounds" };
}
