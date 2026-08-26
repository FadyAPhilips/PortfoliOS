import { useEffect, useRef } from 'react'
import { APPS, APP_ORDER } from '../apps/registry'
import { useWindowActions } from '../os/WindowManager'
import site from '../content/site.json'

export default function StartMenu({ open, onClose }) {
  const ref = useRef(null)
  const { openApp } = useWindowActions()

  useEffect(() => {
    if (!open) return

    const onPointerDown = (e) => {
      // The Start button toggles itself; ignore it here so the two handlers
      // don't fight and immediately reopen the menu.
      if (ref.current?.contains(e.target)) return
      if (e.target.closest?.('.start-button')) return
      onClose()
    }
    const onKeyDown = (e) => e.key === 'Escape' && onClose()

    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open, onClose])

  if (!open) return null

  const launch = (appId) => {
    openApp(appId)
    onClose()
  }

  return (
    <div className="start-menu" ref={ref} role="menu">
      <div className="start-banner">
        <span>{site.brand}</span>
      </div>

      <ul className="start-items">
        {APP_ORDER.map((appId) => (
          <li key={appId}>
            <button type="button" role="menuitem" onClick={() => launch(appId)}>
              <svg className="start-icon" aria-hidden="true">
                <use href={`/icons.svg#${APPS[appId].icon}`} />
              </svg>
              {APPS[appId].title}
            </button>
          </li>
        ))}
        <li className="start-separator" role="separator" />
        <li>
          <button type="button" role="menuitem" onClick={onClose}>
            <svg className="start-icon" aria-hidden="true">
              <use href="/icons.svg#icon-shutdown" />
            </svg>
            Shut Down…
          </button>
        </li>
      </ul>
    </div>
  )
}
