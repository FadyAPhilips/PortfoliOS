// Original card artwork data. Nothing here is traced from the Windows
// bitmaps — those are Microsoft's; these are drawn from scratch in the same
// spirit.

// Suit glyphs in a 20x20 box, index-aligned with engine.SUITS.
export const SUIT_PATHS = [
  // spades
  'M10 0.5 C 3 7, 0 10.5, 0 14.2 C 0 16.9, 2.2 18.8, 4.8 18.8 C 6.8 18.8, 8.3 17.8, 9.1 16.4 L 7.6 20 L 12.4 20 L 10.9 16.4 C 11.7 17.8, 13.2 18.8, 15.2 18.8 C 17.8 18.8, 20 16.9, 20 14.2 C 20 10.5, 17 7, 10 0.5 Z',
  // hearts
  'M10 19 C 3 13, 0 9.5, 0 5.8 C 0 2.6, 2.4 0.5, 5.2 0.5 C 7.3 0.5, 9 1.7, 10 3.4 C 11 1.7, 12.7 0.5, 14.8 0.5 C 17.6 0.5, 20 2.6, 20 5.8 C 20 9.5, 17 13, 10 19 Z',
  // clubs: three discs and a stem, one path so the fill merges
  'M5.7 6 a4.3 4.3 0 1 0 8.6 0 a4.3 4.3 0 1 0 -8.6 0 M1 12.5 a4.3 4.3 0 1 0 8.6 0 a4.3 4.3 0 1 0 -8.6 0 M10.4 12.5 a4.3 4.3 0 1 0 8.6 0 a4.3 4.3 0 1 0 -8.6 0 M9 11 L11 11 L12.8 20 L7.2 20 Z',
  // diamonds
  'M10 0 L18.5 10 L10 20 L1.5 10 Z',
]

export const RANK_LABELS = ['', 'A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']

// Pip layout per rank as [column, row]: column 0/1/2 = left/centre/right,
// row 0..1 from the top of the pip area. Rows past the middle are drawn
// upside down, as on a real deck.
const L = 0
const C = 1
const R = 2
const SIX = [[L, 0], [R, 0], [L, 0.5], [R, 0.5], [L, 1], [R, 1]]
const EIGHT_SIDES = [[L, 0], [R, 0], [L, 1 / 3], [R, 1 / 3], [L, 2 / 3], [R, 2 / 3], [L, 1], [R, 1]]
export const PIPS = {
  2: [[C, 0], [C, 1]],
  3: [[C, 0], [C, 0.5], [C, 1]],
  4: [[L, 0], [R, 0], [L, 1], [R, 1]],
  5: [[L, 0], [R, 0], [C, 0.5], [L, 1], [R, 1]],
  6: SIX,
  7: [...SIX, [C, 0.25]],
  8: [...SIX, [C, 0.25], [C, 0.75]],
  9: [...EIGHT_SIDES, [C, 0.5]],
  10: [...EIGHT_SIDES, [C, 1 / 6], [C, 5 / 6]],
}

// The six backs offered in Deck…, as SVG <pattern> descriptions.
export const BACKS = [
  { name: 'Lattice', bg: '#000080', ink: '#4a6fd0', tile: 8, kind: 'diagonals' },
  { name: 'Grid', bg: '#800000', ink: '#c06060', tile: 6, kind: 'grid' },
  { name: 'Dots', bg: '#006400', ink: '#9fdc9f', tile: 8, kind: 'dots' },
  { name: 'Rings', bg: '#008080', ink: '#bfe0e0', tile: 12, kind: 'rings' },
  { name: 'Checks', bg: '#602080', ink: '#a070c0', tile: 8, kind: 'checks' },
  { name: 'Waves', bg: '#c05000', ink: '#ffd0a0', tile: 12, kind: 'waves' },
]
