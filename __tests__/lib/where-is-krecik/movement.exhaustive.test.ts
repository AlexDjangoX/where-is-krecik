/**
 * Exhaustive enumeration of the movement engine over input spaces that are
 * small enough to cover completely. No randomness here.
 */
import { describe, expect, it } from "vitest";

import {
  DIRECTION_DELTAS,
  isInsideGrid,
} from "@/components/where-is-krecik/lib/grid";
import { resolveMove } from "@/components/where-is-krecik/lib/movement";
import type {
  BoardConfig,
  Direction,
  Position,
} from "@/components/where-is-krecik/types";

import { cellsOf, coord, DIRECTIONS, samePos } from "./helpers";
import { referenceResolveMove } from "./reference-model";

/** Hot-loop comparison: cheap equality first, vitest's rich diff only on failure. */
function expectMatchesReference(
  config: BoardConfig,
  from: Position,
  direction: Direction,
) {
  const actual = resolveMove(config, from, direction);
  const expected = referenceResolveMove(config, from, direction);
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    expect(
      actual,
      `${coord(from)} ${direction} on ${JSON.stringify(config)}`,
    ).toEqual(expected);
  }
  return actual;
}

function check(condition: boolean, message: () => string): void {
  if (!condition) expect.fail(message());
}

describe("obstacle-free boards: every direction from every cell, sizes 3..10", () => {
  it("moves exactly one step or is rejected at the edge; never wraps", () => {
    let cases = 0;
    for (let n = 3; n <= 10; n += 1) {
      const config: BoardConfig = {
        gridSize: n,
        blockedCells: [],
        wormholes: [],
      };
      for (const from of cellsOf(n)) {
        for (const direction of DIRECTIONS) {
          cases += 1;
          const delta = DIRECTION_DELTAS[direction];
          const expected = {
            row: from.row + delta.row,
            column: from.column + delta.column,
          };
          const result = resolveMove(config, from, direction);

          if (isInsideGrid(expected, n)) {
            expect(result).toEqual({
              ok: true,
              direction,
              from,
              landed: expected,
              final: expected,
            });
          } else {
            expect(result).toEqual({
              ok: false,
              direction,
              from,
              reason: "outOfBounds",
            });
          }

          if (result.ok) {
            // No wrap: the change in each axis is at most 1.
            expect(Math.abs(result.final.row - from.row)).toBeLessThanOrEqual(
              1,
            );
            expect(
              Math.abs(result.final.column - from.column),
            ).toBeLessThanOrEqual(1);
          }
        }
      }
    }
    expect(cases).toBe(8 * (9 + 16 + 25 + 36 + 49 + 64 + 81 + 100));
  });
});

describe("every single blocked-cell placement on 3×3, 4×4 and 5×5", () => {
  for (const n of [3, 4, 5]) {
    it(`agrees with the reference model on a ${n}×${n} board`, () => {
      const cells = cellsOf(n);
      let cases = 0;
      for (const blocked of cells) {
        const config: BoardConfig = {
          gridSize: n,
          blockedCells: [blocked],
          wormholes: [],
        };
        for (const from of cells) {
          if (samePos(from, blocked)) continue;
          for (const direction of DIRECTIONS) {
            cases += 1;
            const result = expectMatchesReference(config, from, direction);
            if (result.ok) {
              check(
                !samePos(result.final, blocked),
                () =>
                  `${coord(from)} ${direction} landed on rock ${coord(blocked)}`,
              );
            }
          }
        }
      }
      expect(cases).toBe(n * n * (n * n - 1) * 8);
    });
  }
});

describe("every pair of blocked cells on a 4×4 board", () => {
  it("agrees with the reference model and never lands on a rock", () => {
    const n = 4;
    const cells = cellsOf(n);
    let cases = 0;
    for (let i = 0; i < cells.length; i += 1) {
      for (let j = i + 1; j < cells.length; j += 1) {
        const config: BoardConfig = {
          gridSize: n,
          blockedCells: [cells[i], cells[j]],
          wormholes: [],
        };
        for (const from of cells) {
          if (samePos(from, cells[i]) || samePos(from, cells[j])) continue;
          for (const direction of DIRECTIONS) {
            cases += 1;
            const result = expectMatchesReference(config, from, direction);
            if (result.ok) {
              check(
                !samePos(result.final, cells[i]) &&
                  !samePos(result.final, cells[j]),
                () => `${coord(from)} ${direction} landed on a rock`,
              );
            }
          }
        }
      }
    }
    expect(cases).toBe(120 * 14 * 8);
  });
});

