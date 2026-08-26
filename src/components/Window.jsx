import { useCallback, useRef } from 'react'
import { useDesktop, useWindowActions } from '../os/WindowManager'
import { useWindowGestures } from '../os/useWindowGestures'
import { APPS } from '../apps/registry'
import ResizeHandles from './ResizeHandles'

export default function Window({ win, focused }) {
  const nodeRef = useRef(null)
  const desktop = useDesktop()
  const { close, focus, minimize, toggleMaximize, setRect } = useWindowActions()
  const app = APPS[win.appId]
  const Body = app.Component

  // Both compact and maximized windows derive their rect from the live
  // desktop size rather than stored state, so they keep filling the screen
  // when the viewport changes. Render-time override, not a state change —
  // the floating rect survives intact for when the window is restored.
  const compact = desktop.isCompact
  const locked = compact || win.maximized
  const rect = locked
    ? { x: 0, y: 0, w: desktop.width, h: desktop.height }
    : { x: win.x, y: win.y, w: win.w, h: win.h }

  const onCommit = useCallback(
    (next) => setRect(win.id, next),
    [setRect, win.id],
  )

  const { begin, move, end } = useWindowGestures({
    nodeRef,
    rect,
    desktop,
    disabled: locked,
    onCommit,
  })

  const stop = (e) => e.stopPropagation()

  return (
    <div
      ref={nodeRef}
      className={`window os-window${focused ? ' is-focused' : ''}`}
      role="dialog"
      aria-label={win.title}
      aria-modal="false"
      style={{
        left: rect.x,
        top: rect.y,
        width: rect.w,
        height: rect.h,
        zIndex: win.z,
      }}
      // Capture phase so focus lands before the title-bar buttons act.
      onPointerDownCapture={() => focus(win.id)}
    >
      <div
        className={`title-bar${focused ? '' : ' inactive'}`}
        onPointerDown={(e) => begin(e, 'move')}
        onPointerMove={move}
        onPointerUp={end}
        onPointerCancel={end}
        onDoubleClick={() => !compact && toggleMaximize(win.id)}
      >
        <div className="title-bar-text">
          <svg className="title-icon" aria-hidden="true">
            <use href={`/icons.svg#${app.icon}`} />
          </svg>
          {win.title}
        </div>
        <div className="title-bar-controls" onPointerDown={stop}>
          <button
            type="button"
            aria-label="Minimize"
            onClick={() => minimize(win.id)}
          />
          <button
            type="button"
            aria-label={win.maximized ? 'Restore' : 'Maximize'}
            disabled={compact}
            onClick={() => toggleMaximize(win.id)}
          />
          <button
            type="button"
            aria-label="Close"
            onClick={() => close(win.id)}
          />
        </div>
      </div>

      <div className="window-body os-window-body">
        <Body />
      </div>

      {!locked && (
        <ResizeHandles onBegin={begin} onMove={move} onEnd={end} />
      )}
    </div>
  )
}
