/**
 * Table geometry in Win98 card units. Everything the game needs to place a
 * card or find a drop target comes from here, so drops never measure the
 * DOM — the table is rendered at these coordinates and scaled as a whole.
 */

export const CARD_W = 71
export const CARD_H = 96
export const MARGIN = 8
export const PITCH = CARD_W + 12 // column-to-column
export const TOP_Y = 8
export const TABLEAU_Y = 120
export const FAN_DOWN = 3 // face-down cards peek this much
export const FAN_UP = 15 // face-up cards this much
export const WASTE_FAN = 14 // Draw Three fans the waste sideways

export const TABLE_W = MARGIN * 2 + 6 * PITCH + CARD_W
// Tall enough for the longest legal column: six face-down under a K..A run.
export const TABLE_H = TABLEAU_Y + 6 * FAN_DOWN + 12 * FAN_UP + CARD_H + MARGIN

const rect = (x, y) => ({ x, y, w: CARD_W, h: CARD_H })

export function slotRect(loc) {
  switch (loc.pile) {
    case 'stock':
      return rect(MARGIN, TOP_Y)
    case 'waste':
      return rect(MARGIN + PITCH, TOP_Y)
    case 'foundation':
      return rect(MARGIN + (3 + loc.index) * PITCH, TOP_Y)
    case 'tableau':
      return rect(MARGIN + loc.index * PITCH, TABLEAU_Y)
    default:
      throw new Error(`unknown pile ${loc.pile}`)
  }
}

export function cardRect(state, loc) {
  const slot = slotRect(loc)
  if (loc.pile === 'tableau') {
    const col = state.tableau[loc.index]
    let y = slot.y
    for (let j = 0; j < loc.card; j++) y += col[j].faceUp ? FAN_UP : FAN_DOWN
    return { ...slot, y }
  }
  if (loc.pile === 'waste') {
    // Only the last draw is fanned; older cards sit squarely on the slot.
    const fromTop = state.waste.length - 1 - loc.card
    const fan = Math.min(state.fanned, state.waste.length)
    const k = fan - 1 - fromTop
    return k > 0 ? { ...slot, x: slot.x + WASTE_FAN * k } : slot
  }
  return slot
}

const inside = (p, r) => p.x >= r.x && p.x < r.x + r.w && p.y >= r.y && p.y < r.y + r.h

// Where a drop at `p` would land: a foundation slot, or a tableau column
// anywhere in its band below the top row. Null over anything else.
export function hitTest(state, p) {
  for (let index = 0; index < 4; index++) {
    if (inside(p, slotRect({ pile: 'foundation', index }))) return { pile: 'foundation', index }
  }
  if (p.y >= TABLEAU_Y) {
    for (let index = 0; index < 7; index++) {
      const r = slotRect({ pile: 'tableau', index })
      if (p.x >= r.x && p.x < r.x + r.w) return { pile: 'tableau', index }
    }
  }
  return null
}