describe("every single wormhole placement on 3×3 and 4×4", () => {
  for (const n of [3, 4]) {
    it(`agrees with the reference model on a ${n}×${n} board`, () => {
      const cells = cellsOf(n);
      let cases = 0;
      for (const entrance of cells) {
        for (const destination of cells) {
          if (samePos(entrance, destination)) continue;
          const config: BoardConfig = {
            gridSize: n,
            blockedCells: [],
            wormholes: [{ entrance, destination }],
          };
          for (const from of cells) {
            if (samePos(from, entrance)) continue;
            for (const direction of DIRECTIONS) {
              cases += 1;
              const result = expectMatchesReference(config, from, direction);
              if (result.ok) {
                const label = () =>
                  `${coord(from)} ${direction} wormhole ${coord(entrance)}→${coord(destination)}`;
                check(
                  !samePos(result.final, entrance),
                  () => `${label()}: final on entrance`,
                );
                if (samePos(result.landed, entrance)) {
                  check(
                    result.teleportedTo !== undefined &&
                      samePos(result.teleportedTo, destination) &&
                      samePos(result.final, destination),
                    () => `${label()}: teleport missing or wrong`,
                  );
                } else {
                  check(
                    result.teleportedTo === undefined &&
                      samePos(result.final, result.landed),
                    () => `${label()}: unexpected teleport`,
                  );
                }
              }
            }
          }
        }
      }
      const c = n * n;
      expect(cases).toBe(c * (c - 1) * (c - 1) * 8);
    });
  }
});

describe("one blocked cell plus one wormhole on a 4×4 board", () => {
  it("agrees with the reference model for every distinct placement", () => {
    const n = 4;
    const cells = cellsOf(n);
    let cases = 0;
    for (const blocked of cells) {
      for (const entrance of cells) {
        if (samePos(entrance, blocked)) continue;
        for (const destination of cells) {
          if (samePos(destination, blocked) || samePos(destination, entrance))
            continue;
          const config: BoardConfig = {
            gridSize: n,
            blockedCells: [blocked],
            wormholes: [{ entrance, destination }],
          };
          for (const from of cells) {
            if (samePos(from, blocked) || samePos(from, entrance)) continue;
            for (const direction of DIRECTIONS) {
              cases += 1;
              expectMatchesReference(config, from, direction);
            }
          }
        }
      }
    }
    expect(cases).toBe(16 * 15 * 14 * 14 * 8);
  });
});

describe("fully blocked corridors on a 6×6 board", () => {
  const n = 6;

  function corridor(from: Position, direction: Direction): Position[] {
    const delta = DIRECTION_DELTAS[direction];
    const cells: Position[] = [];
    let cursor = {
      row: from.row + delta.row,
      column: from.column + delta.column,
    };
    while (isInsideGrid(cursor, n)) {
      cells.push(cursor);
      cursor = {
        row: cursor.row + delta.row,
        column: cursor.column + delta.column,
      };
    }
    return cells;
  }

  it("blocking every cell to the edge makes the move invalid", () => {
    for (const from of cellsOf(n)) {
      for (const direction of DIRECTIONS) {
        const path = corridor(from, direction);
        const config: BoardConfig = {
          gridSize: n,
          blockedCells: path,
          wormholes: [],
        };
        const result = resolveMove(config, from, direction);
        expect(result.ok, `${coord(from)} ${direction}`).toBe(false);
        expect(result).toEqual(referenceResolveMove(config, from, direction));
      }
    }
  });

  it("unblocking exactly one cell in the corridor makes the mole land there", () => {
    for (const from of cellsOf(n)) {
      for (const direction of DIRECTIONS) {
        const path = corridor(from, direction);
        for (const open of path) {
          const config: BoardConfig = {
            gridSize: n,
            blockedCells: path.filter((cell) => !samePos(cell, open)),
            wormholes: [],
          };
          const result = resolveMove(config, from, direction);
          expect(
            result.ok,
            `${coord(from)} ${direction} open ${coord(open)}`,
          ).toBe(true);
          if (result.ok) {
            expect(result.landed).toEqual(open);
            expect(result.final).toEqual(open);
          }
          expect(result).toEqual(referenceResolveMove(config, from, direction));
        }
      }
    }
  });
});
