import { describe, expect, it } from 'vitest'
import { zoomIn, zoomOut } from './zoom'

const STEPS = [0.5, 1, 2]

describe('zoom steps', () => {
  it('moves one step in either direction', () => {
    expect(zoomIn(STEPS, 1)).toBe(2)
    expect(zoomOut(STEPS, 1)).toBe(0.5)
  })

  it('stops at the ends', () => {
    expect(zoomIn(STEPS, 2)).toBe(2)
    expect(zoomOut(STEPS, 0.5)).toBe(0.5)
  })

  it('snaps an off-step level to the next step that way', () => {
    expect(zoomIn(STEPS, 1.3)).toBe(2)
    expect(zoomOut(STEPS, 1.3)).toBe(1)
  })
})
