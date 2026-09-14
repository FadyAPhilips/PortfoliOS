import { useEffect } from 'react'

/**
 * A Win95 dialog modal to its program window, not the desktop. Renders
 * inside the app pane (which must be `position: relative`), so the window
 * manager stays out of it. Styles are the `.props-*` rules in skills.css,
 * where the pattern first appeared. Escape, the title-bar X and a click on
 * the backdrop all call onClose.
 */
export default function Dialog({ title, onClose, actions, width, children }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="props-backdrop" onClick={onClose}>
      <div
        className="window props-dialog"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        style={width ? { width } : undefined}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="title-bar">
          <div className="title-bar-text">{title}</div>
          <div className="title-bar-controls">
            <button type="button" aria-label="Close" onClick={onClose} />
          </div>
        </div>
        <div className="window-body">
          {children}
          {actions && <div className="props-actions">{actions}</div>}
        </div>
      </div>
    </div>
  )
}
