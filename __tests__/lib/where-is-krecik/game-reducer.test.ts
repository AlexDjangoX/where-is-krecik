/**
 * State-transition tests for the game reducer: phase guards, setup validation,
 * grid resizing, round lifecycle, and agreement between the reducer path and
 * the movement engine called directly.
 */
import { describe, expect, it } from "vitest";

import {
  createInitialState,
  defaultStartPosition,
  gameReducer,
  type GameAction,
} from "@/components/where-is-krecik/lib/game-reducer";
import { resolveMove } from "@/components/where-is-krecik/lib/movement";
import type {
  Direction,
  GamePhase,
  GameState,
  Position,
  Wormhole,
} from "@/components/where-is-krecik/types";

import {
  coord,
  deepFreeze,
  DIRECTIONS,
  mulberry32,
  pos,
  randomBoard,
  randomDirections,
  randomInt,
  wormhole,
} from "./helpers";

function run(state: GameState, ...actions: GameAction[]): GameState {
  return actions.reduce(
    (current, action) => gameReducer(deepFreeze(current), action),
    state,
  );
}

function click(coordinate: string): GameAction {
  return { type: "cellClicked", position: pos(coordinate) };
}

function tool(selected: GameState["selectedTool"]): GameAction {
  return { type: "selectTool", tool: selected };
}

/** A configured 6×6 setup: start B2, rocks C2 + D4, wormhole E2 → A6. */
function configuredSetup(): GameState {
  return run(
    createInitialState(),
    { type: "setGridSize", size: 6 },
    click("B2"),
    tool("blocked"),
    click("C2"),
    click("D4"),
    tool("wormholeEntrance"),
    click("E2"),
    click("A6"),
  );
}

function playingState(): GameState {
  return run(configuredSetup(), { type: "startRound" });
}

function revealedState(): GameState {
  return run(
    playingState(),
    { type: "move", direction: "down" },
    { type: "reveal" },
  );
}

const STATE_BY_PHASE: Record<GamePhase, () => GameState> = {
  setup: configuredSetup,
  playing: playingState,
  revealed: revealedState,
};

describe("initial state", () => {
  it("starts in setup on a 3×3 with Krecik in the centre (B2) and no obstacles", () => {
    expect(createInitialState()).toEqual({
      gridSize: 3,
      gamePhase: "setup",
      selectedTool: "moleStart",
      startingPosition: pos("B2"),
      currentMolePosition: pos("B2"),
      blockedCells: [],
      wormholes: [],
      pendingWormholeEntrance: null,
      lastMove: null,
      moveCount: 0,
      invalidMoveCount: 0,
      showMoleDuringPlay: false,
      moveHistory: [],
    });
  });

  it("returns a fresh object each time", () => {
    expect(createInitialState()).not.toBe(createInitialState());
  });

  it("a round can start immediately with nothing else configured", () => {
    const playing = run(createInitialState(), { type: "startRound" });
    expect(playing.gamePhase).toBe("playing");
    expect(playing.currentMolePosition).toEqual(pos("B2"));
  });
});

describe("defaultStartPosition", () => {
  it("is the centre cell for every grid size", () => {
    expect(defaultStartPosition(3, [], [])).toEqual(pos("B2"));
    expect(defaultStartPosition(4, [], [])).toEqual(pos("B2"));
    expect(defaultStartPosition(5, [], [])).toEqual(pos("C3"));
    expect(defaultStartPosition(10, [], [])).toEqual(pos("E5"));
  });

  it("falls back to the first free cell in reading order when the centre is taken", () => {
    expect(defaultStartPosition(3, [pos("B2")], [])).toEqual(pos("A1"));
    expect(defaultStartPosition(3, [pos("B2"), pos("A1")], [])).toEqual(
      pos("B1"),
    );
    expect(
      defaultStartPosition(3, [pos("A1")], [wormhole("B2", "C3")]),
    ).toEqual(pos("B1"));
  });

  it("returns null only when every cell is a rock or an entrance", () => {
    const all = ["A1", "B1", "C1", "A2", "B2", "C2", "A3", "B3", "C3"].map(pos);
    expect(defaultStartPosition(3, all, [])).toBeNull();
    expect(
      defaultStartPosition(3, all.slice(1), [wormhole("A1", "B2")]),
    ).toBeNull();
  });
});

