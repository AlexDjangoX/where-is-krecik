import type {
  BoardConfig,
  Direction,
  MoveResult,
  Position,
  Wormhole,
} from "@/components/where-is-krecik/types";
import {
  containsPosition,
  isInsideGrid,
  positionsEqual,
  stepInDirection,
} from "@/components/where-is-krecik/lib/grid";

export function findWormholeAt(
  wormholes: readonly Wormhole[],
  position: Position,
): Wormhole | undefined {
  return wormholes.find((wormhole) =>
    positionsEqual(wormhole.entrance, position),
  );
}

/**
 * The single authoritative rule set for moving the mole.
 *
 * Resolution order (spec section 7):
 * 1. Step once in the requested direction.
 * 2. Outside the grid → invalid (no wrap-around).
 * 3. While the cell is blocked, keep stepping in the same direction; leaving
 *    the grid while leaping → invalid.
 * 4. The first open cell is where the mole lands.
 * 5. If that cell is a wormhole entrance, the mole is teleported to the
 *    wormhole's destination (exactly one hop, never chained).
 *
 * This function is pure: it never mutates its inputs.
 */
export function resolveMove(
  board: BoardConfig,
  from: Position,
  direction: Direction,
): MoveResult {
  const { gridSize, blockedCells, wormholes } = board;

  let candidate = stepInDirection(from, direction);

  while (true) {
    if (!isInsideGrid(candidate, gridSize)) {
      return { ok: false, direction, from, reason: "outOfBounds" };
    }
    if (!containsPosition(blockedCells, candidate)) {
      break;
    }
    candidate = stepInDirection(candidate, direction);
  }

  const landed = candidate;
  const wormhole = findWormholeAt(wormholes, landed);

  if (wormhole) {
    const teleportedTo = { ...wormhole.destination };
    return {
      ok: true,
      direction,
      from,
      landed,
      teleportedTo,
      final: { ...teleportedTo },
    };
  }

  return { ok: true, direction, from, landed, final: { ...landed } };
}
