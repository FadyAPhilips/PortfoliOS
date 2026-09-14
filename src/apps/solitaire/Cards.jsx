import { BACKS, RANK_LABELS, SUIT_NAMES } from './cardArt'
import { CARD_H, CARD_W } from './layout'

// Where a cell sits in the sheet. The element is card-sized and the sheet is
// drawn at natural size behind it, so the offset is the whole trick.
const cell = (col, row) => ({
  backgroundPosition: `${-col * CARD_W}px ${-row * CARD_H}px`,
})

/**
 * A card face. The sprite carries no text, so the label is the only thing a
 * screen reader has to go on — it matters more here than it did when these
 * were drawn as SVG.
 */
export function CardFace({ rank, suit }) {
  return (
    <div
      className="sol-sprite"
      role="img"
      aria-label={`${RANK_LABELS[rank]} of ${SUIT_NAMES[suit]}`}
      style={cell(rank - 1, suit)}
    />
  )
}

export function CardBack({ design = 0 }) {
  const back = BACKS[design] ?? BACKS[0]
  return <div className="sol-sprite" aria-hidden="true" style={cell(back.col, back.row)} />
}

/** A bare cell from the sheet — the empty-stock marker uses this. */
export function SheetCell({ col, row, className = '' }) {
  return (
    <div
      className={`sol-sprite ${className}`.trim()}
      aria-hidden="true"
      style={cell(col, row)}
    />
  )
}
