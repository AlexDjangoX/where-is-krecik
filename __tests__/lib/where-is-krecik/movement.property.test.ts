/**
 * Seeded randomised comparison of the production movement engine against the
 * independent reference model, plus structural invariants that must hold for
 * every move on every board.
 *
 * Set MOMO_FUZZ_ITERATIONS for a heavier local run (default 10_000 boards).
 */
import { describe, expect, it } from "vitest";

import {
  DIRECTION_DELTAS,
  isInsideGrid,
  OPPOSITE_DIRECTION,
} from "@/components/where-is-krecik/lib/grid";
import { resolveMove } from "@/components/where-is-krecik/lib/movement";
import type {
  BoardConfig,
  Direction,
  MoveResult,
  Position,
} from "@/components/where-is-krecik/types";

import {
  cellsOf,
  coord,
  DIRECTIONS,
  mulberry32,
  pick,
  randomBoard,
  randomDirections,
  randomInt,
  samePos,
} from "./helpers";
import { referenceResolveMove } from "./reference-model";

const ITERATIONS = Number(process.env.MOMO_FUZZ_ITERATIONS ?? 10_000);
const BASE_SEED = 0x5eed_0001;

/** Cheap assertion for hot loops; the message is only built on failure. */
function check(condition: boolean, message: () => string): void {
  if (!condition) expect.fail(message());
}

function isBlocked(config: BoardConfig, position: Position): boolean {
  return config.blockedCells.some((cell) => samePos(cell, position));
}

function isEntrance(config: BoardConfig, position: Position): boolean {
  return config.wormholes.some((wormhole) =>
    samePos(wormhole.entrance, position),
  );
}

function cellsStrictlyBetween(
  from: Position,
  to: Position,
  direction: Direction,
): Position[] {
  const delta = DIRECTION_DELTAS[direction];
  const between: Position[] = [];
  let cursor = {
    row: from.row + delta.row,
    column: from.column + delta.column,
  };
  while (!samePos(cursor, to)) {
    between.push(cursor);
    cursor = {
      row: cursor.row + delta.row,
      column: cursor.column + delta.column,
    };
    if (between.length > 12)
      throw new Error("landed cell is not collinear with the direction");
  }
  return between;
}

function assertInvariants(
  config: BoardConfig,
  from: Position,
  direction: Direction,
  result: MoveResult,
  label: () => string,
) {
  check(
    result.direction === direction,
    () => `${label()}: direction echoed wrongly`,
  );
  check(samePos(result.from, from), () => `${label()}: from echoed wrongly`);

  if (!result.ok) {
    check(
      result.reason === "outOfBounds",
      () => `${label()}: unexpected reason`,
    );
    // The very first step must have been outside, or every cell to the edge blocked.
    const delta = DIRECTION_DELTAS[direction];
    let cursor = {
      row: from.row + delta.row,
      column: from.column + delta.column,
    };
    while (isInsideGrid(cursor, config.gridSize)) {
      const cell = cursor;
      check(
        isBlocked(config, cell),
        () => `${label()}: open cell ${coord(cell)} was skipped`,
      );
      cursor = {
        row: cursor.row + delta.row,
        column: cursor.column + delta.column,
      };
    }
    return;
  }

  const { landed, final, teleportedTo } = result;

  check(
    isInsideGrid(landed, config.gridSize),
    () => `${label()}: landed outside`,
  );
  check(
    isInsideGrid(final, config.gridSize),
    () => `${label()}: final outside`,
  );
  check(!isBlocked(config, landed), () => `${label()}: landed on a rock`);
  check(!isBlocked(config, final), () => `${label()}: final on a rock`);
  check(
    !isEntrance(config, final),
    () => `${label()}: final on a wormhole entrance`,
  );

  // Collinear and every skipped cell was blocked.
  const skipped = cellsStrictlyBetween(from, landed, direction);
  for (const cell of skipped) {
    check(
      isBlocked(config, cell),
      () => `${label()}: skipped open cell ${coord(cell)}`,
    );
  }
  if (skipped.length === 0) {
    const delta = DIRECTION_DELTAS[direction];
    check(
      samePos(landed, {
        row: from.row + delta.row,
        column: from.column + delta.column,
      }),
      () => `${label()}: plain move did not land one step away`,
    );
  }

  const wormhole = config.wormholes.find((candidate) =>
    samePos(candidate.entrance, landed),
  );
  if (wormhole) {
    check(
      teleportedTo !== undefined && samePos(teleportedTo, wormhole.destination),
      () => `${label()}: missing or wrong teleport`,
    );
    check(
      samePos(final, wormhole.destination),
      () => `${label()}: final is not the wormhole exit`,
    );
  } else {
    check(teleportedTo === undefined, () => `${label()}: unexpected teleport`);
    check(
      samePos(final, landed),
      () => `${label()}: final differs from landed`,
    );
  }
}

