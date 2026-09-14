import { useCallback, useEffect, useState } from 'react'
import { useWindowActions, useWindows } from '../os/WindowManager'

// Stable fallback: a fresh [] per render would change identity every time
// and churn the useCallback below.
const NO_IMAGES = []

/**
 * Image viewer. The payload is { images: [{ src, name }], index } and holds
 * the whole folder's images, which is what scopes Previous/Next to the
 * folder. The current index lives in the window payload rather than local
 * state, so reopening a picture from Explorer (which swaps the payload)
 * jumps straight to it, and the title updates in the same dispatch.
 */
export default function Photos({ windowId, payload }) {
  const { update } = useWindowActions()
  const { focusedId } = useWindows()
  // Keyed by src rather than a bare flag, so moving to the next image
  // clears it without an effect.
  const [failedSrc, setFailedSrc] = useState(null)

  const images = payload?.images ?? NO_IMAGES
  const index = payload?.index ?? 0
  const current = images[index]

  const go = useCallback(
    (next) => {
      if (next < 0 || next >= images.length) return
      update(windowId, {
        title: `${images[next].name} - Photos`,
        payload: { ...payload, index: next },
      })
    },
    [images, payload, update, windowId],
  )

  // Arrow keys, but only while this is the active window.
  useEffect(() => {
    if (focusedId !== windowId) return
    const onKey = (e) => {
      if (e.key === 'ArrowLeft') go(index - 1)
      if (e.key === 'ArrowRight') go(index + 1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [focusedId, windowId, go, index])

  if (!current) return <p className="viewer-empty">No file open.</p>

  return (
    <div className="app-pane photos">
      <div className="photos-toolbar">
        <button type="button" onClick={() => go(index - 1)} disabled={index === 0}>
          « Previous
        </button>
        <button
          type="button"
          onClick={() => go(index + 1)}
          disabled={index === images.length - 1}
        >
          Next »
        </button>
        <span className="photos-counter">
          {index + 1} of {images.length}
        </span>
      </div>

      <div className="photos-frame app-grow">
        {failedSrc === current.src ? (
          <p className="viewer-empty">Cannot display {current.name}.</p>
        ) : (
          <img
            key={current.src}
            className="photos-img"
            src={current.src}
            alt={current.name}
            onError={() => setFailedSrc(current.src)}
          />
        )}
      </div>
    </div>
  )
}
