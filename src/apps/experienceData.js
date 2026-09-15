import data from '../content/experience.json'

/**
 * The positions list, whatever shape the content file is in.
 *
 * `experience.json` is a bare array; it used to be wrapped as
 * `{ positions: [...] }`, and both are read here. Anything else yields an
 * empty list rather than throwing — there is no error boundary in the tree,
 * so a throw while rendering unmounts the whole app and blanks the desktop
 * instead of just breaking this one window.
 */
export function toPositions(raw) {
  if (Array.isArray(raw)) return raw
  if (raw && Array.isArray(raw.positions)) return raw.positions
  return []
}

export const positions = toPositions(data)
