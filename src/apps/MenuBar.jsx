import { useEffect, useRef, useState } from 'react'

/**
 * Win98 menu strip.
 *
 * An item is either a plain string — a decorative label, for programs whose
 * menus would have nothing to do (Notepad, Explorer) — or
 * `{ label, menu }`, where `menu` is a list of `{ label, onSelect,
 * disabled?, shortcut? }` entries and `'separator'` strings. A strip with
 * no real menus is hidden from assistive tech; one with menus is a menubar.
 * The mnemonic underline on the first letter is done in CSS.
 */
export default function MenuBar({ items }) {
  const [open, setOpen] = useState(null) // index of the open menu
  const ref = useRef(null)
  const interactive = items.some((it) => typeof it !== 'string')

  // Outside click or Escape closes, the way the Start menu does.
  useEffect(() => {
    if (open === null) return
    const onPointerDown = (e) => {
      if (!ref.current?.contains(e.target)) setOpen(null)
    }
    const onKeyDown = (e) => e.key === 'Escape' && setOpen(null)
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  return (
    <div
      className="menubar"
      ref={ref}
      role={interactive ? 'menubar' : undefined}
      aria-hidden={interactive ? undefined : true}
    >
      {items.map((item, i) => {
        if (typeof item === 'string') {
          return (
            <span key={item} className="menubar-item">
              {item}
            </span>
          )
        }
        const isOpen = open === i
        return (
          <div key={item.label} className="menubar-menu">
            <button
              type="button"
              className={`menubar-item menubar-trigger${isOpen ? ' is-open' : ''}`}
              aria-haspopup="menu"
              aria-expanded={isOpen}
              onPointerDown={(e) => {
                e.preventDefault()
                setOpen(isOpen ? null : i)
              }}
              // Sliding across the bar with a menu open switches menus.
              onPointerEnter={() => open !== null && open !== i && setOpen(i)}
            >
              {item.label}
            </button>
            {isOpen && (
              <ul className="menu-panel" role="menu">
                {item.menu.map((entry, j) =>
                  entry === 'separator' ? (
                    <li key={j} className="menu-separator" role="separator" />
                  ) : (
                    <li key={entry.label} role="none">
                      <button
                        type="button"
                        role="menuitem"
                        className="menu-entry"
                        disabled={entry.disabled}
                        onClick={() => {
                          setOpen(null)
                          entry.onSelect?.()
                        }}
                      >
                        <span>{entry.label}</span>
                        {entry.shortcut && (
                          <span className="menu-shortcut">{entry.shortcut}</span>
                        )}
                      </button>
                    </li>
                  ),
                )}
              </ul>
            )}
          </div>
        )
      })}
    </div>
  )
}
