import type { Direction, Position } from "@/components/where-is-krecik/types";

export const MIN_GRID_SIZE = 3;
export const MAX_GRID_SIZE = 10;
export const DEFAULT_GRID_SIZE = 3;

const COLUMN_LETTERS = "ABCDEFGHIJ";

export const ALL_DIRECTIONS: readonly Direction[] = [
  "up",
  "down",
  "left",
  "right",
  "upLeft",
  "upRight",
  "downLeft",
  "downRight",
];

/** Row/column delta applied for a single step in each direction. */
export const DIRECTION_DELTAS: Record<Direction, Position> = {
  up: { row: -1, column: 0 },
  down: { row: 1, column: 0 },
  left: { row: 0, column: -1 },
  right: { row: 0, column: 1 },
  upLeft: { row: -1, column: -1 },
  upRight: { row: -1, column: 1 },
  downLeft: { row: 1, column: -1 },
  downRight: { row: 1, column: 1 },
};

export const OPPOSITE_DIRECTION: Record<Direction, Direction> = {
  up: "down",
  down: "up",
  left: "right",
  right: "left",
  upLeft: "downRight",
  upRight: "downLeft",
  downLeft: "upRight",
  downRight: "upLeft",
};

export function clampGridSize(size: number): number {
  if (!Number.isFinite(size)) return DEFAULT_GRID_SIZE;
  const rounded = Math.round(size);
  return Math.min(MAX_GRID_SIZE, Math.max(MIN_GRID_SIZE, rounded));
}

/** 0 → "A", 9 → "J". */
export function columnLabel(columnIndex: number): string {
  return COLUMN_LETTERS.charAt(columnIndex);
}

/** 0 → "1", 9 → "10". */
export function rowLabel(rowIndex: number): string {
  return String(rowIndex + 1);
}

/** `{ row: 3, column: 3 }` → "D4". */
export function formatCoordinate(position: Position): string {
  return `${columnLabel(position.column)}${rowLabel(position.row)}`;
}

/**
 * "D4" → `{ row: 3, column: 3 }`. Returns `null` for anything that is not a
 * letter A–J followed by a number 1–10.
 */
export function parseCoordinate(coordinate: string): Position | null {
  const match = /^([A-J])(10|[1-9])$/.exec(coordinate.trim().toUpperCase());
  if (!match) return null;
  return {
    column: COLUMN_LETTERS.indexOf(match[1]),
    row: Number(match[2]) - 1,
  };
}

export function positionsEqual(a: Position, b: Position): boolean {
  return a.row === b.row && a.column === b.column;
}

export function isInsideGrid(position: Position, gridSize: number): boolean {
  return (
    position.row >= 0 &&
    position.row < gridSize &&
    position.column >= 0 &&
    position.column < gridSize
  );
}

export function stepInDirection(
  position: Position,
  direction: Direction,
): Position {
  const delta = DIRECTION_DELTAS[direction];
  return {
    row: position.row + delta.row,
    column: position.column + delta.column,
  };
}

export function containsPosition(
  positions: readonly Position[],
  position: Position,
): boolean {
  return positions.some((candidate) => positionsEqual(candidate, position));
}

/** Centre cell of the grid (B2 on 3×3, E5 on 10×10): Krecik's default start. */
export function centrePosition(gridSize: number): Position {
  const middle = Math.floor((gridSize - 1) / 2);
  return { row: middle, column: middle };
}

/** Every cell of an `n × n` grid in reading order (row by row). */
export function allPositions(gridSize: number): Position[] {
  const positions: Position[] = [];
  for (let row = 0; row < gridSize; row += 1) {
    for (let column = 0; column < gridSize; column += 1) {
      positions.push({ row, column });
    }
  }
  return positions;
}
