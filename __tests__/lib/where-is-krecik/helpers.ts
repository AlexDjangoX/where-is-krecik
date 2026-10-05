/**
 * Shared helpers for the Where is Krecik test-suite.
 *
 * `pos("D4")` / `wormhole("C3", "F6")` let tests read like the spec.
 * `mulberry32` is a tiny seeded PRNG so randomised tests are reproducible.
 */
import type {
  BoardConfig,
  Direction,
  Position,
  Wormhole,
} from "@/components/where-is-krecik/types";

const LETTERS = "ABCDEFGHIJ";

export function pos(coordinate: string): Position {
  const match = /^([A-J])(10|[1-9])$/.exec(coordinate);
  if (!match) throw new Error(`Bad coordinate in test: ${coordinate}`);
  return { column: LETTERS.indexOf(match[1]), row: Number(match[2]) - 1 };
}

export function coord(position: Position): string {
  return `${LETTERS[position.column]}${position.row + 1}`;
}

export function wormhole(entrance: string, destination: string): Wormhole {
  return { entrance: pos(entrance), destination: pos(destination) };
}

export function board(
  gridSize: number,
  options: { blocked?: string[]; wormholes?: Wormhole[] } = {},
): BoardConfig {
  return {
    gridSize,
    blockedCells: (options.blocked ?? []).map(pos),
    wormholes: options.wormholes ?? [],
  };
}

export const DIRECTIONS: readonly Direction[] = [
  "up",
  "down",
  "left",
  "right",
  "upLeft",
  "upRight",
  "downLeft",
  "downRight",
];

export function samePos(a: Position, b: Position): boolean {
  return a.row === b.row && a.column === b.column;
}

export function cellsOf(gridSize: number): Position[] {
  const cells: Position[] = [];
  for (let row = 0; row < gridSize; row += 1) {
    for (let column = 0; column < gridSize; column += 1) {
      cells.push({ row, column });
    }
  }
  return cells;
}

/** Seeded 32-bit PRNG (mulberry32). Returns floats in [0, 1). */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function randomInt(
  rng: () => number,
  minInclusive: number,
  maxInclusive: number,
): number {
  return minInclusive + Math.floor(rng() * (maxInclusive - minInclusive + 1));
}

export function pick<T>(rng: () => number, items: readonly T[]): T {
  return items[Math.floor(rng() * items.length)];
}

function shuffle<T>(rng: () => number, items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export type RandomBoard = {
  board: BoardConfig;
  start: Position;
};

/**
 * Generates a valid random board: blocked cells (0-40%), 0-6 wormholes with
 * disjoint entrances whose destinations are open, non-entrance cells, and an
 * open, non-entrance starting position.
 */
export function randomBoard(rng: () => number): RandomBoard {
  const gridSize = randomInt(rng, 3, 10);
  const cells = shuffle(rng, cellsOf(gridSize));
  const total = cells.length;

  const blockedCount = Math.floor(rng() * 0.4 * total);
  const blocked = cells.slice(0, blockedCount);
  const open = cells.slice(blockedCount);

  const wormholeCount = Math.min(
    randomInt(rng, 0, 6),
    Math.floor((open.length - 1) / 2),
  );
  const entrances = open.slice(0, wormholeCount);
  const nonEntrances = open.slice(wormholeCount);
  const wormholes: Wormhole[] = entrances.map((entrance) => ({
    entrance,
    destination: pick(rng, nonEntrances),
  }));

  const start = pick(rng, nonEntrances);

  return {
    board: { gridSize, blockedCells: blocked, wormholes },
    start,
  };
}

export function randomDirections(
  rng: () => number,
  count: number,
): Direction[] {
  return Array.from({ length: count }, () => pick(rng, DIRECTIONS));
}

/** Deep-freezes an object graph so any mutation throws in strict mode. */
export function deepFreeze<T>(value: T): T {
  if (value !== null && typeof value === "object" && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const key of Object.keys(value as object)) {
      deepFreeze((value as Record<string, unknown>)[key]);
    }
  }
  return value;
}
