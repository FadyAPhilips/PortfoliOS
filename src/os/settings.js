/**
 * Display settings: the preset tables and the pure functions that turn a
 * visitor's choices into CSS custom properties and chrome heights.
 *
 * This is the single source of truth for every size the presets touch. CSS
 * reads the variables `cssVars` emits (index.css declares the same names at
 * their Default values, so the page is correct before JS runs); the window
 * manager reads `chrome`. Both come from one table, so they can't drift.
 *
 * Labels live in src/content/settings.json; only ids and values live here.
 */

export const STORAGE_KEY = 'portfolios.settings'

// Default must stay exactly 1 / 22 / 28 — it is how the site looked before
// settings existed.
export const TEXT_SIZES = [
  { id: 'small', scale: 0.9, titlebarH: 20, taskbarH: 26 },
  { id: 'default', scale: 1, titlebarH: 22, taskbarH: 28 },
  { id: 'large', scale: 1.25, titlebarH: 26, taskbarH: 32 },
  { id: 'xlarge', scale: 1.5, titlebarH: 30, taskbarH: 36 },
]

export const FONT_STYLES = [
  {
    id: 'classic',
    family: "'Pixelated MS Sans Serif', Tahoma, 'Segoe UI', sans-serif",
    smoothing: 'none',
  },
  {
    id: 'smooth',
    family: "Tahoma, 'Segoe UI', Verdana, sans-serif",
    smoothing: 'auto',
  },
]

// Solid colours from the Win98 Background list's spirit; teal is the default.
export const DESKTOP_COLORS = [
  { id: 'teal', hex: '#008080' },
  { id: 'black', hex: '#000000' },
  { id: 'navy', hex: '#000080' },
  { id: 'darkgreen', hex: '#005a32' },
  { id: 'maroon', hex: '#800000' },
  { id: 'purple', hex: '#5a0f6e' },
  { id: 'slate', hex: '#3a5068' },
]

/*
  Default px of each font size, by role rather than by number, so two rules
  that happen to share a size today can diverge later. Display text (the
  wallpaper name and the Welcome banner) is deliberately absent: it never
  scales.
*/
export const FONT_TOKENS = {
  ui: 11, // system font: body, every 98.css control, menus, title bars
  heading: 13, // program headings (.app-title, Welcome and wizard h2)
  startBanner: 15, // the Start menu's vertical brand strip
  mono: 12, // Notepad; its own zoom multiplies on top
  web: 11, // MySpace page body text
  webName: 14,
  webBanner: 12,
  webCaption: 10,
}

// Desktop and Explorer icon label width at Default.
export const BASE_LABEL_W = 75

// reduceMotion is absent on purpose: until the visitor commits a choice it
// follows the OS, so it is supplied by `resolve`'s environment.
export const DEFAULTS = {
  textSize: 'default',
  fontStyle: 'classic',
  desktopColor: 'teal',
  showWelcome: true,
}

const ids = (list) => list.map((x) => x.id)
const VALID = {
  textSize: (v) => ids(TEXT_SIZES).includes(v),
  fontStyle: (v) => ids(FONT_STYLES).includes(v),
  desktopColor: (v) => ids(DESKTOP_COLORS).includes(v),
  showWelcome: (v) => typeof v === 'boolean',
  reduceMotion: (v) => typeof v === 'boolean',
}

/** Stored JSON → only the fields that are valid. Never throws. */
export function parse(raw) {
  let data
  try {
    data = JSON.parse(raw)
  } catch {
    return {}
  }
  if (!data || typeof data !== 'object' || Array.isArray(data)) return {}
  const out = {}
  for (const [key, ok] of Object.entries(VALID)) {
    if (key in data && ok(data[key])) out[key] = data[key]
  }
  return out
}

export const resolve = (stored, env) => ({
  ...DEFAULTS,
  reduceMotion: env.prefersReducedMotion,
  ...stored,
})

export function changedFields(current, staged) {
  const out = {}
  for (const key of Object.keys(VALID)) {
    if (staged[key] !== current[key]) out[key] = staged[key]
  }
  return out
}

const find = (list, id) => list.find((x) => x.id === id) ?? list[0]
const sizeOf = (settings) =>
  TEXT_SIZES.find((x) => x.id === settings.textSize) ?? find(TEXT_SIZES, 'default')

export function chrome(settings) {
  const { titlebarH, taskbarH } = sizeOf(settings)
  return { titlebarH, taskbarH }
}

const px = (n) => `${Math.round(n)}px`
const kebab = (s) => s.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)

export function cssVars(settings) {
  const size = sizeOf(settings)
  const font = find(FONT_STYLES, settings.fontStyle)
  const vars = {}
  for (const [role, base] of Object.entries(FONT_TOKENS)) {
    vars[`--fs-${kebab(role)}`] = px(base * size.scale)
  }
  vars['--titlebar-h'] = px(size.titlebarH)
  vars['--taskbar-h'] = px(size.taskbarH)
  vars['--label-w'] = px(BASE_LABEL_W * size.scale)
  vars['--font-ui'] = font.family
  vars['--font-smoothing'] = font.smoothing
  vars['--desktop-teal'] = find(DESKTOP_COLORS, settings.desktopColor).hex
  return vars
}
