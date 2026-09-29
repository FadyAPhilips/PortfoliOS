import { describe, expect, it } from 'vitest'
import about from '../content/about.json'
import {
  BASE_COLORS,
  FACES,
  FALLBACK_MAPS,
  FALLBACK_PALETTES,
  ME_32,
  ME_64,
  ROLES,
  faceFor,
} from './avatarFaces'

/**
 * The maps are hand-drawn ASCII. A row one character short doesn't throw — it
 * just silently shifts every pixel after it — so the grid and the character
 * set are worth pinning even though nothing else here is.
 */

// Both profile resolutions are checked, not just the one currently wired up —
// otherwise commenting the switch over in avatarFaces.js would be the first
// thing to discover a malformed map.
const ALL_MAPS = [
  ...Object.entries(FACES).map(([variant, face]) => [variant, face.map]),
  ...FALLBACK_MAPS.map((map, i) => [`fallback ${i}`, map]),
  ['ME_32', ME_32],
  ['ME_64', ME_64],
]

const LEGAL = new Set(['.', ...Object.keys(ROLES)])

describe.each(ALL_MAPS)('%s map', (_label, map) => {
  // Faces may be 32x32 or 64x64; what matters is that each one is square,
  // because the viewBox is derived from the row count alone.
  it('is square', () => {
    expect(map.map((row) => row.length)).toEqual(Array(map.length).fill(map.length))
  })

  it('is a size the renderer can scale cleanly', () => {
    expect([32, 64]).toContain(map.length)
  })

  it('uses only declared role characters', () => {
    const used = new Set(map.join(''))
    expect([...used].filter((ch) => !LEGAL.has(ch))).toEqual([])
  })
})

// An uncoloured role renders as SVG's default black, which reads as a drawing
// mistake rather than a missing palette entry — so check the maps and the
// palettes agree instead of waiting to notice it on screen.
function rolesIn(map) {
  return [...new Set(map.join(''))].filter((ch) => ch !== '.').map((ch) => ROLES[ch])
}

describe('palettes', () => {
  it.each(Object.entries(FACES))('%s colours every role its map uses', (variant, face) => {
    const { colors } = faceFor('ignored', variant)
    expect(rolesIn(face.map).filter((role) => !colors[role])).toEqual([])
  })

  // ME_64 uses roles ME_32 doesn't (fleece highlight, eye whites), so the one
  // palette has to satisfy both or switching resolutions renders them black.
  it('the me palette colours every role in both profile maps', () => {
    const { colors } = faceFor('Fady Philips', 'me')
    const used = [...new Set([...rolesIn(ME_32), ...rolesIn(ME_64)])]
    expect(used.filter((role) => !colors[role])).toEqual([])
  })

  it.each(FALLBACK_PALETTES)('fallback palette %# colours every fallback role', (palette) => {
    const colors = { ...BASE_COLORS, ...palette }
    const used = rolesIn(FALLBACK_MAPS.flat())
    expect(used.filter((role) => !colors[role])).toEqual([])
  })

  it('gives every face a background', () => {
    const backgrounds = [
      ...Object.keys(FACES).map((v) => faceFor('ignored', v).colors.bg),
      ...FALLBACK_PALETTES.map((p) => p.bg),
    ]
    backgrounds.forEach((bg) => expect(bg).toMatch(/^#[0-9a-f]{6}$/))
  })
})

describe('faceFor', () => {
  it('returns the authored face for a known variant', () => {
    expect(faceFor('Anything At All', 'jobs').map).toBe(FACES.jobs.map)
  })

  it('falls back to a generated face for an unknown variant', () => {
    const { map } = faceFor('Gill Bates', 'nobody-by-that-name')
    expect(FALLBACK_MAPS).toContain(map)
  })

  it('falls back to a generated face when no variant is given', () => {
    const { map } = faceFor('Fady Philips')
    expect(FALLBACK_MAPS).toContain(map)
  })

  it('is stable for a given name', () => {
    expect(faceFor('Someone New').map).toBe(faceFor('Someone New').map)
  })
})

describe('about.json', () => {
  it('points every friend at a face that exists', () => {
    const unknown = about.friends
      .map((f) => f.variant)
      .filter((v) => v && !FACES[v])
    expect(unknown).toEqual([])
  })

  it('points the profile at a face that exists', () => {
    expect(FACES[about.variant]).toBeDefined()
  })
})

describe('grid', () => {
  it('reports each face its own grid, whichever ME is active', () => {
    const { map, grid } = faceFor('Fady Philips', 'me')
    expect(grid).toBe(map.length)
    expect(faceFor('Tom', 'tom').grid).toBe(32)
  })
})
