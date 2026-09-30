// Zoom levels step through a fixed, ascending list, as Win98-era viewers
// did, rather than scaling continuously. A level between steps snaps to the
// next step in the direction asked.

export const zoomIn = (steps, level) => steps.find((s) => s > level) ?? level

export const zoomOut = (steps, level) =>
  steps.findLast((s) => s < level) ?? level

export const percent = (level) => `${Math.round(level * 100)}%`