describe("phase guards: which actions change state in which phase", () => {
  const ACTIONS: {
    name: string;
    action: GameAction;
    allowedIn: GamePhase[];
  }[] = [
    {
      name: "setGridSize",
      action: { type: "setGridSize", size: 8 },
      allowedIn: ["setup"],
    },
    { name: "selectTool", action: tool("blocked"), allowedIn: ["setup"] },
    { name: "cellClicked", action: click("F6"), allowedIn: ["setup"] },
    {
      name: "startRound",
      action: { type: "startRound" },
      allowedIn: ["setup"],
    },
    {
      name: "move",
      action: { type: "move", direction: "down" },
      allowedIn: ["playing"],
    },
    { name: "reveal", action: { type: "reveal" }, allowedIn: ["playing"] },
    {
      name: "newRound",
      action: { type: "newRound" },
      allowedIn: ["playing", "revealed"],
    },
    {
      name: "replayRound",
      action: { type: "replayRound" },
      allowedIn: ["revealed"],
    },
    {
      name: "toggleShowMole",
      action: { type: "toggleShowMole" },
      allowedIn: ["setup", "playing", "revealed"],
    },
    {
      name: "resetGame",
      action: { type: "resetGame" },
      allowedIn: ["setup", "playing", "revealed"],
    },
  ];

  for (const phase of ["setup", "playing", "revealed"] as GamePhase[]) {
    for (const { name, action, allowedIn } of ACTIONS) {
      const allowed = allowedIn.includes(phase);
      it(`${name} in ${phase} ${allowed ? "changes" : "does not change"} state`, () => {
        const before = STATE_BY_PHASE[phase]();
        const after = gameReducer(deepFreeze(before), action);
        if (allowed) {
          expect(after).not.toBe(before);
          expect(after).not.toEqual(before);
        } else {
          expect(after).toBe(before);
        }
      });
    }
  }
});

describe("setup: mole start", () => {
  it("places the mole and makes it visible on the chosen cell", () => {
    const state = run(createInitialState(), click("B2"));
    expect(state.startingPosition).toEqual(pos("B2"));
    expect(state.currentMolePosition).toEqual(pos("B2"));
  });

  it("moves the start when another cell is clicked", () => {
    const state = run(createInitialState(), click("B2"), click("C3"));
    expect(state.startingPosition).toEqual(pos("C3"));
    expect(state.currentMolePosition).toEqual(pos("C3"));
  });

  it("refuses a blocked cell or a wormhole entrance, allows a wormhole exit", () => {
    const base = run(
      createInitialState(),
      { type: "setGridSize", size: 5 },
      tool("blocked"),
      click("C3"),
      tool("wormholeEntrance"),
      click("D4"),
      click("E5"),
      tool("moleStart"),
    );
    expect(run(base, click("C3"))).toBe(base);
    expect(run(base, click("D4"))).toBe(base);
    expect(run(base, click("E5")).startingPosition).toEqual(pos("E5"));
  });

  it("ignores clicks outside the grid", () => {
    const base = createInitialState();
    expect(
      gameReducer(base, {
        type: "cellClicked",
        position: { row: 3, column: 0 },
      }),
    ).toBe(base);
    expect(
      gameReducer(base, {
        type: "cellClicked",
        position: { row: -1, column: 0 },
      }),
    ).toBe(base);
  });
});

describe("setup: blocked cells", () => {
  it("toggles a rock on and off", () => {
    const on = run(createInitialState(), tool("blocked"), click("C2"));
    expect(on.blockedCells).toEqual([pos("C2")]);
    const off = run(on, click("C2"));
    expect(off.blockedCells).toEqual([]);
  });

  it("keeps insertion order and only removes the clicked rock", () => {
    const state = run(
      createInitialState(),
      tool("blocked"),
      click("A1"),
      click("B2"),
      click("C3"),
      click("B2"),
    );
    expect(state.blockedCells).toEqual([pos("A1"), pos("C3")]);
  });

  it("cannot be placed on the start or a wormhole entrance, but can sit on a wormhole exit", () => {
    const base = run(
      createInitialState(),
      { type: "setGridSize", size: 5 },
      click("A1"),
      tool("wormholeEntrance"),
      click("B2"),
      click("C3"),
      tool("blocked"),
    );
    expect(run(base, click("A1"))).toBe(base);
    expect(run(base, click("B2"))).toBe(base);
    expect(run(base, click("C3")).blockedCells).toEqual([pos("C3")]);
    expect(run(base, click("D4")).blockedCells).toEqual([pos("D4")]);
  });

  it("cannot be placed on the default (centre) start either", () => {
    const base = run(createInitialState(), tool("blocked"));
    expect(run(base, click("B2"))).toBe(base);
  });
});

