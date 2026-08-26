import { useCallback, useRef } from 'react'
import { KEEP_VISIBLE, MIN_H, MIN_W, TITLEBAR_H } from './constants'

const clamp = (v, lo, hi) => Math.min(Math.max(v, lo), hi)

// Keep enough of the window on the desktop that it can always be grabbed again.
function applyMove(start, dx, dy, desktop) {
  return {
    x: clamp(
      start.x + dx,
      KEEP_VISIBLE - start.w,
      desktop.width - KEEP_VISIBLE,
    ),
    y: clamp(start.y + dy, 0, desktop.height - TITLEBAR_H),
    w: start.w,
    h: start.h,
  }
}

// Clamp the *size* first, then derive the origin from it. Doing it the other
// way lets the window keep sliding sideways once it hits the minimum.
function applyResize(start, dir, dx, dy) {
  const next = { ...start }

  if (dir.includes('e')) {
    next.w = Math.max(start.w + dx, MIN_W)
  } else if (dir.includes('w')) {
    next.w = Math.max(start.w - dx, MIN_W)
    next.x = start.x + (start.w - next.w)
  }

  if (dir.includes('s')) {
    next.h = Math.max(start.h + dy, MIN_H)
  } else if (dir.includes('n')) {
    next.h = Math.max(start.h - dy, MIN_H)
    next.y = start.y + (start.h - next.h)
  }

  return next
}

/**
 * Pointer-driven move/resize for a single window.
 *
 * During a gesture we write straight to the node's style and only dispatch on
 * release — committing to React state per pointermove would re-render the
 * window tree at pointer frequency.
 */
export function useWindowGestures({ nodeRef, rect, desktop, disabled, onCommit }) {
  const gesture = useRef(null)

  // Read through refs so the pointer handlers never need to be re-created
  // mid-gesture when the rect or desktop size changes.
  const latest = useRef({ rect, desktop })
  latest.current = { rect, desktop }

  const begin = useCallback(
    (e, mode) => {
      if (disabled || e.button !== 0) return
      e.preventDefault()
      e.currentTarget.setPointerCapture(e.pointerId)
      const start = { ...latest.current.rect }
      gesture.current = {
        mode,
        startX: e.clientX,
        startY: e.clientY,
        start,
        next: start,
      }
    },
    [disabled],
  )

  const move = useCallback((e) => {
    const g = gesture.current
    if (!g || !nodeRef.current) return
    const dx = e.clientX - g.startX
    const dy = e.clientY - g.startY
    g.next =
      g.mode === 'move'
        ? applyMove(g.start, dx, dy, latest.current.desktop)
        : applyResize(g.start, g.mode, dx, dy)

    const s = nodeRef.current.style
    s.left = `${g.next.x}px`
    s.top = `${g.next.y}px`
    s.width = `${g.next.w}px`
    s.height = `${g.next.h}px`
  }, [nodeRef])

  const end = useCallback(
    (e) => {
      const g = gesture.current
      if (!g) return
      gesture.current = null
      if (e.currentTarget.hasPointerCapture?.(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId)
      }
      onCommit(g.next)
    },
    [onCommit],
  )

  const dragging = () => gesture.current !== null

  return { begin, move, end, dragging }
}
