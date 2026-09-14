# Solitaire — design

Approved in chat 2026-09-13. Records decisions; not a tutorial.

## Goal

A faithful Windows 98 `sol.exe`: Klondike with Draw One / Draw Three,
Standard or no scoring, timed play, one-level Undo, a Deck picker, and the
bouncing-cards cascade across the whole desktop on a win. Plus one thing
sol.exe never had: a **Solve** button, so a visitor can see the cascade
without playing a full game.

**Amended 2026-09-14:** card faces and backs were originally drawn as SVG in
the Win98 spirit. They now come from a supplied sprite sheet
(`src/assets/solitaire/cards.png`) — the Windows Solitaire deck itself. See
the Table section below.

## Approach

Pure engine + DOM cards + one portal canvas for the cascade.

- `engine.js` is pure and fully unit-tested, with an injectable RNG.
- Cards are DOM elements with inline-SVG faces; dragging mirrors
  `useWindowGestures` — write `transform` during the gesture, one dispatch
  on drop.
- The cascade is a `createPortal` canvas at `document.body`, never cleared,
  which is what produces the trails.

## Engine (`src/apps/solitaire/engine.js`)

State: `stock`, `waste`, `foundations[4]`, `tableau[7]`,
`options { draw: 1|3, scoring: 'standard'|'none', timed }`, `score`,
`passes` (recycles so far), `seconds`, `started`, `won`, `undo` (one prior
snapshot or null). Card: `{ rank 1–13, suit 0–3, faceUp }`; red suits are
odd (1 hearts, 3 diamonds). Defaults match Windows: Draw Three, Standard,
Timed on.

Every function returns a new state, or the **same state object** when the
action is illegal or a no-op — callers and tests can check identity.

- `newGame(options, rng)` — Fisher–Yates with `rng()`; columns of 1..7 with
  only the last card face up; 24 to stock.
- `drawFromStock` — moves `min(draw, stock)` to the waste face up, last
  drawn on top. Empty stock + non-empty waste → recycle: waste reversed
  back to stock face down, `passes + 1`, penalty below.
- `canDrop(cards, to)` — foundation: single card, ace on empty else same
  suit and rank + 1. Tableau: king on empty else alternate colour and
  rank − 1 on a face-up top.
- `moveCards(from, to)` — `from` is the waste top, a foundation top, or a
  face-up run in a tableau column (`{ pile: 'tableau', index, card }`);
  `to` is a foundation or a tableau column. Flips a newly exposed tableau
  card. Sets `undo`, `started`, and `won` (+ win bonus).
- `autoMove(from)` — double-click: the top card of the waste or a column to
  the first foundation that accepts it.
- `undo` — restores the snapshot (piles and score) but keeps the current
  clock; sol.exe never gave the seconds back. One level.
- `tick` — `seconds + 1` while started and not won; timed + standard loses
  2 every 10 s.
- `solve` — foundations become four complete suits, everything else empties,
  `won = true`, score unchanged, no bonus.
- `isWon` — four foundations of 13.

**Standard scoring** (reconstructed from the Windows help text): +10 card to
foundation; +5 waste → tableau; +5 turning a tableau card; −15 foundation →
tableau; Draw One loses 100 on every recycle; Draw Three loses 20 on each
recycle from the fourth on; timed loses 2 per 10 s; win bonus
`floor(700000 / seconds)` when timed and over 30 s. Score floors at 0.
`scoring: 'none'` disables all of it.

## Table (`layout.js`, `CardFace.jsx`, `backs.jsx`)

All geometry in **71×96 card units**: margin 8, column pitch 83 (71 + 12),
top row at y 8 (stock col 0, waste col 1, foundations cols 3–6), tableau at
y 120; face-down cards fan 3 px, face-up 15 px; Draw Three fans the waste
14 px. `layout.js` exposes the rect of every slot and `hitTest(point)` so
drops never measure the DOM.

