import { useCallback, useEffect, useRef } from 'react'
import { hitTest } from './layout'

export const cardKey = (k) => k.suit * 13 + k.rank

// The cards a press at `loc` would lift — the same rule as engine.lift, but
// all we need here is which DOM nodes to move.
function runFor(game, loc) {
  switch (loc.pile) {
    case 'waste':
      return game.waste.slice(-1)
    case 'foundation':
      return game.foundations[loc.index].slice(-1)
    case 'tableau': {
      const col = game.tableau[loc.index]
      return col[loc.card]?.faceUp ? col.slice(loc.card) : []
    }
    default:
      return []
  }
}

/**
 * Pointer-driven card dragging, in the same shape as useWindowGestures: the
 * run follows the pointer via `transform` writes on its nodes, and the game
 * hears about it exactly once, on drop. Coordinates are converted into
 * table units through the table's current scale, so the drop target comes
 * from layout.hitTest rather than from measuring cards.
 *
 * The gesture remembers card keys, not nodes, and looks each node up
 * through the ref at write time — the same way the window gesture writes
 * `nodeRef.current.style`.
 */
export function useCardDrag({ tableRef, game, scale, onDrop }) {
  // Read through a ref so handlers never go stale mid-gesture; synced in an
  // effect rather than during render.
  const latest = useRef({ game, scale, onDrop })
  useEffect(() => {
    latest.current = { game, scale, onDrop }
  })
  const drag = useRef(null)

  const begin = useCallback(
    (e, loc) => {
      if (e.button !== 0 || !tableRef.current) return
      const run = runFor(latest.current.game, loc)
      if (!run.length) return
      e.preventDefault()
      e.currentTarget.setPointerCapture(e.pointerId)
      const keys = run.map(cardKey)
      for (const key of keys) {
        tableRef.current.querySelector(`[data-key="${key}"]`)?.classList.add('is-dragging')
      }
      drag.current = { loc, keys, startX: e.clientX, startY: e.clientY, moved: false }
    },
    [tableRef],
  )

  const move = useCallback(
    (e) => {
      const d = drag.current
      if (!d || !tableRef.current) return
      const { scale } = latest.current
      const dx = (e.clientX - d.startX) / scale
      const dy = (e.clientY - d.startY) / scale
      if (Math.abs(dx) + Math.abs(dy) > 2) d.moved = true
      for (const key of d.keys) {
        const n = tableRef.current.querySelector(`[data-key="${key}"]`)
        if (n) n.style.transform = `translate(${dx}px, ${dy}px)`
      }
    },
    [tableRef],
  )

  const end = useCallback(
    (e) => {
      const d = drag.current
      if (!d) return
      drag.current = null
      if (e.currentTarget.hasPointerCapture?.(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId)
      }
      if (!tableRef.current) return
      for (const key of d.keys) {
        const n = tableRef.current.querySelector(`[data-key="${key}"]`)
        if (n) {
          n.style.transform = ''
          n.classList.remove('is-dragging')
        }
      }
      // A press without movement is a click, not a drop (and may be half
      // of a double-click).
      if (!d.moved) return
      const { game, scale, onDrop } = latest.current
      const r = tableRef.current.getBoundingClientRect()
      const p = { x: (e.clientX - r.left) / scale, y: (e.clientY - r.top) / scale }
      const target = hitTest(game, p)
      if (target) onDrop(d.loc, target)
    },
    [tableRef],
  )

  return { begin, move, end }
}
