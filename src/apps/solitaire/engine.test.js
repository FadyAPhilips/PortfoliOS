import { describe, expect, it } from 'vitest'
import {
  autoMove,
  canDrop,
  drawFromStock,
  isRed,
  isWon,
  makeDeck,
  moveCards,
  newGame,
  shuffle,
  solve,
  tick,
  undo,
} from './engine'

// Suits: 0 spades, 1 hearts, 2 clubs, 3 diamonds.
const c = (rank, suit, faceUp = true) => ({ rank, suit, faceUp })

// A small LCG so shuffles are reproducible in tests.
const seeded = (seed) => () => {
  seed = (seed * 1664525 + 1013904223) % 4294967296
  return seed / 4294967296
}

// An empty table to build specific situations on.
const empty = (overrides = {}) => ({
  stock: [],
  waste: [],
  foundations: [[], [], [], []],
  tableau: [[], [], [], [], [], [], []],
  options: { draw: 3, scoring: 'standard', timed: true },
  score: 0,
  passes: 0,
  fanned: 0,
  seconds: 0,
  started: false,
  won: false,
  undo: null,
  ...overrides,
})

const tableauWith = (columns, overrides) =>
  empty({
    tableau: [0, 1, 2, 3, 4, 5, 6].map((i) => columns[i] ?? []),
    ...overrides,
  })

describe('deck', () => {
  it('makeDeck has 52 unique face-down cards', () => {
    const deck = makeDeck()
    expect(deck).toHaveLength(52)
    expect(new Set(deck.map((k) => `${k.rank}-${k.suit}`)).size).toBe(52)
    expect(deck.every((k) => k.faceUp === false)).toBe(true)
  })

  it('shuffle is a reproducible permutation that does not mutate its input', () => {
    const deck = makeDeck()
    const a = shuffle(deck, seeded(7))
    const b = shuffle(deck, seeded(7))
    expect(a).toEqual(b)
    expect(a).not.toEqual(deck)
    expect([...a].sort((x, y) => x.suit - y.suit || x.rank - y.rank)).toEqual(deck)
    expect(deck[0]).toEqual({ rank: 1, suit: 0, faceUp: false })
  })

  it('isRed: hearts and diamonds', () => {
    expect([0, 1, 2, 3].map(isRed)).toEqual([false, true, false, true])
  })
})

describe('newGame', () => {
  const g = newGame({}, seeded(1))

  it('deals columns of 1..7 with only the last card face up', () => {
    expect(g.tableau.map((col) => col.length)).toEqual([1, 2, 3, 4, 5, 6, 7])
    for (const col of g.tableau) {
      expect(col.slice(0, -1).every((k) => !k.faceUp)).toBe(true)
      expect(col.at(-1).faceUp).toBe(true)
    }
  })

  it('puts the remaining 24 in the stock face down, nothing elsewhere', () => {
    expect(g.stock).toHaveLength(24)
    expect(g.stock.every((k) => !k.faceUp)).toBe(true)
    expect(g.waste).toEqual([])
    expect(g.foundations).toEqual([[], [], [], []])
  })

  it('defaults to Draw Three, Standard scoring, timed — like Windows', () => {
    expect(g.options).toEqual({ draw: 3, scoring: 'standard', timed: true })
    expect(g.score).toBe(0)
    expect(g.started).toBe(false)
    expect(g.undo).toBeNull()
  })

  it('honours options', () => {
    const one = newGame({ draw: 1, scoring: 'none', timed: false }, seeded(1))
    expect(one.options).toEqual({ draw: 1, scoring: 'none', timed: false })
  })
})