describe("setup: wormholes", () => {
  it("two clicks create an entrance → exit pair and return to the entrance tool", () => {
    const afterEntrance = run(
      createInitialState(),
      tool("wormholeEntrance"),
      click("C3"),
    );
    expect(afterEntrance.pendingWormholeEntrance).toEqual(pos("C3"));
    expect(afterEntrance.selectedTool).toBe("wormholeDestination");
    expect(afterEntrance.wormholes).toEqual([]);

    const done = run(afterEntrance, click("A1"));
    expect(done.wormholes).toEqual([wormhole("C3", "A1")]);
    expect(done.pendingWormholeEntrance).toBeNull();
    expect(done.selectedTool).toBe("wormholeEntrance");
  });

  it("refuses an entrance on a rock or the start, but allows one on another wormhole's exit", () => {
    const base = run(
      createInitialState(),
      { type: "setGridSize", size: 5 },
      click("A1"),
      tool("blocked"),
      click("B2"),
      tool("wormholeEntrance"),
      click("C3"),
      click("D4"),
    );
    expect(base.selectedTool).toBe("wormholeEntrance");
    expect(run(base, click("A1"))).toBe(base);
    expect(run(base, click("B2"))).toBe(base);
    expect(run(base, click("D4")).pendingWormholeEntrance).toEqual(pos("D4"));
  });

  it("refuses an exit only on the pending entrance itself", () => {
    const base = run(
      createInitialState(),
      { type: "setGridSize", size: 5 },
      tool("blocked"),
      click("B2"),
      tool("wormholeEntrance"),
      click("D4"),
      click("E5"),
      click("A1"), // pending entrance A1, tool now wormholeDestination
    );
    expect(base.pendingWormholeEntrance).toEqual(pos("A1"));
    expect(run(base, click("A1"))).toBe(base);
    const ok = run(base, click("E4"));
    expect(ok.wormholes).toEqual([wormhole("D4", "E5"), wormhole("A1", "E4")]);
  });

  it("allows an exit on any other cell: the start, a rock, another entrance, or another exit", () => {
    const base = run(
      createInitialState(),
      { type: "setGridSize", size: 5 },
      click("A1"), // start
      tool("blocked"),
      click("B2"), // rock
      tool("wormholeEntrance"),
      click("C3"),
      click("D4"), // wormhole C3 → D4
      click("E5"), // pending entrance E5
    );
    expect(run(base, click("A1")).wormholes[1]).toEqual(wormhole("E5", "A1"));
    expect(run(base, click("B2")).wormholes[1]).toEqual(wormhole("E5", "B2"));
    expect(run(base, click("C3")).wormholes[1]).toEqual(wormhole("E5", "C3"));
    expect(run(base, click("D4")).wormholes[1]).toEqual(wormhole("E5", "D4"));
  });

  it("an exit on another entrance still teleports only once during play", () => {
    const state = run(
      createInitialState(),
      { type: "setGridSize", size: 5 },
      click("A1"),
      tool("wormholeEntrance"),
      click("B1"),
      click("C3"), // B1 → C3
      click("C3"),
      click("E5"), // C3 → E5
      { type: "startRound" },
      { type: "move", direction: "right" }, // A1 → B1 → teleport → C3 (not chained to E5)
    );
    expect(coord(state.currentMolePosition!)).toBe("C3");
    const next = run(state, { type: "move", direction: "up" }); // steps off the entrance normally
    expect(coord(next.currentMolePosition!)).toBe("C2");
  });

  it("clicking an existing entrance with either wormhole tool removes that wormhole", () => {
    const base = run(
      createInitialState(),
      { type: "setGridSize", size: 5 },
      click("A1"), // move the start off B2 first
      tool("wormholeEntrance"),
      click("B2"),
      click("C3"),
      click("D4"),
      click("E5"),
    );
    expect(base.wormholes).toHaveLength(2);

    const viaEntranceTool = run(base, click("B2"));
    expect(viaEntranceTool.wormholes).toEqual([wormhole("D4", "E5")]);
    expect(viaEntranceTool.pendingWormholeEntrance).toBeNull();

    const viaDestinationTool = run(
      base,
      tool("wormholeDestination"),
      click("D4"),
    );
    expect(viaDestinationTool.wormholes).toEqual([wormhole("B2", "C3")]);
  });

  it("with the exit tool selected and nothing pending, clicking an empty cell does nothing", () => {
    const base = run(createInitialState(), tool("wormholeDestination"));
    expect(base.pendingWormholeEntrance).toBeNull();
    expect(run(base, click("B2"))).toBe(base);
  });

  it("switching to another tool abandons the pending entrance", () => {
    const pending = run(
      createInitialState(),
      tool("wormholeEntrance"),
      click("C3"),
    );
    const abandoned = run(pending, tool("blocked"));
    expect(abandoned.pendingWormholeEntrance).toBeNull();
    expect(abandoned.wormholes).toEqual([]);
    // Re-selecting the destination tool keeps whatever is pending (nothing here).
    expect(run(pending, tool("wormholeDestination"))).toBe(pending);
  });

  it("selecting the already-selected tool is a no-op", () => {
    const base = createInitialState();
    expect(run(base, tool("moleStart"))).toBe(base);
  });
});

