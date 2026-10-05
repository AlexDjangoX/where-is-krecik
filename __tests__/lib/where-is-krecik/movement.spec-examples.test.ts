/**
 * Literal scenarios from the game brief, written the way the teacher would
 * describe them. Every expectation is stated in grid coordinates.
 */
import { describe, expect, it } from "vitest";

import { resolveMove } from "@/components/where-is-krecik/lib/movement";
import type {
  BoardConfig,
  Direction,
  Position,
} from "@/components/where-is-krecik/types";

import { board, coord, pos, wormhole } from "./helpers";

/** Folds a list of moves; invalid moves leave the mole where it is. */
function play(config: BoardConfig, start: string, moves: Direction[]) {
  let position: Position = pos(start);
  const trace: string[] = [];
  for (const direction of moves) {
    const result = resolveMove(config, position, direction);
    if (result.ok) {
      position = result.final;
      trace.push(coord(position));
    } else {
      trace.push("invalid");
    }
  }
  return { position, trace, coordinate: coord(position) };
}

describe("basic movement", () => {
  it('"two down and one across" from B2 on a 10×10 lands on C4', () => {
    const result = play(board(10), "B2", ["down", "down", "right"]);
    expect(result.trace).toEqual(["B3", "B4", "C4"]);
    expect(result.coordinate).toBe("C4");
  });

  it("moves one cell in each of the eight directions from the centre of a 3×3", () => {
    const expectations: Record<Direction, string> = {
      up: "B1",
      down: "B3",
      left: "A2",
      right: "C2",
      upLeft: "A1",
      upRight: "C1",
      downLeft: "A3",
      downRight: "C3",
    };
    for (const [direction, expected] of Object.entries(expectations) as [
      Direction,
      string,
    ][]) {
      const result = resolveMove(board(3), pos("B2"), direction);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(coord(result.final)).toBe(expected);
        expect(result.teleportedTo).toBeUndefined();
        expect(result.landed).toEqual(result.final);
      }
    }
  });
});

describe("grid boundaries", () => {
  it("the second Down from B2 on a 3×3 is invalid and the mole stays at B3", () => {
    const result = play(board(3), "B2", ["down", "down"]);
    expect(result.trace).toEqual(["B3", "invalid"]);
    expect(result.coordinate).toBe("B3");
  });

  it("never wraps around: every outward move from every edge cell is rejected", () => {
    const n = 5;
    const config = board(n);
    const edges: [string, Direction[]][] = [
      ["A1", ["up", "left", "upLeft", "upRight", "downLeft"]],
      ["E1", ["up", "right", "upLeft", "upRight", "downRight"]],
      ["A5", ["down", "left", "downLeft", "downRight", "upLeft"]],
      ["E5", ["down", "right", "downLeft", "downRight", "upRight"]],
      ["C1", ["up", "upLeft", "upRight"]],
      ["C5", ["down", "downLeft", "downRight"]],
      ["A3", ["left", "upLeft", "downLeft"]],
      ["E3", ["right", "upRight", "downRight"]],
    ];
    for (const [cell, directions] of edges) {
      for (const direction of directions) {
        const result = resolveMove(config, pos(cell), direction);
        expect(result, `${cell} ${direction}`).toEqual({
          ok: false,
          direction,
          from: pos(cell),
          reason: "outOfBounds",
        });
      }
    }
  });
});

describe("blocked cells", () => {
  it("B2 with C2 blocked, Right → leaps to D2", () => {
    const result = resolveMove(
      board(10, { blocked: ["C2"] }),
      pos("B2"),
      "right",
    );
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(coord(result.landed)).toBe("D2");
      expect(coord(result.final)).toBe("D2");
      expect(result.teleportedTo).toBeUndefined();
    }
  });

  it("B2 with C2 and D2 blocked, Right → leaps to E2", () => {
    const result = resolveMove(
      board(10, { blocked: ["C2", "D2"] }),
      pos("B2"),
      "right",
    );
    expect(result.ok && coord(result.final)).toBe("E2");
  });

  it("B2 with C2..J2 all blocked, Right → invalid, mole stays on B2", () => {
    const blocked = ["C2", "D2", "E2", "F2", "G2", "H2", "I2", "J2"];
    const config = board(10, { blocked });
    const result = resolveMove(config, pos("B2"), "right");
    expect(result).toEqual({
      ok: false,
      direction: "right",
      from: pos("B2"),
      reason: "outOfBounds",
    });
    expect(play(config, "B2", ["right"]).coordinate).toBe("B2");
  });

  it("a blocked cell on the edge makes the move invalid (leap would leave the board)", () => {
    const result = resolveMove(
      board(3, { blocked: ["C2"] }),
      pos("B2"),
      "right",
    );
    expect(result.ok).toBe(false);
  });

  it("diagonal leap: B2 with C3 blocked, DownRight → D4", () => {
    const result = resolveMove(
      board(10, { blocked: ["C3"] }),
      pos("B2"),
      "downRight",
    );
    expect(result.ok && coord(result.final)).toBe("D4");
  });

  it("diagonal double leap: B2 with C3 and D4 blocked, DownRight → E5", () => {
    const result = resolveMove(
      board(10, { blocked: ["C3", "D4"] }),
      pos("B2"),
      "downRight",
    );
    expect(result.ok && coord(result.final)).toBe("E5");
  });

  it("diagonal leap that runs off the corner is invalid", () => {
    // 4×4: from B2 going DownRight → C3 (blocked) → D4 (blocked) → off board.
    const result = resolveMove(
      board(4, { blocked: ["C3", "D4"] }),
      pos("B2"),
      "downRight",
    );
    expect(result.ok).toBe(false);
  });

  it("blocked cells not in the path are ignored", () => {
    const config = board(5, { blocked: ["A1", "E5", "C1", "A3"] });
    const result = resolveMove(config, pos("B2"), "right");
    expect(result.ok && coord(result.final)).toBe("C2");
  });
});

