import { describe, expect, it } from 'vitest'
import {
  CARD_H,
  CARD_W,
  FAN_DOWN,
  FAN_UP,
  MARGIN,
  PITCH,
  TABLEAU_Y,
  TABLE_H,
  TABLE_W,
  TOP_Y,
  WASTE_FAN,
  cardRect,
  hitTest,
  slotRect,
} from './layout'

const c = (rank, suit, faceUp = true) => ({ rank, suit, faceUp })

const state = (overrides = {}) => ({
  stock: [],
  waste: [],
  foundations: [[], [], [], []],
  tableau: [[], [], [], [], [], [], []],
  options: { draw: 3, scoring: 'standard', timed: true },
  fanned: 0,
  ...overrides,
})

describe('constants', () => {
  it('uses Win98 card metrics', () => {
    expect([CARD_W, CARD_H]).toEqual([71, 96])
    expect(PITCH).toBe(CARD_W + 12)
    expect([FAN_DOWN, FAN_UP, WASTE_FAN]).toEqual([3, 15, 14])
  })

  it('table is seven columns wide with margins, tall enough for the longest column', () => {
    expect(TABLE_W).toBe(MARGIN * 2 + 6 * PITCH + CARD_W)
    // 6 face-down under a 13-card face-up run, plus a bottom margin.
    expect(TABLE_H).toBe(TABLEAU_Y + 6 * FAN_DOWN + 12 * FAN_UP + CARD_H + MARGIN)
  })
})

describe('slotRect', () => {
  it('places stock, waste and foundations on the top row', () => {
    expect(slotRect({ pile: 'stock' })).toEqual({ x: MARGIN, y: TOP_Y, w: CARD_W, h: CARD_H })
    expect(slotRect({ pile: 'waste' })).toEqual({ x: MARGIN + PITCH, y: TOP_Y, w: CARD_W, h: CARD_H })
    for (let i = 0; i < 4; i++) {
      expect(slotRect({ pile: 'foundation', index: i })).toEqual({
        x: MARGIN + (3 + i) * PITCH,
        y: TOP_Y,
        w: CARD_W,
        h: CARD_H,
      })
    }
  })

  it('places tableau columns below', () => {
    for (let i = 0; i < 7; i++) {
      expect(slotRect({ pile: 'tableau', index: i })).toEqual({
        x: MARGIN + i * PITCH,
        y: TABLEAU_Y,
        w: CARD_W,
        h: CARD_H,
      })
    }
  })
})

describe('cardRect', () => {
  it('fans a tableau column: 3px under face-down cards, 15px under face-up', () => {
    const s = state({ tableau: [[c(5, 0, false), c(6, 0, false), c(7, 0), c(8, 0)]] })
    const ys = [0, 1, 2, 3].map((j) => cardRect(s, { pile: 'tableau', index: 0, card: j }).y)
    expect(ys).toEqual([TABLEAU_Y, TABLEAU_Y + 3, TABLEAU_Y + 6, TABLEAU_Y + 21])
    expect(cardRect(s, { pile: 'tableau', index: 0, card: 3 }).x).toBe(MARGIN)
  })

  it('fans only the last draw on the waste, 14px each, from the bottom up', () => {
    const s = state({ waste: [c(1, 0), c(2, 0), c(3, 0), c(4, 0), c(5, 0)], fanned: 3 })
    const base = MARGIN + PITCH
    const xs = [0, 1, 2, 3, 4].map((i) => cardRect(s, { pile: 'waste', card: i }).x)
    expect(xs).toEqual([base, base, base, base + 14, base + 28])
  })

  it('stacks foundation and stock cards on their slot', () => {
    const s = state({ foundations: [[c(1, 0), c(2, 0)], [], [], []], stock: [c(9, 1, false)] })
    expect(cardRect(s, { pile: 'foundation', index: 0, card: 1 })).toEqual(slotRect({ pile: 'foundation', index: 0 }))
    expect(cardRect(s, { pile: 'stock', card: 0 })).toEqual(slotRect({ pile: 'stock' }))
  })
})

describe('hitTest', () => {
  const s = state()

  it('finds a foundation from a point inside its slot', () => {
    const r = slotRect({ pile: 'foundation', index: 2 })
    expect(hitTest(s, { x: r.x + 10, y: r.y + 10 })).toEqual({ pile: 'foundation', index: 2 })
  })

  it('finds a tableau column from anywhere in its band below the top row', () => {
    const r = slotRect({ pile: 'tableau', index: 4 })
    expect(hitTest(s, { x: r.x + 35, y: r.y + 5 })).toEqual({ pile: 'tableau', index: 4 })
    expect(hitTest(s, { x: r.x + 35, y: TABLE_H - 1 })).toEqual({ pile: 'tableau', index: 4 })
  })

  it('returns null over the stock, the waste, the empty top-row gap, and between columns', () => {
    const stock = slotRect({ pile: 'stock' })
    expect(hitTest(s, { x: stock.x + 5, y: stock.y + 5 })).toBeNull()
    expect(hitTest(s, { x: MARGIN + 2 * PITCH + 5, y: TOP_Y + 5 })).toBeNull()
    expect(hitTest(s, { x: MARGIN + CARD_W + 3, y: TABLEAU_Y + 50 })).toBeNull()
  })
})
