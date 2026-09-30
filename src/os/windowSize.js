import { MIN_H, MIN_W } from './constants'

/**
 * Turns a registry `defaultSize` into pixels. Each of `w` and `h` is either
 * pixels or, when it is 1 or less, a share of the desktop — so a window can
 * open at 75% of whatever screen it lands on. Optional `min` and `max` (in
 * pixels) bound the result, and the desktop bounds everything, `min`
 * included. With no desktop to measure, a share falls back to `min`.
 */
export function resolveSize({ w, h, min, max }, desktop) {
  const axis = (value, full, lo, hi) => {
    let px = value <= 1 ? (full ? Math.round(value * full) : lo) : value
    if (hi) px = Math.min(px, hi)
    if (lo) px = Math.max(px, lo)
    return full ? Math.min(px, full) : px
  }
  return {
    w: axis(w, desktop?.width, min?.w ?? MIN_W, max?.w),
    h: axis(h, desktop?.height, min?.h ?? MIN_H, max?.h),
  }
}

// Shrinks `size` so a window opened at `pos` ends at the desktop's edge
// rather than running off it, but never below the window minimums.
export function fitAt(size, pos, desktop) {
  if (!desktop) return size
  return {
    w: Math.max(MIN_W, Math.min(size.w, desktop.width - pos.x)),
    h: Math.max(MIN_H, Math.min(size.h, desktop.height - pos.y)),
  }
}