describe("random boards vs. reference model", () => {
  it(`agrees with the reference model and satisfies every invariant for ${ITERATIONS} boards`, () => {
    let steps = 0;
    for (let i = 0; i < ITERATIONS; i += 1) {
      const seed = BASE_SEED + i;
      const rng = mulberry32(seed);
      const { board: config, start } = randomBoard(rng);
      const moves = randomDirections(rng, randomInt(rng, 1, 50));

      let position = start;
      for (const [index, direction] of moves.entries()) {
        const from = position;
        const label = () =>
          `seed=${seed} step=${index} from=${coord(from)} ${direction}`;
        const actual = resolveMove(config, from, direction);
        const expected = referenceResolveMove(config, from, direction);
        if (JSON.stringify(actual) !== JSON.stringify(expected)) {
          expect(actual, label()).toEqual(expected); // rich diff on failure
        }
        assertInvariants(config, from, direction, actual, label);
        if (actual.ok) position = actual.final;
        steps += 1;
      }
    }
    expect(steps).toBeGreaterThan(ITERATIONS);
  });

  it("is deterministic: replaying a seed produces an identical trace", () => {
    const run = (seed: number) => {
      const rng = mulberry32(seed);
      const { board: config, start } = randomBoard(rng);
      const moves = randomDirections(rng, 40);
      let position = start;
      const trace: string[] = [];
      for (const direction of moves) {
        const result = resolveMove(config, position, direction);
        if (result.ok) position = result.final;
        trace.push(result.ok ? coord(result.final) : "x");
      }
      return trace;
    };
    for (let seed = 1; seed <= 200; seed += 1) {
      expect(run(seed)).toEqual(run(seed));
    }
  });
});

describe("symmetry", () => {
  type Transform = {
    name: string;
    position: (p: Position, n: number) => Position;
    direction: (d: Direction) => Direction;
  };

  const flipH = (d: Direction): Direction =>
    (
      ({
        left: "right",
        right: "left",
        upLeft: "upRight",
        upRight: "upLeft",
        downLeft: "downRight",
        downRight: "downLeft",
      }) as Partial<Record<Direction, Direction>>
    )[d] ?? d;

  const flipV = (d: Direction): Direction =>
    (
      ({
        up: "down",
        down: "up",
        upLeft: "downLeft",
        downLeft: "upLeft",
        upRight: "downRight",
        downRight: "upRight",
      }) as Partial<Record<Direction, Direction>>
    )[d] ?? d;

  const transpose = (d: Direction): Direction =>
    (
      ({
        up: "left",
        left: "up",
        down: "right",
        right: "down",
        upRight: "downLeft",
        downLeft: "upRight",
      }) as Partial<Record<Direction, Direction>>
    )[d] ?? d;

  const TRANSFORMS: Transform[] = [
    {
      name: "horizontal mirror",
      position: (p, n) => ({ row: p.row, column: n - 1 - p.column }),
      direction: flipH,
    },
    {
      name: "vertical mirror",
      position: (p, n) => ({ row: n - 1 - p.row, column: p.column }),
      direction: flipV,
    },
    {
      name: "180° rotation",
      position: (p, n) => ({ row: n - 1 - p.row, column: n - 1 - p.column }),
      direction: (d) => flipH(flipV(d)),
    },
    {
      name: "transpose",
      position: (p) => ({ row: p.column, column: p.row }),
      direction: transpose,
    },
  ];

  function transformBoard(config: BoardConfig, t: Transform): BoardConfig {
    const n = config.gridSize;
    return {
      gridSize: n,
      blockedCells: config.blockedCells.map((cell) => t.position(cell, n)),
      wormholes: config.wormholes.map((wormhole) => ({
        entrance: t.position(wormhole.entrance, n),
        destination: t.position(wormhole.destination, n),
      })),
    };
  }

  for (const t of TRANSFORMS) {
    it(`${t.name}: transforming the board and the direction transforms the result`, () => {
      for (let i = 0; i < 1_500; i += 1) {
        const seed = 0x7a5e_0000 + i;
        const rng = mulberry32(seed);
        const { board: config, start } = randomBoard(rng);
        const n = config.gridSize;
        const mirrored = transformBoard(config, t);

        for (const direction of DIRECTIONS) {
          const original = resolveMove(config, start, direction);
          const transformed = resolveMove(
            mirrored,
            t.position(start, n),
            t.direction(direction),
          );
          const label = `seed=${seed} ${t.name} ${coord(start)} ${direction}`;
          expect(transformed.ok, label).toBe(original.ok);
          if (original.ok && transformed.ok) {
            expect(transformed.landed, label).toEqual(
              t.position(original.landed, n),
            );
            expect(transformed.final, label).toEqual(
              t.position(original.final, n),
            );
          }
        }
      }
    });
  }
});

describe("inverse moves on obstacle-free boards", () => {
  it("moving then moving back returns to the start whenever both moves are valid", () => {
    for (let n = 3; n <= 10; n += 1) {
      const config: BoardConfig = {
        gridSize: n,
        blockedCells: [],
        wormholes: [],
      };
      for (const from of cellsOf(n)) {
        for (const direction of DIRECTIONS) {
          const there = resolveMove(config, from, direction);
          if (!there.ok) continue;
          const back = resolveMove(
            config,
            there.final,
            OPPOSITE_DIRECTION[direction],
          );
          expect(back.ok).toBe(true);
          if (back.ok) expect(back.final).toEqual(from);
        }
      }
    }
  });

  it("with random rocks (no wormholes), leaping there and back is symmetric", () => {
    for (let i = 0; i < 2_000; i += 1) {
      const rng = mulberry32(0xb10c_0000 + i);
      const generated = randomBoard(rng);
      const config: BoardConfig = { ...generated.board, wormholes: [] };
      const from = generated.start;
      const direction = pick(rng, DIRECTIONS);
      const there = resolveMove(config, from, direction);
      if (!there.ok) continue;
      const back = resolveMove(
        config,
        there.final,
        OPPOSITE_DIRECTION[direction],
      );
      // Every cell between `from` and `there.final` is blocked, so the way back
      // leaps over the same rocks and lands exactly on `from`.
      expect(back.ok).toBe(true);
      if (back.ok) expect(back.final).toEqual(from);
    }
  });
});