describe("setup: grid size", () => {
  it("clamps to 3..10 and is a no-op when unchanged", () => {
    const base = createInitialState();
    expect(run(base, { type: "setGridSize", size: 2 })).toBe(base);
    expect(run(base, { type: "setGridSize", size: 3 })).toBe(base);
    expect(run(base, { type: "setGridSize", size: 11 }).gridSize).toBe(10);
    expect(run(base, { type: "setGridSize", size: 99 }).gridSize).toBe(10);
    expect(run(base, { type: "setGridSize", size: 7 }).gridSize).toBe(7);
  });

  it("growing keeps everything configured", () => {
    const before = configuredSetup();
    const after = run(before, { type: "setGridSize", size: 10 });
    expect(after.gridSize).toBe(10);
    expect(after.startingPosition).toEqual(before.startingPosition);
    expect(after.currentMolePosition).toEqual(before.currentMolePosition);
    expect(after.blockedCells).toEqual(before.blockedCells);
    expect(after.wormholes).toEqual(before.wormholes);
  });

  it("shrinking prunes only out-of-range rocks, and any wormhole with either end out of range", () => {
    // 6×6 with rocks C2, D4; wormhole E2 → A6.
    const before = configuredSetup();
    const after = run(before, { type: "setGridSize", size: 4 });
    expect(after.gridSize).toBe(4);
    expect(after.startingPosition).toEqual(pos("B2"));
    expect(after.blockedCells).toEqual([pos("C2"), pos("D4")]); // both fit in 4×4
    expect(after.wormholes).toEqual([]); // E2 is column 5, A6 is row 6 → both out

    const smaller = run(before, { type: "setGridSize", size: 3 });
    expect(smaller.blockedCells).toEqual([pos("C2")]);
  });

  it("moves the start to the new centre when it falls outside the smaller grid", () => {
    const before = run(
      createInitialState(),
      { type: "setGridSize", size: 8 },
      click("H8"),
    );
    const after = run(before, { type: "setGridSize", size: 5 });
    expect(after.startingPosition).toEqual(pos("C3"));
    expect(after.currentMolePosition).toEqual(pos("C3"));
  });

  it("keeps the default start following the centre when nothing else was chosen", () => {
    const grown = run(createInitialState(), { type: "setGridSize", size: 10 });
    // Growing keeps B2 (still inside); shrinking below it re-centres.
    expect(grown.startingPosition).toEqual(pos("B2"));
    const shrunk = run(
      createInitialState(),
      { type: "setGridSize", size: 6 },
      click("F6"),
      { type: "setGridSize", size: 3 },
    );
    expect(shrunk.startingPosition).toEqual(pos("B2"));
  });

  it("leaves Krecik without a start when every cell of the smaller grid is a rock or entrance", () => {
    const state = run(
      createInitialState(),
      { type: "setGridSize", size: 6 },
      click("F6"),
      tool("blocked"),
      ...["A1", "B1", "C1", "A2", "B2", "C2", "A3", "B3"].map(click),
      tool("wormholeEntrance"),
      click("C3"),
      click("A1"), // exit on a rock is allowed
      { type: "setGridSize", size: 3 },
    );
    expect(state.startingPosition).toBeNull();
    expect(state.currentMolePosition).toBeNull();
    expect(state.wormholes).toEqual([wormhole("C3", "A1")]);
    // Start round is refused until the teacher frees a cell and picks a start.
    expect(run(state, { type: "startRound" })).toBe(state);
    const freed = run(
      state,
      tool("blocked"),
      click("A1"),
      tool("moleStart"),
      click("A1"),
    );
    expect(run(freed, { type: "startRound" }).gamePhase).toBe("playing");
  });

  it("skips a rock or entrance sitting on the new centre when re-centring", () => {
    const state = run(
      createInitialState(),
      { type: "setGridSize", size: 6 },
      click("F6"),
      tool("blocked"),
      click("B2"),
      { type: "setGridSize", size: 3 },
    );
    expect(state.blockedCells).toEqual([pos("B2")]);
    expect(state.startingPosition).toEqual(pos("A1"));
  });

  it("drops a wormhole whose exit is out of range even if its entrance fits", () => {
    const before = run(
      createInitialState(),
      { type: "setGridSize", size: 8 },
      tool("wormholeEntrance"),
      click("A1"),
      click("H8"),
    );
    expect(before.wormholes).toEqual([wormhole("A1", "H8")]);
    expect(run(before, { type: "setGridSize", size: 5 }).wormholes).toEqual([]);
  });

  it("clears a pending entrance and returns to the entrance tool", () => {
    const pending = run(
      createInitialState(),
      tool("wormholeEntrance"),
      click("A1"),
    );
    const after = run(pending, { type: "setGridSize", size: 5 });
    expect(after.pendingWormholeEntrance).toBeNull();
    expect(after.selectedTool).toBe("wormholeEntrance");

    // A non-wormhole tool is left untouched.
    const rocks = run(createInitialState(), tool("blocked"));
    expect(run(rocks, { type: "setGridSize", size: 5 }).selectedTool).toBe(
      "blocked",
    );
  });
});