A `ResizeObserver` on the felt applies a single `transform: scale()` so the
table shrinks to fit narrow or compact windows; the maths never changes.
Default window 616×520 fits the table at 1:1.

**Amended 2026-09-14 — sprite sheet.** `src/assets/solitaire/cards.png` is
13 columns x 6 rows of 71x96 cells, exactly `CARD_W`/`CARD_H`. Rows 0-3 are
the suits in the engine's order, ace to king, so a face is
`(col = rank - 1, row = suit)`. Row 4-5 hold twelve backs (four animated,
first frames only), a green O marker for an empty stock, a red X (unused —
recycles are unlimited here) and blank cells. Cards are divs offset by
`background-position`, with `--cards-sheet` set once on `.sol`. Stable key
`suit * 13 + rank` so React moves nodes rather than remounting. The SVG
`CardDefs` and the `rasterize.js` helper this replaced are deleted.

## Interaction

- Click stock → draw. Empty stock shows the ring; clicking it recycles.
- Drag a face-up tableau card (with everything under it), the waste top, or
  a foundation top. Pointer capture on the card; the run follows via
  `transform`; on release, `hitTest` picks the target, `moveCards` if legal,
  snap back if not. No dispatch until drop.
- Double-click a playable card → `autoMove`.

## Chrome

- `MenuBar` gains real menus: an item with a `menu` array drops a Win98
  panel on click (raised border, navy hover, separators, disabled greyed;
  Escape / outside click closes). Items without `menu` stay decorative, so
  Notepad and Explorer are unaffected.
- **Game:** Deal (F2) · Undo (disabled when null) · Solve · ── · Deck… ·
  Options… · ── · Exit (closes the window).
- **Help:** About Solitaire… (small dialog).
- **Options…** (modal in-window): Draw one / Draw three; Scoring Standard /
  None; Timed game; Status bar; OK / Cancel. Changing Draw or Scoring
  redeals; the other two apply immediately.
- **Deck…**: six backs in a grid; OK / Cancel. Session-only.
- **Status bar:** `Score: N` · `Time: N` · `[Solve]`. Hidden when the option
  is off. Timer starts on the first move, stops on win.

## Cascade (`WinAnimation.jsx`)

Portal canvas at `document.body`, fixed full-viewport, `Z.OVERLAY` (2000).
At the instant of winning it measures the four foundation slots'
`getBoundingClientRect()` — the only DOM measurement in the game — so cards
launch from where they are at the current scale. Faces are pre-rasterized
from the SVG components once at win time.

Physics as sol.exe: top card of each foundation in turn; random horizontal
velocity and small upward kick; gravity per frame; on the bottom edge `vy`
reverses at ~0.8; the card bounces until off-screen sideways, then the next
launches. The canvas is never cleared.

Any click or key ends it immediately. Either way it finishes with a
"Deal again?" Yes / No dialog. Unmount cancels the frame loop and removes
the canvas.

## Files

`src/apps/solitaire/` — `engine.js` + test, `layout.js` + test,
`Solitaire.jsx`, `CardFace.jsx`, `backs.jsx`, `useCardDrag.js`,
`WinAnimation.jsx`, `OptionsDialog.jsx`, `DeckDialog.jsx`.
Also `styles/solitaire.css`, the `MenuBar` extension, `Z.OVERLAY` in
`constants.js`, the registry size, CLAUDE.md.

## Tests

vitest on the pure modules only: deal shape; the legality matrix; every
scoring line including both recycle penalties; undo round-trips; `tick`;
`isWon`; win bonus; `solve`; layout rects and `hitTest`.

## Build order

1. Engine + tests
2. Layout, faces, backs — a static rendered deal
3. Click, drag, double-click
4. Menus and dialogs
5. Score, timer, Solve
6. Cascade
7. Docs

Each step leaves the app building. The Solve button is the test hook for
verifying the cascade in a real browser.
