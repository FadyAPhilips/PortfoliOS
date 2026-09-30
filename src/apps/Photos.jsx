import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useWindowActions, useWindows } from '../os/WindowManager'
import ZoomControls from './ZoomControls'
import { zoomIn, zoomOut } from './zoom'

// 100% is the picture fitted to the window (never enlarged past its own
// pixels), which is how it first opens. Above that it overflows the frame
// and scrolls.
const ZOOM_STEPS = [0.25, 0.5, 0.75, 1, 1.5, 2, 3, 4]

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
  // Also keyed by src: moving to another picture starts it fitted again.
  const [zoom, setZoom] = useState({ src: null, level: 1 })
  const [natural, setNatural] = useState(null) // { src, w, h } once loaded
  const [frame, setFrame] = useState(null) // { w, h } of the mat
  const frameRef = useRef(null)
  const centre = useRef(null) // scroll centre to restore after a zoom
  const pan = useRef(null) // pointer drag in progress

  const images = payload?.images ?? NO_IMAGES
  const index = payload?.index ?? 0
  const current = images[index]
  const level = zoom.src === current?.src ? zoom.level : 1

  // The outer size, scrollbars included, so a scrollbar appearing when the
  // picture overflows can't change the fit and shrink the picture back.
  useEffect(() => {
    const el = frameRef.current
    if (!el) return
    const ro = new ResizeObserver(() =>
      setFrame({ w: el.offsetWidth, h: el.offsetHeight }),
    )
    ro.observe(el)
    return () => ro.disconnect()
  }, [current])

  const setLevel = (next) => {
    // Remember what's in the middle of the view so the zoom centres on it.
    const el = frameRef.current
    if (el) {
      centre.current = {
        x: (el.scrollLeft + el.clientWidth / 2) / el.scrollWidth,
        y: (el.scrollTop + el.clientHeight / 2) / el.scrollHeight,
      }
    }
    setZoom({ src: current.src, level: next })
  }

  useLayoutEffect(() => {
    const el = frameRef.current
    const c = centre.current
    if (!el || !c) return
    el.scrollLeft = c.x * el.scrollWidth - el.clientWidth / 2
    el.scrollTop = c.y * el.scrollHeight - el.clientHeight / 2
    centre.current = null
  }, [level])

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
      if (e.key === '+' || e.key === '=') setLevel(zoomIn(ZOOM_STEPS, level))
      if (e.key === '-' || e.key === '_') setLevel(zoomOut(ZOOM_STEPS, level))
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  if (!current) return <p className="viewer-empty">No file open.</p>

  // Explicit pixels once both the picture and the mat are measured; until
  // then CSS fits it, which is the same thing at 100%.
  const known = natural?.src === current.src && frame
  const fit = known ? Math.min(1, frame.w / natural.w, frame.h / natural.h) : 1
  const size = known
    ? { width: natural.w * fit * level, height: natural.h * fit * level }
    : undefined

  // Drag to pan, but only when there is somewhere to pan to.
  const startPan = (e) => {
    const el = frameRef.current
    if (e.button !== 0) return
    if (el.scrollWidth <= el.clientWidth && el.scrollHeight <= el.clientHeight) return
    e.preventDefault()
    el.setPointerCapture(e.pointerId)
    pan.current = { x: e.clientX, y: e.clientY, left: el.scrollLeft, top: el.scrollTop }
    el.classList.add('is-panning')
  }
  const movePan = (e) => {
    const p = pan.current
    if (!p) return
    frameRef.current.scrollLeft = p.left - (e.clientX - p.x)
    frameRef.current.scrollTop = p.top - (e.clientY - p.y)
  }
  const endPan = () => {
    pan.current = null
    frameRef.current.classList.remove('is-panning')
  }

  return (
    <div className="app-pane photos">
      <div className="viewer-toolbar">
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
        <ZoomControls steps={ZOOM_STEPS} level={level} onChange={setLevel} />
        <span className="photos-counter">
          {index + 1} of {images.length}
        </span>
      </div>

      <div
        ref={frameRef}
        className={`photos-frame app-grow${level > 1 ? ' is-zoomed' : ''}`}
        onPointerDown={startPan}
        onPointerMove={movePan}
        onPointerUp={endPan}
        onPointerCancel={endPan}
      >
        {failedSrc === current.src ? (
          <p className="viewer-empty">Cannot display {current.name}.</p>
        ) : (
          <img
            key={current.src}
            className="photos-img"
            src={current.src}
            alt={current.name}
            draggable={false}
            style={size}
            onLoad={(e) =>
              setNatural({
                src: current.src,
                w: e.currentTarget.naturalWidth,
                h: e.currentTarget.naturalHeight,
              })
            }
            onError={() => setFailedSrc(current.src)}
          />
        )}
      </div>
    </div>
  )
}
