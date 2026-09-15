import { describe, expect, it } from 'vitest'
import { positions, toPositions } from './experienceData'

describe('toPositions', () => {
  it('reads a bare array', () => {
    const list = [{ role: 'Engineer' }]
    expect(toPositions(list)).toBe(list)
  })

  it('reads the older { positions: [...] } wrapper', () => {
    const list = [{ role: 'Engineer' }]
    expect(toPositions({ positions: list })).toBe(list)
  })

  // There is no error boundary in the tree: anything thrown while rendering
  // unmounts the whole app and blanks the desktop, not just this window. A
  // hand-edited content file must never be able to do that.
  it('yields an empty list for any shape it does not recognise', () => {
    for (const bad of [null, undefined, {}, 42, 'nope', { positions: 'no' }]) {
      expect(toPositions(bad)).toEqual([])
    }
  })
})

describe('experience.json', () => {
  it('holds at least one position', () => {
    expect(positions.length).toBeGreaterThan(0)
  })

  it('gives every position the fields the Experience table renders', () => {
    for (const p of positions) {
      expect(typeof p.role).toBe('string')
      expect(typeof p.company).toBe('string')
      expect(typeof p.status).toBe('string')
      expect(Array.isArray(p.tech)).toBe(true)
      expect(Array.isArray(p.bullets)).toBe(true)
    }
  })
})
