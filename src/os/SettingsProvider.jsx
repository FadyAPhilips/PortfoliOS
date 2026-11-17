import { useCallback, useLayoutEffect, useMemo, useState } from 'react'
import { SettingsContext } from './settingsContext'
import { STORAGE_KEY, chrome, cssVars, parse, resolve } from './settings'

// Storage can be missing or throw (private windows, blocked site data). Every
// access is guarded and failure just means defaults for this visit.
function readStored() {
  try {
    return parse(window.localStorage.getItem(STORAGE_KEY))
  } catch {
    return {}
  }
}

function writeStored(stored) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(stored))
  } catch {
    // Settings still apply for this visit; they just won't be remembered.
  }
}

function prefersReducedMotion() {
  try {
    return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
  } catch {
    return false
  }
}

/**
 * Holds the visitor's display settings. Only fields the visitor has
 * committed (Apply/OK in Display Properties) are stored; anything absent
 * falls back to DEFAULTS, and an absent reduceMotion follows the OS.
 */
export default function SettingsProvider({ children }) {
  const [stored, setStored] = useState(readStored)
  const [env] = useState(() => ({ prefersReducedMotion: prefersReducedMotion() }))
  const settings = useMemo(() => resolve(stored, env), [stored, env])

  // Before paint, so the first frame already has the chosen sizes.
  useLayoutEffect(() => {
    const vars = cssVars(settings)
    const root = document.documentElement.style
    for (const [name, value] of Object.entries(vars)) root.setProperty(name, value)
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', vars['--desktop-teal'])
  }, [settings])

  const commit = useCallback((patch) => {
    setStored((prev) => {
      const next = { ...prev, ...patch }
      writeStored(next)
      return next
    })
  }, [])

  const value = useMemo(
    () => ({ settings, chrome: chrome(settings), commit }),
    [settings, commit],
  )

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
}
