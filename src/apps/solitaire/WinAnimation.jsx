import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { Z } from '../../os/constants'
import { CARD_H, CARD_W } from './layout'

/**
 * The sol.exe win cascade. On a real Win98 desktop the game painted straight
 * to the screen, so cards bounced out of the window, across everything else,
 * and left trails because nothing repainted behind them. This is a
 * full-viewport canvas above every window and the taskbar, never cleared,
 * so the trails come for free.
 *
 * Props:
 *   sheet — the decoded card sheet; every card is one blit out of it.
 *   launches — [{ sx, sy, x, y, w, h }] in screen pixels, in launch order.
 *   onDone(reason) — 'finished' when the last card leaves, 'interrupted' on
 *   any click or key, exactly as the original stopped.
 */
export default function WinAnimation({ sheet, launches, onDone }) {
  const canvasRef = useRef(null)
  const done = useRef(onDone)
  useEffect(() => {
    done.current = onDone
  })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !sheet || !launches.length) return
    const W = window.innerWidth
    const H = window.innerHeight
    const dpr = window.devicePixelRatio || 1
    canvas.width = W * dpr
    canvas.height = H * dpr
    const ctx = canvas.getContext('2d')
    ctx.scale(dpr, dpr)

    // Tuned against a 640px-wide screen and scaled linearly with width, so a
    // card crosses any screen in the same number of frames. SPEED is the one
    // knob for the overall pace: velocities and gravity scale together, so
    // the arcs keep their shape and only the tempo changes.
    const SPEED = 0.7
    const k = SPEED * Math.max(1, W / 640)
    const GRAVITY = 0.6 * k
    const BOUNCE = 0.8
    const LAUNCH_EVERY = 32 // frames between launches

    const flying = []
    let next = 0
    let sinceLaunch = LAUNCH_EVERY
    let raf = 0
    let finished = false

    const launch = () => {
      const l = launches[next++]
      const dir = Math.random() < 0.5 ? -1 : 1
      flying.push({
        ...l,
        vx: dir * (2 + Math.random() * 5) * k,
        vy: -(Math.random() * 6) * k,
      })
    }

    const stop = (reason) => {
      if (finished) return
      finished = true
      cancelAnimationFrame(raf)
      window.removeEventListener('pointerdown', stop, true)
      window.removeEventListener('keydown', stop, true)
      done.current(reason === 'finished' ? 'finished' : 'interrupted')
    }

    const frame = () => {
      if (finished) return
      if (next < launches.length && ++sinceLaunch >= LAUNCH_EVERY) {
        launch()
        sinceLaunch = 0
      }
      for (let i = flying.length - 1; i >= 0; i--) {
        const c = flying[i]
        c.x += c.vx
        c.y += c.vy
        c.vy += GRAVITY
        if (c.y + c.h > H) {
          c.y = H - c.h
          c.vy = -c.vy * BOUNCE
        }
        ctx.drawImage(
          sheet,
          c.sx, c.sy, CARD_W, CARD_H,
          Math.round(c.x), Math.round(c.y), c.w, c.h,
        )
        if (c.x + c.w < 0 || c.x > W) flying.splice(i, 1)
      }
      if (next >= launches.length && flying.length === 0) {
        stop('finished')
        return
      }
      raf = requestAnimationFrame(frame)
    }

    // Capture phase so the click that ends the cascade never reaches a
    // window underneath.
    window.addEventListener('pointerdown', stop, true)
    window.addEventListener('keydown', stop, true)
    raf = requestAnimationFrame(frame)

    return () => {
      finished = true
      cancelAnimationFrame(raf)
      window.removeEventListener('pointerdown', stop, true)
      window.removeEventListener('keydown', stop, true)
    }
  }, [sheet, launches])

  return createPortal(
    <canvas
      ref={canvasRef}
      className="sol-cascade"
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        zIndex: Z.OVERLAY,
      }}
    />,
    document.body,
  )
}
