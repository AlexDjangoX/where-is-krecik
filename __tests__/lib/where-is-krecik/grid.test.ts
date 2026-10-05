import { describe, expect, it } from "vitest";

import {
  ALL_DIRECTIONS,
  allPositions,
  clampGridSize,
  columnLabel,
  containsPosition,
  DIRECTION_DELTAS,
  formatCoordinate,
  isInsideGrid,
  MAX_GRID_SIZE,
  MIN_GRID_SIZE,
  OPPOSITE_DIRECTION,
  parseCoordinate,
  positionsEqual,
  rowLabel,
  stepInDirection,
} from "@/components/where-is-krecik/lib/grid";

import { cellsOf, DIRECTIONS, pos } from "./helpers";

describe("grid labels", () => {
  it("labels columns A–J", () => {
    expect(Array.from({ length: 10 }, (_, i) => columnLabel(i)).join("")).toBe(
      "ABCDEFGHIJ",
    );
  });

  it("labels rows 1–10", () => {
    expect(Array.from({ length: 10 }, (_, i) => rowLabel(i))).toEqual([
      "1",
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
      "10",
    ]);
  });

  it("formats every cell of a 10×10 grid as letter + number", () => {
    const letters = "ABCDEFGHIJ";
    for (const cell of cellsOf(10)) {
      expect(formatCoordinate(cell)).toBe(
        `${letters[cell.column]}${cell.row + 1}`,
      );
    }
  });

  it("matches the spec examples", () => {
    expect(formatCoordinate({ row: 0, column: 0 })).toBe("A1");
    expect(formatCoordinate({ row: 1, column: 1 })).toBe("B2");
    expect(formatCoordinate({ row: 3, column: 3 })).toBe("D4");
    expect(formatCoordinate({ row: 5, column: 5 })).toBe("F6");
    expect(formatCoordinate({ row: 9, column: 9 })).toBe("J10");
  });

  it("parseCoordinate round-trips every cell and matches the test helper", () => {
    for (const cell of cellsOf(10)) {
      const label = formatCoordinate(cell);
      expect(parseCoordinate(label)).toEqual(cell);
      expect(parseCoordinate(label.toLowerCase())).toEqual(cell);
      expect(parseCoordinate(` ${label} `)).toEqual(cell);
      expect(pos(label)).toEqual(cell);
    }
  });

  it("rejects malformed coordinates", () => {
    for (const bad of [
      "",
      "A",
      "1",
      "A0",
      "A11",
      "K1",
      "AA1",
      "1A",
      "B-2",
      "Z9",
    ]) {
      expect(parseCoordinate(bad)).toBeNull();
    }
  });
});

describe("isInsideGrid", () => {
  it("accepts every cell and rejects every cell just outside, for sizes 3..10", () => {
    for (let n = MIN_GRID_SIZE; n <= MAX_GRID_SIZE; n += 1) {
      for (const cell of cellsOf(n)) {
        expect(isInsideGrid(cell, n)).toBe(true);
      }
      for (let i = -1; i <= n; i += 1) {
        expect(isInsideGrid({ row: -1, column: i }, n)).toBe(false);
        expect(isInsideGrid({ row: n, column: i }, n)).toBe(false);
        expect(isInsideGrid({ row: i, column: -1 }, n)).toBe(false);
        expect(isInsideGrid({ row: i, column: n }, n)).toBe(false);
      }
    }
  });
});

describe("direction tables", () => {
  it("lists all eight directions exactly once", () => {
    expect([...ALL_DIRECTIONS].sort()).toEqual([...DIRECTIONS].sort());
    expect(new Set(ALL_DIRECTIONS).size).toBe(8);
  });

  it("uses unit deltas where up decreases the row and right increases the column", () => {
    expect(DIRECTION_DELTAS.up).toEqual({ row: -1, column: 0 });
    expect(DIRECTION_DELTAS.down).toEqual({ row: 1, column: 0 });
    expect(DIRECTION_DELTAS.left).toEqual({ row: 0, column: -1 });
    expect(DIRECTION_DELTAS.right).toEqual({ row: 0, column: 1 });
    expect(DIRECTION_DELTAS.upLeft).toEqual({ row: -1, column: -1 });
    expect(DIRECTION_DELTAS.upRight).toEqual({ row: -1, column: 1 });
    expect(DIRECTION_DELTAS.downLeft).toEqual({ row: 1, column: -1 });
    expect(DIRECTION_DELTAS.downRight).toEqual({ row: 1, column: 1 });
    for (const direction of ALL_DIRECTIONS) {
      const delta = DIRECTION_DELTAS[direction];
      expect(Math.max(Math.abs(delta.row), Math.abs(delta.column))).toBe(1);
    }
  });

  it("opposites cancel out and are involutions", () => {
    for (const direction of ALL_DIRECTIONS) {
      const opposite = OPPOSITE_DIRECTION[direction];
      expect(OPPOSITE_DIRECTION[opposite]).toBe(direction);
      const there = stepInDirection({ row: 5, column: 5 }, direction);
      expect(stepInDirection(there, opposite)).toEqual({ row: 5, column: 5 });
    }
  });
});

describe("small helpers", () => {
  it("clampGridSize keeps 3..10 and rounds", () => {
    expect(clampGridSize(0)).toBe(3);
    expect(clampGridSize(2)).toBe(3);
    expect(clampGridSize(3)).toBe(3);
    expect(clampGridSize(7.4)).toBe(7);
    expect(clampGridSize(10)).toBe(10);
    expect(clampGridSize(11)).toBe(10);
    expect(clampGridSize(Number.NaN)).toBe(3);
    expect(clampGridSize(Number.POSITIVE_INFINITY)).toBe(3);
  });

  it("positionsEqual / containsPosition compare by value", () => {
    expect(positionsEqual(pos("C3"), { row: 2, column: 2 })).toBe(true);
    expect(positionsEqual(pos("C3"), pos("C4"))).toBe(false);
    expect(containsPosition([pos("A1"), pos("B2")], pos("B2"))).toBe(true);
    expect(containsPosition([pos("A1"), pos("B2")], pos("B3"))).toBe(false);
    expect(containsPosition([], pos("A1"))).toBe(false);
  });

  it("allPositions enumerates n² cells in reading order", () => {
    for (let n = 3; n <= 10; n += 1) {
      const cells = allPositions(n);
      expect(cells).toHaveLength(n * n);
      expect(cells).toEqual(cellsOf(n));
      expect(cells[0]).toEqual({ row: 0, column: 0 });
      expect(cells[cells.length - 1]).toEqual({ row: n - 1, column: n - 1 });
    }
  });
});