describe("round lifecycle", () => {
  it("startRound is refused only in the degenerate case of no start at all (defensive)", () => {
    const broken: GameState = {
      ...createInitialState(),
      startingPosition: null,
      currentMolePosition: null,
    };
    expect(gameReducer(broken, { type: "startRound" })).toBe(broken);
  });

  it("startRound works with only rocks, only wormholes, or nothing configured", () => {
    const onlyRocks = run(createInitialState(), tool("blocked"), click("A1"), {
      type: "startRound",
    });
    expect(onlyRocks.gamePhase).toBe("playing");
    const onlyWormhole = run(
      createInitialState(),
      tool("wormholeEntrance"),
      click("A1"),
      click("C3"),
      { type: "startRound" },
    );
    expect(onlyWormhole.gamePhase).toBe("playing");
    expect(run(createInitialState(), { type: "startRound" }).gamePhase).toBe(
      "playing",
    );
  });

  it("startRound hides nothing in state but switches to playing with counters reset", () => {
    const pending = run(
      configuredSetup(),
      tool("wormholeEntrance"),
      click("F6"),
    );
    const playing = run(pending, { type: "startRound" });
    expect(playing.gamePhase).toBe("playing");
    expect(playing.currentMolePosition).toEqual(playing.startingPosition);
    expect(playing.moveCount).toBe(0);
    expect(playing.invalidMoveCount).toBe(0);
    expect(playing.lastMove).toBeNull();
    expect(playing.pendingWormholeEntrance).toBeNull();
    // The abandoned pending entrance did not become a wormhole.
    expect(playing.wormholes).toEqual([wormhole("E2", "A6")]);
  });

  it("valid moves update the position and increment moveCount only", () => {
    // Start B2 on 6×6, C2 blocked, wormhole E2 → A6.
    const s1 = run(playingState(), { type: "move", direction: "right" }); // leap C2 → D2
    expect(coord(s1.currentMolePosition!)).toBe("D2");
    expect(s1.moveCount).toBe(1);
    expect(s1.invalidMoveCount).toBe(0);
    expect(s1.lastMove?.ok).toBe(true);

    const s2 = run(s1, { type: "move", direction: "right" }); // E2 → wormhole → A6
    expect(coord(s2.currentMolePosition!)).toBe("A6");
    expect(s2.moveCount).toBe(2);
    expect(s2.lastMove?.ok && s2.lastMove.teleportedTo).toEqual(pos("A6"));
  });

  it("invalid moves keep the position, record lastMove and bump invalidMoveCount", () => {
    const atEdge = run(
      playingState(),
      { type: "move", direction: "right" },
      { type: "move", direction: "right" },
    ); // A6
    const s = run(atEdge, { type: "move", direction: "down" });
    expect(coord(s.currentMolePosition!)).toBe("A6");
    expect(s.moveCount).toBe(2);
    expect(s.invalidMoveCount).toBe(1);
    expect(s.lastMove).toEqual({
      ok: false,
      direction: "down",
      from: pos("A6"),
      reason: "outOfBounds",
    });
    const again = run(s, { type: "move", direction: "left" });
    expect(again.invalidMoveCount).toBe(2);
    expect(again.moveCount).toBe(2);
  });

  it("the start position never changes while playing", () => {
    let state = playingState();
    for (const direction of [
      "down",
      "down",
      "right",
      "upLeft",
      "up",
    ] as Direction[]) {
      state = run(state, { type: "move", direction });
    }
    expect(state.startingPosition).toEqual(pos("B2"));
  });

  it("reveal keeps the position and everything else", () => {
    const playing = run(playingState(), { type: "move", direction: "down" });
    const revealed = run(playing, { type: "reveal" });
    expect(revealed).toEqual({ ...playing, gamePhase: "revealed" });
  });

  it("newRound keeps grid, rocks, wormholes and the previous start; resets the mole, counters and tool", () => {
    const revealed = revealedState();
    expect(revealed.currentMolePosition).not.toEqual(revealed.startingPosition);
    const next = run(revealed, { type: "newRound" });
    expect(next.gamePhase).toBe("setup");
    expect(next.gridSize).toBe(revealed.gridSize);
    expect(next.blockedCells).toEqual(revealed.blockedCells);
    expect(next.wormholes).toEqual(revealed.wormholes);
    expect(next.startingPosition).toEqual(revealed.startingPosition);
    expect(next.currentMolePosition).toEqual(revealed.startingPosition);
    expect(next.selectedTool).toBe("moleStart");
    expect(next.pendingWormholeEntrance).toBeNull();
    expect(next.lastMove).toBeNull();
    expect(next.moveCount).toBe(0);
    expect(next.invalidMoveCount).toBe(0);
  });

  it("newRound also works mid-round (teacher aborts)", () => {
    const next = run(
      playingState(),
      { type: "move", direction: "down" },
      { type: "newRound" },
    );
    expect(next.gamePhase).toBe("setup");
    expect(next.wormholes).toEqual([wormhole("E2", "A6")]);
  });

  it("a new round can start straight away, or after picking a different start", () => {
    const immediate = run(
      revealedState(),
      { type: "newRound" },
      { type: "startRound" },
    );
    expect(immediate.gamePhase).toBe("playing");
    expect(immediate.currentMolePosition).toEqual(pos("B2"));

    const moved = run(revealedState(), { type: "newRound" }, click("F1"), {
      type: "startRound",
    });
    expect(moved.gamePhase).toBe("playing");
    expect(moved.currentMolePosition).toEqual(pos("F1"));
  });

  it("resetGame returns to the initial state from any phase", () => {
    for (const phase of ["setup", "playing", "revealed"] as GamePhase[]) {
      expect(run(STATE_BY_PHASE[phase](), { type: "resetGame" })).toEqual(
        createInitialState(),
      );
    }
  });

  it("move without a current position is a no-op (defensive)", () => {
    const broken: GameState = { ...playingState(), currentMolePosition: null };
    expect(gameReducer(broken, { type: "move", direction: "up" })).toBe(broken);
  });
});