describe('drawFromStock', () => {
  it('Draw Three moves three cards face up with the last drawn on top', () => {
    const s = empty({ stock: [c(1, 0, false), c(2, 0, false), c(3, 0, false), c(4, 0, false)] })
    const n = drawFromStock(s)
    expect(n.stock).toEqual([c(1, 0, false)])
    expect(n.waste).toEqual([c(4, 0), c(3, 0), c(2, 0)])
    expect(n.started).toBe(true)
    expect(n.undo).toEqual(s)
  })

  it('Draw One moves one card', () => {
    const s = empty({ options: { draw: 1, scoring: 'standard', timed: true }, stock: [c(1, 0, false), c(2, 0, false)] })
    expect(drawFromStock(s).waste).toEqual([c(2, 0)])
  })

  it('draws fewer when fewer remain', () => {
    const s = empty({ stock: [c(1, 0, false), c(2, 0, false)] })
    expect(drawFromStock(s).waste).toHaveLength(2)
  })

  it('recycles the waste back to the stock, face down, reversed, counting a pass', () => {
    const s = empty({ waste: [c(3, 0), c(2, 0), c(1, 0)] })
    const n = drawFromStock(s)
    expect(n.stock).toEqual([c(1, 0, false), c(2, 0, false), c(3, 0, false)])
    expect(n.waste).toEqual([])
    expect(n.passes).toBe(1)
  })

  it('is a no-op when both stock and waste are empty', () => {
    const s = empty()
    expect(drawFromStock(s)).toBe(s)
  })

  it('tracks how many of the last draw are still fanned on the waste', () => {
    // Third from the top lands on top of the waste, so the ace goes there.
    let s = empty({ stock: [c(4, 0, false), c(1, 0, false), c(2, 0, false), c(3, 0, false)] })
    s = drawFromStock(s)
    expect(s.fanned).toBe(3)
    expect(s.waste.at(-1)).toEqual(c(1, 0))
    // Playing the top card leaves the other two where they were.
    s = moveCards(s, { pile: 'waste' }, { pile: 'foundation', index: 0 })
    expect(s.fanned).toBe(2)
    // The next draw fans only what it drew.
    s = drawFromStock(s)
    expect(s.fanned).toBe(1)
    // Recycling clears it.
    s = drawFromStock(s) // stock empty -> recycle
    expect(s.fanned).toBe(0)
  })

  describe('recycle penalties', () => {
    it('Draw One: −100 on every recycle', () => {
      const s = empty({ options: { draw: 1, scoring: 'standard', timed: true }, waste: [c(1, 0)], score: 500 })
      expect(drawFromStock(s).score).toBe(400)
    })

    it('Draw Three: nothing until the fourth recycle, then −20 each', () => {
      let s = empty({ waste: [c(1, 0)], score: 500, passes: 2 })
      s = drawFromStock(s) // third recycle
      expect(s.score).toBe(500)
      s = drawFromStock(s) // stock -> waste
      s = drawFromStock(s) // fourth recycle
      expect(s.passes).toBe(4)
      expect(s.score).toBe(480)
    })

    it('floors at zero', () => {
      const s = empty({ options: { draw: 1, scoring: 'standard', timed: true }, waste: [c(1, 0)], score: 30 })
      expect(drawFromStock(s).score).toBe(0)
    })

    it("does not apply with scoring 'none'", () => {
      const s = empty({ options: { draw: 1, scoring: 'none', timed: true }, waste: [c(1, 0)], score: 500 })
      expect(drawFromStock(s).score).toBe(500)
    })
  })
})

describe('canDrop', () => {
  const foundation = (index) => ({ pile: 'foundation', index })
  const column = (index) => ({ pile: 'tableau', index })

  it('foundation: an ace on an empty pile, then same suit ascending', () => {
    const s = empty({ foundations: [[], [c(1, 1)], [], []] })
    expect(canDrop(s, [c(1, 0)], foundation(0))).toBe(true)
    expect(canDrop(s, [c(2, 0)], foundation(0))).toBe(false)
    expect(canDrop(s, [c(2, 1)], foundation(1))).toBe(true)
    expect(canDrop(s, [c(2, 3)], foundation(1))).toBe(false) // wrong suit
    expect(canDrop(s, [c(3, 1)], foundation(1))).toBe(false) // skips a rank
  })

  it('foundation: never more than one card', () => {
    const s = empty()
    expect(canDrop(s, [c(1, 0), c(2, 0)], foundation(0))).toBe(false)
  })

  it('tableau: only a king on an empty column', () => {
    const s = empty()
    expect(canDrop(s, [c(13, 0)], column(0))).toBe(true)
    expect(canDrop(s, [c(12, 0)], column(0))).toBe(false)
  })

  it('tableau: alternate colour, one rank lower, onto a face-up top', () => {
    const s = tableauWith([[c(8, 0)], [c(8, 0, false)]])
    expect(canDrop(s, [c(7, 1)], column(0))).toBe(true) // red 7 on black 8
    expect(canDrop(s, [c(7, 0)], column(0))).toBe(false) // same colour
    expect(canDrop(s, [c(6, 1)], column(0))).toBe(false) // wrong rank
    expect(canDrop(s, [c(7, 1)], column(1))).toBe(false) // top is face down
  })

  it('tableau: a run is judged by its first card', () => {
    const s = tableauWith([[c(8, 0)]])
    expect(canDrop(s, [c(7, 1), c(6, 2)], column(0))).toBe(true)
  })
})

