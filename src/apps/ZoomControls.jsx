import { percent, zoomIn, zoomOut } from './zoom'

/**
 * − 100% + for a viewer toolbar. `steps` is the ascending list of levels the
 * buttons walk; each button greys out at its end of the list.
 */
export default function ZoomControls({ steps, level, onChange }) {
  return (
    <span className="zoom-controls">
      <button
        type="button"
        aria-label="Zoom out"
        disabled={level <= steps[0]}
        onClick={() => onChange(zoomOut(steps, level))}
      >
        −
      </button>
      <span className="zoom-level" aria-live="polite">
        {percent(level)}
      </span>
      <button
        type="button"
        aria-label="Zoom in"
        disabled={level >= steps.at(-1)}
        onClick={() => onChange(zoomIn(steps, level))}
      >
        +
      </button>
    </span>
  )
}
