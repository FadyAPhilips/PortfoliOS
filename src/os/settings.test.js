import { describe, expect, it } from 'vitest'
import {
  FONT_TOKENS,
  TEXT_SIZES,
  changedFields,
  chrome,
  cssVars,
  parse,
  resolve,
} from './settings'

const env = { prefersReducedMotion: false }
const kebab = (s) => s.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)

describe('cssVars', () => {
  it('default preset reproduces today exactly', () => {
    const v = cssVars(resolve({}, env))
    expect(v['--fs-ui']).toBe('11px')
    expect(v['--fs-heading']).toBe('13px')
    expect(v['--fs-start-banner']).toBe('15px')
    expect(v['--fs-mono']).toBe('12px')
    expect(v['--fs-web']).toBe('11px')
    expect(v['--fs-web-name']).toBe('14px')
    expect(v['--fs-web-banner']).toBe('12px')
    expect(v['--fs-web-caption']).toBe('10px')
    expect(v['--titlebar-h']).toBe('22px')
    expect(v['--taskbar-h']).toBe('28px')
    expect(v['--label-w']).toBe('75px')
    expect(v['--desktop-teal']).toBe('#008080')
    expect(v['--font-smoothing']).toBe('none')
    expect(v['--font-ui']).toMatch(/^'Pixelated MS Sans Serif'/)
    // 98.css's own control stack — its Arial fallback sets line-height, so
    // anything else shifts every control by a pixel.
    expect(v['--font-control']).toBe("'Pixelated MS Sans Serif', Arial")
  })

  it('every preset emits every token as whole px', () => {
    for (const { id } of TEXT_SIZES) {
      const v = cssVars(resolve({ textSize: id }, env))
      for (const key of Object.keys(FONT_TOKENS)) {
        expect(v[`--fs-${kebab(key)}`]).toMatch(/^\d+px$/)
      }
    }
  })

  it('xlarge scales text and grows chrome', () => {
    const s = resolve({ textSize: 'xlarge' }, env)
    expect(cssVars(s)['--fs-ui']).toBe('17px')
    expect(chrome(s)).toEqual({ titlebarH: 30, taskbarH: 36 })
  })

  it('smooth font switches family and smoothing', () => {
    const v = cssVars(resolve({ fontStyle: 'smooth' }, env))
    expect(v['--font-ui']).toMatch(/^Tahoma/)
    expect(v['--font-control']).toMatch(/^Tahoma/)
    expect(v['--font-smoothing']).toBe('auto')
  })
})

describe('parse', () => {
  it('survives garbage', () => {
    expect(parse(null)).toEqual({})
    expect(parse('not json')).toEqual({})
    expect(parse('[1,2]')).toEqual({})
    expect(parse('"x"')).toEqual({})
    expect(parse('null')).toEqual({})
  })

  it('drops bad fields one at a time', () => {
    const raw = JSON.stringify({
      textSize: 'huge',
      fontStyle: 'smooth',
      showWelcome: 'yes',
      reduceMotion: true,
      desktopColor: 'navy',
      extra: 1,
    })
    expect(parse(raw)).toEqual({
      fontStyle: 'smooth',
      reduceMotion: true,
      desktopColor: 'navy',
    })
  })
})

describe('resolve', () => {
  it('absent reduceMotion follows the environment; stored wins', () => {
    expect(resolve({}, { prefersReducedMotion: true }).reduceMotion).toBe(true)
    expect(
      resolve({ reduceMotion: false }, { prefersReducedMotion: true }).reduceMotion,
    ).toBe(false)
  })
})

describe('changedFields', () => {
  it('returns only differences', () => {
    const cur = resolve({}, env)
    expect(changedFields(cur, { ...cur })).toEqual({})
    expect(changedFields(cur, { ...cur, textSize: 'large' })).toEqual({
      textSize: 'large',
    })
  })
})
