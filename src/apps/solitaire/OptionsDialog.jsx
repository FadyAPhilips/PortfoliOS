import { useState } from 'react'
import Dialog from '../Dialog'

/** sol.exe's Options dialog, minus Vegas scoring and Outline dragging. */
export default function OptionsDialog({ options, statusBar, onOk, onCancel }) {
  const [draw, setDraw] = useState(options.draw)
  const [scoring, setScoring] = useState(options.scoring)
  const [timed, setTimed] = useState(options.timed)
  const [status, setStatus] = useState(statusBar)

  return (
    <Dialog
      title="Options"
      onClose={onCancel}
      width={260}
      actions={
        <>
          <button type="button" onClick={() => onOk({ draw, scoring, timed }, status)}>
            OK
          </button>
          <button type="button" onClick={onCancel}>
            Cancel
          </button>
        </>
      }
    >
      <div className="sol-options">
        <fieldset>
          <legend>Draw</legend>
          <div className="field-row">
            <input type="radio" id="sol-draw-1" name="sol-draw" checked={draw === 1} onChange={() => setDraw(1)} />
            <label htmlFor="sol-draw-1">Draw one</label>
          </div>
          <div className="field-row">
            <input type="radio" id="sol-draw-3" name="sol-draw" checked={draw === 3} onChange={() => setDraw(3)} />
            <label htmlFor="sol-draw-3">Draw three</label>
          </div>
        </fieldset>

        <fieldset>
          <legend>Scoring</legend>
          <div className="field-row">
            <input type="radio" id="sol-score-std" name="sol-scoring" checked={scoring === 'standard'} onChange={() => setScoring('standard')} />
            <label htmlFor="sol-score-std">Standard</label>
          </div>
          <div className="field-row">
            <input type="radio" id="sol-score-none" name="sol-scoring" checked={scoring === 'none'} onChange={() => setScoring('none')} />
            <label htmlFor="sol-score-none">None</label>
          </div>
        </fieldset>

        <div className="field-row">
          <input type="checkbox" id="sol-timed" checked={timed} onChange={(e) => setTimed(e.target.checked)} />
          <label htmlFor="sol-timed">Timed game</label>
        </div>
        <div className="field-row">
          <input type="checkbox" id="sol-statusbar" checked={status} onChange={(e) => setStatus(e.target.checked)} />
          <label htmlFor="sol-statusbar">Status bar</label>
        </div>
      </div>
    </Dialog>
  )
}
