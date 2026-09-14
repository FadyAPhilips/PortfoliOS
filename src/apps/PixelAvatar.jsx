/**
 * Deterministic 16x16 pixel-art headshot.
 *
 * Friend avatars are generated rather than photographed: the parody lineup is
 * fictional, and a coarse pixel grid reads as the compressed, low-resolution
 * upload the design calls for. Same name in, same face out.
 */

// Pixel roles: . background  H hair  S skin  E eye  M mouth  C shirt  T tie
const MAPS = {
  short: [
    '................',
    '................',
    '....HHHHHHHH....',
    '...HHHHHHHHHH...',
    '..HHHHHHHHHHHH..',
    '..HHSSSSSSSSHH..',
    '..HSSSSSSSSSSH..',
    '..HSSEESSEESSH..',
    '..HSSSSSSSSSSH..',
    '..HSSSSMMSSSSH..',
    '...SSSSSSSSSS...',
    '....SSSSSSSS....',
    '......SSSS......',
    '....CCCCCCCC....',
    '..CCCCCTTCCCCC..',
    '.CCCCCCTTCCCCCC.',
  ],
  bald: [
    '................',
    '................',
    '................',
    '.....SSSSSS.....',
    '....SSSSSSSS....',
    '...SSSSSSSSSS...',
    '..SSSSSSSSSSSS..',
    '..SSSEESSEESSS..',
    '..SSSSSSSSSSSS..',
    '..SSSSSMMSSSSS..',
    '...SSSSSSSSSS...',
    '....SSSSSSSS....',
    '......SSSS......',
    '....CCCCCCCC....',
    '..CCCCCTTCCCCC..',
    '.CCCCCCTTCCCCCC.',
  ],
  long: [
    '................',
    '................',
    '....HHHHHHHH....',
    '...HHHHHHHHHH...',
    '..HHHHHHHHHHHH..',
    '..HHHSSSSSSHHH..',
    '..HHSSSSSSSSHH..',
    '..HHSEESSEESHH..',
    '..HHSSSSSSSSHH..',
    '..HHSSSMMSSSHH..',
    '..HHSSSSSSSSHH..',
    '...HSSSSSSSSH...',
    '....HHSSSSHH....',
    '....CCCCCCCC....',
    '..CCCCCTTCCCCC..',
    '.CCCCCCTTCCCCCC.',
  ],
  // Tom: whiteboard-white background, plain white tee, no tie.
  tom: [
    '................',
    '................',
    '....HHHHHHHH....',
    '...HHHHHHHHHH...',
    '..HHHHHHHHHHHH..',
    '..HHSSSSSSSSHH..',
    '..HSSSSSSSSSSH..',
    '..HSSEESSEESSH..',
    '..HSSSSSSSSSSH..',
    '..HSSSSMMSSSSH..',
    '...SSSSSSSSSS...',
    '....SSSSSSSS....',
    '......SSSS......',
    '....CCCCCCCC....',
    '..CCCCCCCCCCCC..',
    '.CCCCCCCCCCCCCC.',
  ],
}

const PALETTES = [
  { bg: '#b9c6d6', skin: '#e8b98a', hair: '#3b2a1a', shirt: '#2f4f7f', tie: '#8c1f1f' },
  { bg: '#c8c4b4', skin: '#d9a071', hair: '#6b4423', shirt: '#4a4a52', tie: '#1f3f6b' },
  { bg: '#aec4b0', skin: '#f0c9a0', hair: '#a8703a', shirt: '#5a6b7a', tie: '#2f6b3f' },
  { bg: '#cbb8c4', skin: '#c68642', hair: '#241a12', shirt: '#3f3f6b', tie: '#7a5a1f' },
  { bg: '#b4bcc8', skin: '#8d5524', hair: '#1a1208', shirt: '#6b3f3f', tie: '#c0a020' },
  { bg: '#d0c7ae', skin: '#ffdbac', hair: '#c9b037', shirt: '#3f5a4a', tie: '#6b1f4a' },
]

const TOM_PALETTE = {
  bg: '#f2f2ee',
  skin: '#e8b98a',
  hair: '#2b2b2b',
  shirt: '#ffffff',
  tie: '#ffffff',
}

const STYLES = ['short', 'bald', 'long']

// djb2 — small, stable, and enough to spread names across the palettes.
function hash(str) {
  let h = 5381
  for (let i = 0; i < str.length; i += 1) h = ((h << 5) + h + str.charCodeAt(i)) >>> 0
  return h
}

const ROLES = { H: 'hair', S: 'skin', E: 'eye', M: 'mouth', C: 'shirt', T: 'tie' }

/**
 * Merge horizontal runs of identical pixels into single rects. A naive cell
 * per pixel would put 256 nodes on screen per avatar; this cuts it to ~50.
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
  const h = hash(name)
  const isTom = variant === 'tom'
  const style = isTom ? 'tom' : STYLES[h % STYLES.length]
  // `>>>`, not `>>` — a signed shift turns any hash past 2^31 negative, which
  // indexes off the front of the array.
  const palette = isTom ? TOM_PALETTE : PALETTES[(h >>> 3) % PALETTES.length]

  const color = {
    hair: palette.hair,
    skin: palette.skin,
    shirt: palette.shirt,
    tie: palette.tie,
    eye: '#20140c',
    // Mouth is a shaded skin tone rather than a separate hue.
    mouth: '#b9714a',
  }

  return (
    <svg
      className={`pixel-avatar ${className}`}
      width={size}
      height={size}
      viewBox="0 0 16 16"
      shapeRendering="crispEdges"
      role="img"
      aria-label={`${name} profile picture`}
    >
      <rect width="16" height="16" fill={palette.bg} />
      {runs(MAPS[style]).map((r) => (
        <rect
          key={`${r.x}-${r.y}`}
          x={r.x}
          y={r.y}
          width={r.w}
          height="1"
          fill={color[r.role]}
        />
      ))}
    </svg>
  )
}