describe('moveCards', () => {
  it('waste → tableau scores +5', () => {
    const s = tableauWith([[c(8, 0)]], { waste: [c(7, 1)] })
    const n = moveCards(s, { pile: 'waste' }, { pile: 'tableau', index: 0 })
    expect(n.waste).toEqual([])
    expect(n.tableau[0]).toEqual([c(8, 0), c(7, 1)])
    expect(n.score).toBe(5)
    expect(n.started).toBe(true)
    expect(n.undo).toEqual(s)
  })

  it('waste → foundation scores +10', () => {
    const s = empty({ waste: [c(1, 2)] })
    const n = moveCards(s, { pile: 'waste' }, { pile: 'foundation', index: 0 })
    expect(n.foundations[0]).toEqual([c(1, 2)])
    expect(n.score).toBe(10)
  })

  it('tableau → foundation scores +10', () => {
    const s = tableauWith([[c(1, 2)]])
    const n = moveCards(s, { pile: 'tableau', index: 0, card: 0 }, { pile: 'foundation', index: 3 })
    expect(n.foundations[3]).toEqual([c(1, 2)])
    expect(n.tableau[0]).toEqual([])
    expect(n.score).toBe(10)
  })

  it('foundation → tableau scores −15, floored at 0', () => {
    const s = tableauWith([[c(8, 0)]], { foundations: [[c(7, 1)], [], [], []], score: 10 })
    const n = moveCards(s, { pile: 'foundation', index: 0 }, { pile: 'tableau', index: 0 })
    expect(n.foundations[0]).toEqual([])
    expect(n.tableau[0]).toEqual([c(8, 0), c(7, 1)])
    expect(n.score).toBe(0)
  })

  it('tableau → tableau scores 0 but turning the exposed card scores +5', () => {
    const s = tableauWith([[c(8, 0)], [c(12, 3, false), c(7, 1)]])
    const n = moveCards(s, { pile: 'tableau', index: 1, card: 1 }, { pile: 'tableau', index: 0 })
    expect(n.tableau[0]).toEqual([c(8, 0), c(7, 1)])
    expect(n.tableau[1]).toEqual([c(12, 3)])
    expect(n.score).toBe(5)
  })

  it('moves a whole face-up run', () => {
    const s = tableauWith([[c(9, 1)], [c(8, 0), c(7, 1), c(6, 2)]])
    const n = moveCards(s, { pile: 'tableau', index: 1, card: 0 }, { pile: 'tableau', index: 0 })
    expect(n.tableau[0]).toEqual([c(9, 1), c(8, 0), c(7, 1), c(6, 2)])
    expect(n.tableau[1]).toEqual([])
  })

  it('refuses a face-down source card and an illegal target, returning the same state', () => {
    const s = tableauWith([[c(8, 0)], [c(7, 1, false), c(6, 2)]])
    expect(moveCards(s, { pile: 'tableau', index: 1, card: 0 }, { pile: 'tableau', index: 0 })).toBe(s)
    expect(moveCards(s, { pile: 'tableau', index: 1, card: 1 }, { pile: 'tableau', index: 0 })).toBe(s)
  })

  it("scores nothing with scoring 'none'", () => {
    const s = empty({ waste: [c(1, 2)], options: { draw: 3, scoring: 'none', timed: true } })
    expect(moveCards(s, { pile: 'waste' }, { pile: 'foundation', index: 0 }).score).toBe(0)
  })

  it('marks the win and adds the timed bonus on the last card', () => {
    const full = (suit) => Array.from({ length: 13 }, (_, i) => c(i + 1, suit))
    const s = empty({
      foundations: [full(0), full(1), full(2), full(3).slice(0, 12)],
      waste: [c(13, 3)],
      seconds: 100,
      score: 600,
      started: true,
    })
    const n = moveCards(s, { pile: 'waste' }, { pile: 'foundation', index: 3 })
    expect(isWon(n)).toBe(true)
    expect(n.won).toBe(true)
    // 600 + 10 for the card + floor(700000 / 100)
    expect(n.score).toBe(600 + 10 + 7000)
  })

  it('gives no bonus under 30 seconds or when untimed', () => {
    const full = (suit) => Array.from({ length: 13 }, (_, i) => c(i + 1, suit))
    const base = {
      foundations: [full(0), full(1), full(2), full(3).slice(0, 12)],
      waste: [c(13, 3)],
      started: true,
    }
    const quick = moveCards(empty({ ...base, seconds: 20 }), { pile: 'waste' }, { pile: 'foundation', index: 3 })
    expect(quick.score).toBe(10)
    const untimed = moveCards(
      empty({ ...base, seconds: 100, options: { draw: 3, scoring: 'standard', timed: false } }),
      { pile: 'waste' },
      { pile: 'foundation', index: 3 },
    )
    expect(untimed.score).toBe(10)
  })
})

