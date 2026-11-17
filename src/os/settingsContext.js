import { createContext, useContext } from 'react'

// Kept apart from SettingsProvider so that file exports only a component
// (react-refresh) — the same split WindowManager would want.
export const SettingsContext = createContext(null)

/** `{ settings, chrome: { titlebarH, taskbarH }, commit(patch) }` */
export const useSettings = () => useContext(SettingsContext)
