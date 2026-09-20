import { GRID, ROLES, faceFor } from './avatarFaces'

/**
 * Deterministic 32x32 pixel-art headshot.
 *
 * The art and the palettes live in avatarFaces.js; this only turns a map into
 * rects. Friends with a `variant` get a face drawn for them — the friend list
 * parodies real figures in tech, and a likeness at this size is a matter of
 * silhouette and eyewear, not of anything a generator could derive. Everyone
 * else gets a generic face picked by hashing the name, so the same name always
 * comes back the same.
 */

/**
 * Merge horizontal runs of identical pixels into single rects. A naive cell
 * per pixel would put 1024 nodes on screen per avatar; this cuts it to ~120.
 */
function runs(map) {
  const out = []
  map.forEach((row, y) => {
    let x = 0
    while (x < row.length) {
      const ch = row[x]
      let end = x
      while (end + 1 < row.length && row[end + 1] === ch) end += 1
      if (ch !== '.') out.push({ x, y, w: end - x + 1, role: ROLES[ch] })
      x = end + 1
    }
  })
  return out
}

export default function PixelAvatar({ name, variant, size = 76, className = '' }) {
  const { map, colors } = faceFor(name, variant)

  return (
    <svg
      className={`pixel-avatar ${className}`}
      width={size}
      height={size}
      viewBox={`0 0 ${GRID} ${GRID}`}
      shapeRendering="crispEdges"
      role="img"
      aria-label={`${name} profile picture`}
    >
      <rect width={GRID} height={GRID} fill={colors.bg} />
      {runs(map).map((r) => (
        <rect
          key={`${r.x}-${r.y}`}
          x={r.x}
          y={r.y}
          width={r.w}
          height="1"
          fill={colors[r.role]}
        />
      ))}
    </svg>
  )
}