describe("show-Krecik demo toggle", () => {
  it("flips on and off in any phase", () => {
    for (const phase of ["setup", "playing", "revealed"] as GamePhase[]) {
      const base = STATE_BY_PHASE[phase]();
      const on = run(base, { type: "toggleShowMole" });
      expect(on.showMoleDuringPlay).toBe(true);
      expect(on.gamePhase).toBe(phase);
      expect(run(on, { type: "toggleShowMole" }).showMoleDuringPlay).toBe(
        false,
      );
    }
  });

  it("does not touch anything else", () => {
    const base = playingState();
    expect(run(base, { type: "toggleShowMole" })).toEqual({
      ...base,
      showMoleDuringPlay: true,
    });
  });

  it("persists through startRound, moves, reveal, newRound and replayRound", () => {
    let state = run(
      configuredSetup(),
      { type: "toggleShowMole" },
      { type: "startRound" },
    );
    expect(state.showMoleDuringPlay).toBe(true);
    state = run(state, { type: "move", direction: "down" }, { type: "reveal" });
    expect(state.showMoleDuringPlay).toBe(true);
    expect(run(state, { type: "replayRound" }).showMoleDuringPlay).toBe(true);
    expect(run(state, { type: "newRound" }).showMoleDuringPlay).toBe(true);
  });

  it("is cleared by resetGame", () => {
    const state = run(
      configuredSetup(),
      { type: "toggleShowMole" },
      { type: "resetGame" },
    );
    expect(state.showMoleDuringPlay).toBe(false);
  });
});