describe("wormholes", () => {
  it("landing on C3 with wormhole C3 → F6 puts the mole on F6", () => {
    const config = board(10, { wormholes: [wormhole("C3", "F6")] });
    const result = resolveMove(config, pos("B3"), "right");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(coord(result.landed)).toBe("C3");
      expect(result.teleportedTo && coord(result.teleportedTo)).toBe("F6");
      expect(coord(result.final)).toBe("F6");
    }
  });

  it("the teacher can keep moving normally from the wormhole exit", () => {
    const config = board(10, { wormholes: [wormhole("C3", "F6")] });
    const result = play(config, "B3", ["right", "up", "left"]);
    expect(result.trace).toEqual(["F6", "F5", "E5"]);
  });

  it("teleports after a blocked leap: B3, C3 blocked, D3 is an entrance → destination", () => {
    const config = board(10, {
      blocked: ["C3"],
      wormholes: [wormhole("D3", "H8")],
    });
    const result = resolveMove(config, pos("B3"), "right");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(coord(result.landed)).toBe("D3");
      expect(coord(result.final)).toBe("H8");
    }
  });

  it("wormholes only trigger on the landing cell, never on cells jumped over", () => {
    // Entrance sits *beyond* the landing cell: not reached.
    const beyond = board(10, {
      blocked: ["C2"],
      wormholes: [wormhole("E2", "J10")],
    });
    const result = resolveMove(beyond, pos("B2"), "right");
    expect(result.ok && coord(result.final)).toBe("D2");
  });

  it("an entrance directly after a leap is the landing cell, so it fires", () => {
    const config = board(10, {
      blocked: ["C2"],
      wormholes: [wormhole("D2", "A1")],
    });
    const result = resolveMove(config, pos("B2"), "right");
    expect(result.ok && coord(result.final)).toBe("A1");
  });

  it("teleports exactly once even if the destination is another entrance (defensive)", () => {
    const config = board(10, {
      wormholes: [wormhole("C3", "F6"), wormhole("F6", "A1")],
    });
    const result = resolveMove(config, pos("B3"), "right");
    expect(result.ok && coord(result.final)).toBe("F6");
  });

  it("a wormhole whose entrance is elsewhere does not affect the move", () => {
    const config = board(10, { wormholes: [wormhole("C3", "F6")] });
    const result = resolveMove(config, pos("B2"), "right");
    expect(result.ok && coord(result.final)).toBe("C2");
  });

  it("returns fresh position objects, never references into the board config", () => {
    const wh = wormhole("C3", "F6");
    const config = board(10, { wormholes: [wh] });
    const result = resolveMove(config, pos("B3"), "right");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.final).not.toBe(wh.destination);
      expect(result.teleportedTo).not.toBe(wh.destination);
      expect(result.final).not.toBe(result.teleportedTo);
    }
  });
});

describe("purity", () => {
  it("never mutates its inputs, whether the move is valid or not", () => {
    const config = board(5, {
      blocked: ["C2", "D2"],
      wormholes: [wormhole("E3", "A1")],
    });
    const snapshot = JSON.parse(JSON.stringify(config)) as BoardConfig;
    const from = pos("B2");
    const fromSnapshot = { ...from };

    resolveMove(config, from, "right"); // leaps to E2
    resolveMove(config, from, "downRight"); // C3 → open
    resolveMove(config, pos("E2"), "right"); // invalid
    resolveMove(config, pos("D3"), "right"); // E3 → wormhole → A1

    expect(config).toEqual(snapshot);
    expect(from).toEqual(fromSnapshot);
  });
});
