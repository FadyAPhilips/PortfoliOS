// Window sizing floors. Roughly the smallest a Win98 window could be dragged to
// before the title bar controls started clipping.
export const MIN_W = 240
export const MIN_H = 140

// Chrome measurements, kept here so CSS and gesture math can't drift apart.
export const TITLEBAR_H = 22
export const TASKBAR_H = 28
export const RESIZE_EDGE = 5

// New windows step down-right so they never land exactly on each other,
// wrapping back to the origin after this many opens.
export const CASCADE_STEP = 24
export const CASCADE_WRAP = 8
export const CASCADE_ORIGIN = { x: 48, y: 36 }

// Below this viewport width windows go full-bleed and gestures switch off.
export const COMPACT_BREAKPOINT = 768

// Stacking order. Windows occupy everything from BASE upward.
export const Z = {
  ICONS: 0,
  WINDOW_BASE: 10,
  TASKBAR: 1000,
  START_MENU: 1001,
}

// When dragging, at least this much window must stay on the desktop so a
// window can never be moved somewhere it can't be dragged back from.
export const KEEP_VISIBLE = 80