describe("move history", () => {
  it("records valid moves in order and skips invalid ones", () => {
    // Start B2 on 6×6, C2 blocked, wormhole E2 → A6.
    const state = run(
      playingState(),
      { type: "move", direction: "right" }, // D2
      { type: "move", direction: "right" }, // E2 → A6
      { type: "move", direction: "down" }, // invalid
      { type: "move", direction: "left" }, // invalid
      { type: "move", direction: "up" }, // A5
    );
    expect(state.moveHistory).toEqual(["right", "right", "up"]);
    expect(state.moveCount).toBe(3);
    expect(state.invalidMoveCount).toBe(2);
  });

  it("survives reveal, is cleared by startRound, newRound, replayRound and resetGame", () => {
    const revealed = run(
      playingState(),
      { type: "move", direction: "down" },
      { type: "move", direction: "right" },
      { type: "reveal" },
    );
    expect(revealed.moveHistory).toEqual(["down", "right"]);
    expect(run(revealed, { type: "replayRound" }).moveHistory).toEqual([]);
    expect(run(revealed, { type: "newRound" }).moveHistory).toEqual([]);
    expect(
      run(revealed, { type: "newRound" }, { type: "startRound" }).moveHistory,
    ).toEqual([]);
    expect(run(revealed, { type: "resetGame" }).moveHistory).toEqual([]);
  });

  it("returns a new array on every recorded move", () => {
    const before = playingState();
    const after = run(before, { type: "move", direction: "down" });
    expect(after.moveHistory).not.toBe(before.moveHistory);
    expect(before.moveHistory).toEqual([]);
  });
});

describe("replayRound", () => {
  it("returns to play with the same board and start, mole back on the start, counters reset", () => {
    const revealed = run(
      playingState(),
      { type: "move", direction: "right" },
      { type: "move", direction: "right" }, // now at A6 via wormhole
      { type: "move", direction: "down" }, // invalid
      { type: "reveal" },
    );
    const replay = run(revealed, { type: "replayRound" });
    expect(replay).toEqual({
      ...revealed,
      gamePhase: "playing",
      currentMolePosition: revealed.startingPosition,
      lastMove: null,
      moveCount: 0,
      invalidMoveCount: 0,
      moveHistory: [],
    });
    expect(replay.gridSize).toBe(6);
    expect(replay.blockedCells).toEqual([pos("C2"), pos("D4")]);
    expect(replay.wormholes).toEqual([wormhole("E2", "A6")]);
    expect(replay.startingPosition).toEqual(pos("B2"));
    expect(replay.currentMolePosition).toEqual(pos("B2"));
  });

  it("pressing the recorded path again reproduces the same final position", () => {
    const first = run(
      playingState(),
      { type: "move", direction: "right" },
      { type: "move", direction: "right" },
      { type: "move", direction: "up" },
      { type: "reveal" },
    );
    const again = run(
      first,
      { type: "replayRound" },
      ...first.moveHistory.map((direction): GameAction => ({
        type: "move",
        direction,
      })),
      { type: "reveal" },
    );
    expect(again.currentMolePosition).toEqual(first.currentMolePosition);
    expect(again.moveHistory).toEqual(first.moveHistory);
  });

  it("replaying the recorded history reproduces the final position for 300 random games", () => {
    for (let i = 0; i < 300; i += 1) {
      const seed = 0x4e91_0000 + i;
      const rng = mulberry32(seed);
      const { board, start } = randomBoard(rng);
      const moves = randomDirections(rng, randomInt(rng, 1, 40));

      let state = run(createInitialState(), {
        type: "setGridSize",
        size: board.gridSize,
      });
      state = run(state, tool("moleStart"), click(coord(start)));
      state = run(
        state,
        tool("blocked"),
        ...board.blockedCells.map((cell) => click(coord(cell))),
      );
      state = run(
        state,
        tool("wormholeEntrance"),
        ...board.wormholes.flatMap((w: Wormhole) => [
          click(coord(w.entrance)),
          click(coord(w.destination)),
        ]),
      );
      const first = run(
        state,
        { type: "startRound" },
        ...moves.map((direction): GameAction => ({ type: "move", direction })),
        { type: "reveal" },
      );
      // Replaying only the *recorded* (valid) moves must land in the same place
      // and must all be valid moves this time round.
      const replayed = run(
        first,
        { type: "replayRound" },
        ...first.moveHistory.map((direction): GameAction => ({
          type: "move",
          direction,
        })),
        { type: "reveal" },
      );
      expect(replayed.currentMolePosition, `seed=${seed}`).toEqual(
        first.currentMolePosition,
      );
      expect(replayed.moveHistory, `seed=${seed}`).toEqual(first.moveHistory);
      expect(replayed.invalidMoveCount, `seed=${seed}`).toBe(0);
      expect(replayed.moveCount, `seed=${seed}`).toBe(first.moveHistory.length);
    }
  });

  it("can be replayed several times in a row", () => {
    let state = run(
      playingState(),
      { type: "move", direction: "down" },
      { type: "reveal" },
    );
    for (let round = 0; round < 3; round += 1) {
      state = run(
        state,
        { type: "replayRound" },
        { type: "move", direction: "down" },
        { type: "reveal" },
      );
      expect(coord(state.currentMolePosition!)).toBe("B3");
      expect(state.startingPosition).toEqual(pos("B2"));
    }
  });
});

