import cardsUrl from '../../assets/solitaire/cards.png'

/**
 * The Windows Solitaire card sheet: 13 columns x 6 rows of 71x96 cells, which
 * is exactly the CARD_W/CARD_H the table is already laid out in — so a cell
 * maps 1:1 onto a card with no scaling.
 *
 * Rows 0-3 are the four suits in the engine's own order (spades, hearts,
 * clubs, diamonds), ace through king left to right. A face is therefore at
 * (col = rank - 1, row = suit) with no remapping.
 */
export const SHEET_URL = cardsUrl
export const SHEET_W = 923
export const SHEET_H = 576

export const RANK_LABELS = [
  '', 'A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K',
]
export const SUIT_NAMES = ['spades', 'hearts', 'clubs', 'diamonds']

/**
 * The twelve backs, by cell. Four were animated in the original and their
 * extra frames sit in the cells immediately after — robot r4 c6-c8, castle
 * r5 c1-c2, beach r5 c3-c5, hand r5 c6-c8. Only the first frame is used
 * here; cycling them would be a separate pass.
 */
export const BACKS = [
  { name: 'Crosshatch', col: 0, row: 4 },
  { name: 'Weave', col: 1, row: 4 },
  { name: 'Fish', col: 2, row: 4 },
  { name: 'Clownfish', col: 3, row: 4 },
  { name: 'Vines', col: 4, row: 4 },
  { name: 'Ivy', col: 5, row: 4 },
  { name: 'Robot', col: 6, row: 4 },
  { name: 'Roses', col: 9, row: 4 },
  { name: 'Shell', col: 0, row: 5 },
  { name: 'Castle', col: 1, row: 5 },
  { name: 'Beach', col: 3, row: 5 },
  { name: 'Hand', col: 6, row: 5 },
]

// Shown on an empty stock, where the original put it. The sheet also carries
// a red X at r4 c11 for a stock that can no longer be recycled — this engine
// allows unlimited recycles, so nothing here uses it.
export const MARKER_RECYCLE = { col: 10, row: 4 }

// One shared decode, for the canvas the win cascade draws into.
let pending
export function loadSheet() {
  pending ??= new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('card sheet failed to load'))
    img.src = cardsUrl
  })
  return pending
}
