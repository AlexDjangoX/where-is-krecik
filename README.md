# Where is Krecik?

A classroom mindfulness and visualisation game. Students first watch a mole move across a garden of holes so the rules become a picture. Then they close their eyes, hold that garden in their imagination, and follow him only by listening.

After a set number of moves the teacher asks: **Where is Krecik?**

The work is inward. Students practise attention, imagination, spatial logic, and the quiet skill of updating a mental picture without looking. There is no timer, no score, and no account. The room finds out together who still knows where he is.

The mole is [Krtek](https://en.wikipedia.org/wiki/Krtek) — _Krecik_ in Polish — the little Czech cartoon who lives underground. The board is his garden: grass squares, dark holes, the occasional rock, and a few tunnels that dump him out somewhere else.

English and Polish share the same board (`/en`, `/pl`). Light and dark themes are in the header.

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The app sends you to `/en` or `/pl`.

---

## The classroom ritual

### Introduce the game with eyes open

Turn on **Show Krecik on every move**. Let the class _see_ him.

He slides from hole to hole. He leaps a rock instead of stopping on it. He pops out of a wormhole exit. This is how the garden becomes something they can later close their eyes and still see. Demo mode is the introduction, not a lesser version of the game.

A first pass can be an empty 3×3. Add a rock or a tunnel only once the class can already follow him with their eyes.

### Then close your eyes

Before the real round begins:

1. Everyone looks at the board one last time — the start hole, any rocks, any wormholes.
2. The teacher asks the students to **close their eyes** and visualise that garden.
3. Krecik is hidden on the screen (demo mode off). The board remains for the teacher; the students are no longer looking at it.
4. The teacher starts the round.

### Listen, and keep him in imagination

The teacher presses each move and **says it out loud**: _up_, _down and right_, _left_. Students do not watch the pad. They move a mole they can only see inwardly.

Each word is a small act of attention. Where is he now? Is there a rock in that line? Does this hole open a tunnel? If a move would leave the garden, he does not go — he is still where he was.

This is the heart of the game: hold a picture, update it, do not peek.

### “Where is Krecik?”

After as many moves as the class can hold — three on a first day, many more later — the teacher asks the question.

Students open their eyes and name the hole (B3, F6, …). Then the teacher presses **Reveal Krecik**. He pops out of the hole he actually reached. The panel shows the coordinate, the number of successful moves, and the path as a row of arrows.

The reveal is a shared check, not a ranking. The useful follow-up is _where did your picture leave the real one?_ Replay the same round with demo mode on if you want to walk the path they just imagined.

---

## Why play this way

**Visualisation.** Closing the eyes turns the board from a picture on the wall into a picture you must keep. Students are not tracking a token on a screen; they are building and revising an inner model.

**Logic.** The garden has a small, consistent physics — eight directions, edges that do not wrap, rocks you leap, one tunnel hop. Following Krecik is applying those rules without looking them up.

**Mindfulness and focus.** The instruction is simple and the stimulus is sparse: a voice, a sequence of directions, a mole in the dark. Students practise staying with one object of attention, inwardly, for a short stretch of time. When the mind wanders, the mole is lost. Coming back to _where is he now?_ is the practice.

**Imagination first, screen second.** The software is a teacher’s instrument. It remembers the true position, refuses illegal moves, and shows the answer when asked. The students’ work happens before anyone looks.

---

## Setting up a round

Everyone can see Krecik during setup. He starts in the centre hole (B2 on a 3×3). The teacher may:

- grow or shrink the board (3×3 up to 10×10)
- click a different start hole
- drop rocks on holes
- draw wormholes (click the entrance, then the exit)

Rocks and wormholes are optional. The start hole is ringed in amber so the class agrees where the story begins.

Then: eyes closed, demo off, start the round.

Three ways to go again after the reveal:

| Button          | What it keeps                                                                                                      |
| --------------- | ------------------------------------------------------------------------------------------------------------------ |
| **Replay game** | Same board, same start. Run it again — often with demo on, so the class can _see_ the path they just held in mind. |
| **New round**   | Same rocks and wormholes; the start hole stays unless you click another.                                           |
| **New game**    | Empty garden, default 3×3, centre start.                                                                           |

---

## How Krecik moves

Coordinates read like a spreadsheet: columns **A–J** left to right, rows **1–10** top to bottom. B2 is the centre of a 3×3.

He can step in eight directions — the four compass points and the four diagonals. One press is one step, except when a rock is in the way.

Resolution is always the same, in this order:

1. Step once in the chosen direction.
2. If that cell is off the board, the move is invalid. **The grid does not wrap.**
3. If the cell is a rock, keep stepping in the same direction. Leaping off the board is also invalid; he stays put.
4. The first open hole is where he **lands**.
5. If that hole is a wormhole entrance, he is sent to that wormhole’s exit. **Exactly one hop.** Exits do not chain, even if you stacked two tunnels.

Rocks he leaps over are skipped; a wormhole sitting _beyond_ the landing hole is not used. Only the hole he actually stops on can teleport him.

A short walkthrough:

> 6×6 board. Start **B2**. Rock on **C2**. Wormhole **D3 → F6**.
>
> - _Right_ — C2 is a rock, so he leaps to **D2**.
> - _Down_ — lands on **D3**, then the tunnel drops him at **F6**.
> - _Down_ — off the board; he stays at **F6**.
>
> _Where is Krecik?_ **F6**, after two successful moves.

Invalid moves shake the board and leave him where he was. If students are playing with eyes closed, the teacher simply says he cannot go that way — that sentence is part of the listening.

---

## Growing the inner picture

Difficulty is how much garden the class must hold, not how fast you speak.

1. **Eyes open, empty 3×3** — watch him, learn the eight directions and the edges.
2. **Eyes closed, empty 3×3** — the first real round. Four cardinals, then diagonals.
3. **Start near a corner** — “off the board” becomes something they have to remember.
4. **One rock** — leap as a new verb, first seen, then imagined.
5. **A short wall of rocks** — leap several cells, or stay put if the wall runs to the edge.
6. **One wormhole** — a jump that is not a step.
7. **Rocks into a wormhole** — leap, land, teleport: two rules in one move, held in the dark.
8. **Larger boards** — more working memory, same physics.

Show each new piece with demo mode on. Hide him and close eyes only once the class has seen the rule become a picture.

---

## Why the board looks like this

The pictures exist so students can later close their eyes and still know what a hole, a rock, and a tunnel _are_.

**A lawn of holes.** Each cell is a tuft of grass with a dark circle in the middle. Students are not tracking squares on graph paper; they are tracking _which hole he is in_.

**Rocks are boulders, not “blocked” tiles.** A stone sits on the grass and covers the hole. There is nowhere to stand, so the only legal idea is _over_. The leap rule is the picture, written in movement.

**Wormholes are two different pictures of the same tunnel.** The entrance is a coloured vortex that sinks inward (a spinning spiral). The exit is the same colour, but the motion comes _out_ of the hole — ripples and a rising arrow. A badge on the entrance names the destination (`→ F6`). Colour is the pairing: violet with violet, sky with sky. You should be able to read a tunnel without a legend, then keep that pairing when your eyes are shut.

**Coordinates stay on the cells** (until the board is large enough that they would clutter). The question _Where is Krecik?_ wants a name the room can say together — _F6_. The labels are small; they are for speaking the answer, not for solving while you look.

**Krecik himself is a character, not a pawn.** When he is allowed to appear he slides between neighbouring holes, and he _pops_ when he is revealed or when a wormhole spits him out. Those two motions match the two kinds of travel: walking, and suddenly being somewhere else. Students who have watched the pop can later imagine it.

**The board shakes when a move is illegal.** The teacher sees it; the class hears that he cannot go that way.

**The control panel floats.** The grid is what the room studies before eyes close. Setup tools, the direction pad, and the reveal sit in a draggable panel so the teacher can park them out of the way on a projector.

Hidden play uses a `?` in the pad’s centre hole. Demo play puts an eye there. The chrome tells the teacher whether the mole is currently a secret.

---

## Controls

During play:

- Direction pad, or **arrow keys** for the cardinals
- **Numpad 1–9** for all eight directions (7/8/9, 4/6, 1/2/3)
- **R** to reveal — the on-screen stand-in for _Where is Krecik?_

The floating panel can be dragged; arrow keys nudge it when the panel itself is focused, and those keys then do not move Krecik.

---

## Run and test

| Script          | Purpose                                     |
| --------------- | ------------------------------------------- |
| `npm run dev`   | Turbopack dev server                        |
| `npm test`      | Vitest — movement rules, reducer, locale UI |
| `npm run build` | Production build                            |

The movement tests are written in teacher language (`B2`, `C2` blocked, `Right` leaps to `D2`) so the rules in this README and the rules in code stay the same document.
