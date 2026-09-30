import { describe, expect, it } from 'vitest'
import { fitAt, resolveSize } from './windowSize'
import { MIN_H, MIN_W } from './constants'

const laptop = { width: 1280, height: 772 }

describe('resolveSize', () => {
  it('passes pixel sizes through', () => {
    expect(resolveSize({ w: 480, h: 360 }, laptop)).toEqual({ w: 480, h: 360 })
  })

  it('treats values up to 1 as a share of the desktop', () => {
    expect(resolveSize({ w: 0.75, h: 0.5 }, laptop)).toEqual({ w: 960, h: 386 })
  })

  it('never goes below min or above max', () => {
    const size = { w: 0.1, h: 0.9, min: { w: 400, h: 300 }, max: { w: 900, h: 600 } }
    expect(resolveSize(size, laptop)).toEqual({ w: 400, h: 600 })
  })

  it('lets the desktop win over min', () => {
    const size = { w: 0.5, h: 0.5, min: { w: 2000, h: 2000 } }
    expect(resolveSize(size, laptop)).toEqual({ w: 1280, h: 772 })
  })

  it('falls back to min when there is no desktop to measure', () => {
    expect(resolveSize({ w: 0.5, h: 0.5, min: { w: 400, h: 300 } })).toEqual({ w: 400, h: 300 })
    expect(resolveSize({ w: 0.5, h: 0.5 })).toEqual({ w: MIN_W, h: MIN_H })
  })
})

describe('fitAt', () => {
  it('leaves a window that fits alone', () => {
    expect(fitAt({ w: 400, h: 300 }, { x: 48, y: 36 }, laptop)).toEqual({ w: 400, h: 300 })
  })

  it('shrinks a window so it ends at the desktop edge', () => {
    expect(fitAt({ w: 1280, h: 772 }, { x: 48, y: 36 }, laptop)).toEqual({ w: 1232, h: 736 })
  })

  it('never shrinks below the window minimums', () => {
    expect(fitAt({ w: 400, h: 300 }, { x: 1200, y: 700 }, laptop)).toEqual({ w: MIN_W, h: MIN_H })
  })

  it('is a pass-through with no desktop', () => {
    expect(fitAt({ w: 400, h: 300 }, { x: 48, y: 36 })).toEqual({ w: 400, h: 300 })
  })
})