describe('autoMove', () => {
  it('sends the waste top to the first foundation that takes it', () => {
    const s = empty({ waste: [c(1, 2)], foundations: [[c(1, 0)], [], [], []] })
    const n = autoMove(s, { pile: 'waste' })
    expect(n.foundations[1]).toEqual([c(1, 2)])
    expect(n.score).toBe(10)
  })

  it('sends a tableau top card up', () => {
    const s = tableauWith([[c(5, 0, false), c(2, 1)]], { foundations: [[c(1, 1)], [], [], []] })
    const n = autoMove(s, { pile: 'tableau', index: 0, card: 1 })
    expect(n.foundations[0]).toEqual([c(1, 1), c(2, 1)])
    expect(n.tableau[0]).toEqual([c(5, 0)]) // flipped
    expect(n.score).toBe(15)
  })

  it('ignores a card that is not the top of its column, and one with no home', () => {
    const s = tableauWith([[c(8, 0), c(7, 1)]])
    expect(autoMove(s, { pile: 'tableau', index: 0, card: 0 })).toBe(s)
    expect(autoMove(s, { pile: 'tableau', index: 0, card: 1 })).toBe(s)
  })
})

describe('undo', () => {
  it('restores the previous state including the score, one level only', () => {
    const s = empty({ waste: [c(1, 2)] })
    const moved = moveCards(s, { pile: 'waste' }, { pile: 'foundation', index: 0 })
    expect(moved.score).toBe(10)
    const back = undo(moved)
    expect(back).toEqual(s)
    expect(undo(back)).toBe(back)
  })

  it('does not rewind the clock — sol.exe never gave the seconds back', () => {
    const s = empty({ waste: [c(1, 2)], started: true, seconds: 40 })
    let moved = moveCards(s, { pile: 'waste' }, { pile: 'foundation', index: 0 })
    moved = tick(tick(tick(moved)))
    expect(moved.seconds).toBe(43)
    const back = undo(moved)
    expect(back.foundations[0]).toEqual([])
    expect(back.seconds).toBe(43)
  })

  it('never walks back more than one move', () => {
    const s = empty({ waste: [c(1, 2), c(1, 0)] })
    const m1 = moveCards(s, { pile: 'waste' }, { pile: 'foundation', index: 0 })
    const m2 = moveCards(m1, { pile: 'waste' }, { pile: 'foundation', index: 1 })
    const back = undo(m2)
    expect(back.foundations[0]).toEqual([c(1, 0)])
    expect(back.foundations[1]).toEqual([])
    expect(undo(back)).toBe(back)
  })
})

describe('tick', () => {
  it('does nothing before the first move or after winning', () => {
    const s = empty()
    expect(tick(s)).toBe(s)
    const w = empty({ started: true, won: true })
    expect(tick(w)).toBe(w)
  })

  it('counts seconds and takes 2 points every 10 s when timed and standard', () => {
    let s = empty({ started: true, score: 100 })
    for (let i = 0; i < 10; i++) s = tick(s)
    expect(s.seconds).toBe(10)
    expect(s.score).toBe(98)
    s = tick(s)
    expect(s.score).toBe(98)
  })

  it('takes nothing when untimed or unscored', () => {
    let a = empty({ started: true, score: 100, options: { draw: 3, scoring: 'standard', timed: false } })
    let b = empty({ started: true, score: 100, options: { draw: 3, scoring: 'none', timed: true } })
    for (let i = 0; i < 10; i++) {
      a = tick(a)
      b = tick(b)
    }
    expect(a.score).toBe(100)
    expect(b.score).toBe(100)
  })
})

describe('solve', () => {
  it('fills the foundations, empties everything else, wins, keeps the score', () => {
    const g = newGame({}, seeded(3))
    const s = solve({ ...g, score: 42 })
    expect(s.won).toBe(true)
    expect(isWon(s)).toBe(true)
    expect(s.foundations.map((f) => f.length)).toEqual([13, 13, 13, 13])
    for (let suit = 0; suit < 4; suit++) {
      expect(s.foundations[suit].map((k) => k.rank)).toEqual(Array.from({ length: 13 }, (_, i) => i + 1))
      expect(s.foundations[suit].every((k) => k.suit === suit && k.faceUp)).toBe(true)
    }
    expect(s.stock).toEqual([])
    expect(s.waste).toEqual([])
    expect(s.tableau.every((col) => col.length === 0)).toBe(true)
    expect(s.score).toBe(42)
    expect(s.undo).toBeNull()
  })
})
