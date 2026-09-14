/**
 * Klondike rules and scoring, as Windows Solitaire played them. Pure: every
 * function returns a new state, or the *same* state object when the action
 * is illegal or a no-op, so callers can test identity.
 *
 * Piles are arrays with the top card last. A location is one of:
 *   { pile: 'stock' } | { pile: 'waste' } |
 *   { pile: 'foundation', index } |
 *   { pile: 'tableau', index, card }   // card = index within the column
 */

export const SUITS = ['spades', 'hearts', 'clubs', 'diamonds']
export const isRed = (suit) => suit % 2 === 1

export const DEFAULT_OPTIONS = { draw: 3, scoring: 'standard', timed: true }

export function makeDeck() {
  const deck = []
  for (let suit = 0; suit < 4; suit++) {
    for (let rank = 1; rank <= 13; rank++) deck.push({ rank, suit, faceUp: false })
  }
  return deck
}

// Fisher–Yates with an injectable RNG so deals are reproducible in tests.
export function shuffle(deck, rng = Math.random) {
  const out = [...deck]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

export function newGame(options = {}, rng = Math.random) {
  const deck = shuffle(makeDeck(), rng)
  const tableau = []
  let pos = 0
  for (let col = 0; col < 7; col++) {
    tableau.push(
      deck.slice(pos, pos + col + 1).map((k, i) => ({ ...k, faceUp: i === col })),
    )
    pos += col + 1
  }
  return {
    stock: deck.slice(pos),
    waste: [],
    foundations: [[], [], [], []],
    tableau,
    options: { ...DEFAULT_OPTIONS, ...options },
    score: 0,
    passes: 0, // recycles so far
    fanned: 0, // how many of the last draw are still fanned on the waste
    seconds: 0,
    started: false,
    won: false,
    undo: null,
  }
}

// --- scoring ---------------------------------------------------------------

const addScore = (state, delta) =>
  state.options.scoring === 'standard' ? Math.max(0, state.score + delta) : state.score

const winBonus = (state) =>
  state.options.timed && state.options.scoring === 'standard' && state.seconds > 30
    ? Math.floor(700000 / state.seconds)
    : 0

// One level of undo: the snapshot carries no undo of its own.
const snapshot = (state) => ({ ...state, undo: null })

export const isWon = (state) => state.foundations.every((f) => f.length === 13)

// --- moving cards ------------------------------------------------------------

// The cards a location would lift, and the pile left behind. Null if nothing
// can be lifted from there.
function lift(state, from) {
  switch (from.pile) {
    case 'waste': {
      if (!state.waste.length) return null
      return { cards: state.waste.slice(-1), rest: state.waste.slice(0, -1) }
    }
    case 'foundation': {
      const pile = state.foundations[from.index]
      if (!pile?.length) return null
      return { cards: pile.slice(-1), rest: pile.slice(0, -1) }
    }
    case 'tableau': {
      const col = state.tableau[from.index]
      const card = col?.[from.card]
      if (!card || !card.faceUp) return null
      return { cards: col.slice(from.card), rest: col.slice(0, from.card) }
    }
    default:
      return null
  }
}

export function canDrop(state, cards, to) {
  if (!cards?.length) return false
  const [first] = cards
  if (to.pile === 'foundation') {
    if (cards.length !== 1) return false
    const top = state.foundations[to.index].at(-1)
    return top ? top.suit === first.suit && first.rank === top.rank + 1 : first.rank === 1
  }
  if (to.pile === 'tableau') {
    const top = state.tableau[to.index].at(-1)
    return top
      ? top.faceUp && isRed(top.suit) !== isRed(first.suit) && top.rank === first.rank + 1
      : first.rank === 13
  }
  return false
}

export function moveCards(state, from, to) {
  if (state.won) return state
  if (from.pile === to.pile && from.index === to.index) return state
  // Shuffling an ace between empty foundations is legal by the letter and
  // pointless; sol.exe didn't allow it either.
  if (from.pile === 'foundation' && to.pile === 'foundation') return state
  const lifted = lift(state, from)
  if (!lifted || !canDrop(state, lifted.cards, to)) return state

  const next = {
    ...state,
    foundations: [...state.foundations],
    tableau: [...state.tableau],
  }
  let delta = 0

  switch (from.pile) {
    case 'waste':
      next.waste = lifted.rest
      next.fanned = Math.max(0, state.fanned - 1)
      break
    case 'foundation':
      next.foundations[from.index] = lifted.rest
      break
    case 'tableau': {
      let rest = lifted.rest
      const exposed = rest.at(-1)
      if (exposed && !exposed.faceUp) {
        rest = [...rest.slice(0, -1), { ...exposed, faceUp: true }]
        delta += 5
      }
      next.tableau[from.index] = rest
      break
    }
  }

  if (to.pile === 'foundation') {
    next.foundations[to.index] = [...state.foundations[to.index], ...lifted.cards]
    delta += 10
  } else {
    next.tableau[to.index] = [...state.tableau[to.index], ...lifted.cards]
    if (from.pile === 'waste') delta += 5
    if (from.pile === 'foundation') delta -= 15
  }

  next.score = addScore(state, delta)
  next.won = isWon(next)
  if (next.won) next.score = addScore(next, winBonus(next))
  next.started = true
  next.undo = snapshot(state)
  return next
}

// Double-click: the top card of the waste or a column goes to the first
// foundation that will take it.
export function autoMove(state, from) {
  if (from.pile === 'tableau' && from.card !== state.tableau[from.index].length - 1) {
    return state
  }
  if (from.pile === 'foundation' || from.pile === 'stock') return state
  const lifted = lift(state, from)
  if (!lifted) return state
  for (let index = 0; index < 4; index++) {
    const to = { pile: 'foundation', index }
    if (canDrop(state, lifted.cards, to)) return moveCards(state, from, to)
  }
  return state
}

// --- stock ----------------------------------------------------------------------

export function drawFromStock(state) {
  if (state.won) return state
  if (state.stock.length) {
    const n = Math.min(state.options.draw, state.stock.length)
    // Three cards flipped as a block: the one that was third from the top
    // lands on top of the waste.
    const drawn = state.stock
      .slice(-n)
      .reverse()
      .map((k) => ({ ...k, faceUp: true }))
    return {
      ...state,
      stock: state.stock.slice(0, -n),
      waste: [...state.waste, ...drawn],
      fanned: n,
      started: true,
      undo: snapshot(state),
    }
  }
  if (state.waste.length) {
    // Turn the waste over as a block: its top becomes the stock's bottom, so
    // the next pass deals in the same order as the last.
    const passes = state.passes + 1
    const penalty =
      state.options.draw === 1 ? -100 : passes >= 4 ? -20 : 0
    return {
      ...state,
      stock: [...state.waste].reverse().map((k) => ({ ...k, faceUp: false })),
      waste: [],
      passes,
      fanned: 0,
      score: addScore(state, penalty),
      started: true,
      undo: snapshot(state),
    }
  }
  return state
}

// --- the rest -----------------------------------------------------------------------

// The snapshot restores the piles and the score, but the clock keeps its
// current reading — sol.exe never gave the seconds back.
export const undo = (state) =>
  state.undo ? { ...state.undo, seconds: state.seconds } : state

export function tick(state) {
  if (!state.started || state.won) return state
  const seconds = state.seconds + 1
  const penalty = state.options.timed && seconds % 10 === 0 ? -2 : 0
  return { ...state, seconds, score: addScore(state, penalty) }
}

// Instant win for visitors who want the cascade without the game. No score.
export function solve(state) {
  const foundations = [0, 1, 2, 3].map((suit) =>
    Array.from({ length: 13 }, (_, i) => ({ rank: i + 1, suit, faceUp: true })),
  )
  return {
    ...state,
    stock: [],
    waste: [],
    foundations,
    tableau: [[], [], [], [], [], [], []],
    fanned: 0,
    started: true,
    won: true,
    undo: null,
  }
}
