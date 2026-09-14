import { useState } from 'react'
import Dialog from '../Dialog'
import { BACKS } from './cardArt'
import { CardBack } from './Cards'

/** sol.exe's Deck… picker: six backs, click to choose, double-click to take. */
export default function DeckDialog({ design, onOk, onCancel }) {
  const [pick, setPick] = useState(design)

  return (
    <Dialog
      title="Select Card Back"
      onClose={onCancel}
      // Six 71px backs plus gaps, so the grid sits at natural size.
      width={480}
      actions={
        <>
          <button type="button" onClick={() => onOk(pick)}>
            OK
          </button>
          <button type="button" onClick={onCancel}>
            Cancel
          </button>
        </>
      }
    >
      <div className="sol-deck-grid" role="radiogroup" aria-label="Card back">
        {BACKS.map((b, i) => (
          <button
            key={b.name}
            type="button"
            role="radio"
            aria-checked={i === pick}
            aria-label={b.name}
            className={`sol-deck-pick${i === pick ? ' is-selected' : ''}`}
            onClick={() => setPick(i)}
            onDoubleClick={() => onOk(i)}
          >
            <CardBack design={i} />
          </button>
        ))}
      </div>
    </Dialog>
  )
}