describe("full-round integration", () => {
  it("spec walkthrough: B2, rock at C2, wormhole D3 → F6, then Right, Down, Down", () => {
    const state = run(
      createInitialState(),
      { type: "setGridSize", size: 6 },
      click("B2"),
      tool("blocked"),
      click("C2"),
      tool("wormholeEntrance"),
      click("D3"),
      click("F6"),
      { type: "startRound" },
      { type: "move", direction: "right" }, // B2 → (C2 rock) → D2
      { type: "move", direction: "down" }, // D2 → D3 → wormhole → F6
      { type: "move", direction: "down" }, // off the board → invalid
      { type: "reveal" },
    );
    expect(state.gamePhase).toBe("revealed");
    expect(coord(state.currentMolePosition!)).toBe("F6");
    expect(state.moveCount).toBe(2);
    expect(state.invalidMoveCount).toBe(1);
  });

  it("reducer path agrees with folding resolveMove directly, for 1,000 random boards", () => {
    for (let i = 0; i < 1_000; i += 1) {
      const seed = 0xfeed_0000 + i;
      const rng = mulberry32(seed);
      const { board, start } = randomBoard(rng);
      const moves = randomDirections(rng, randomInt(rng, 1, 40));

      // Build the board through reducer actions only. The start goes first so
      // the default centre start never blocks a rock or entrance placement.
      let state = run(createInitialState(), {
        type: "setGridSize",
        size: board.gridSize,
      });
      state = run(state, tool("moleStart"), click(coord(start)));
      state = run(
        state,
        tool("blocked"),
        ...board.blockedCells.map((cell) => click(coord(cell))),
      );
      state = run(
        state,
        tool("wormholeEntrance"),
        ...board.wormholes.flatMap((w: Wormhole) => [
          click(coord(w.entrance)),
          click(coord(w.destination)),
        ]),
      );
      state = run(state, { type: "startRound" });

      expect(state.gamePhase, `seed=${seed}`).toBe("playing");
      expect(state.blockedCells, `seed=${seed}`).toEqual(board.blockedCells);
      expect(state.wormholes, `seed=${seed}`).toEqual(board.wormholes);

      let expected: Position = start;
      let validMoves = 0;
      for (const direction of moves) {
        state = gameReducer(state, { type: "move", direction });
        const result = resolveMove(board, expected, direction);
        if (result.ok) {
          expected = result.final;
          validMoves += 1;
        }
        expect(state.currentMolePosition, `seed=${seed}`).toEqual(expected);
      }
      state = gameReducer(state, { type: "reveal" });
      expect(state.currentMolePosition, `seed=${seed}`).toEqual(expected);
      expect(state.moveCount, `seed=${seed}`).toBe(validMoves);
      expect(state.invalidMoveCount, `seed=${seed}`).toBe(
        moves.length - validMoves,
      );
    }
  });
});

describe("immutability", () => {
  it("never mutates the incoming state for any action in any phase", () => {
    const actions: GameAction[] = [
      { type: "setGridSize", size: 9 },
      tool("blocked"),
      tool("wormholeEntrance"),
      tool("wormholeDestination"),
      click("A1"),
      click("F6"),
      { type: "startRound" },
      ...DIRECTIONS.map((direction): GameAction => ({
        type: "move",
        direction,
      })),
      { type: "reveal" },
      { type: "newRound" },
      { type: "replayRound" },
      { type: "toggleShowMole" },
      { type: "resetGame" },
    ];
    for (const phase of ["setup", "playing", "revealed"] as GamePhase[]) {
      for (const action of actions) {
        const before = STATE_BY_PHASE[phase]();
        const snapshot = JSON.parse(JSON.stringify(before)) as GameState;
        // deepFreeze makes any write throw; the reducer must not throw.
        expect(() => gameReducer(deepFreeze(before), action)).not.toThrow();
        expect(before).toEqual(snapshot);
      }
    }
  });

  it("returned arrays are new instances when they change", () => {
    const before = run(createInitialState(), tool("blocked"));
    const after = run(before, click("A1"));
    expect(after.blockedCells).not.toBe(before.blockedCells);
    expect(before.blockedCells).toEqual([]);
  });
});
