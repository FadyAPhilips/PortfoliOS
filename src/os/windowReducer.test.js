import { describe, expect, it } from 'vitest'
import { actions, initialState, windowReducer } from './windowReducer'

// Registry stand-ins. The reducer never sees the registry itself; the action
// creator copies what it needs off the entry.
const photos = { title: 'Photos', defaultSize: { w: 400, h: 300 } }
const notepad = {
  title: 'Notepad',
  defaultSize: { w: 400, h: 300 },
  multiInstance: true,
}

const open = (state, appId, app, opts) =>
  windowReducer(state, actions.openApp(appId, app, opts))

const only = (state) => {
  expect(state.windows).toHaveLength(1)
  return state.windows[0]
}

describe('OPEN_APP payload and title', () => {
  it('uses the registry title and no payload when none are given', () => {
    const win = only(open(initialState, 'photos', photos))
    expect(win.title).toBe('Photos')
    expect(win.payload).toBeUndefined()
  })

  it('carries the payload and the given title onto the window', () => {
    const payload = { src: '/a.jpg', name: 'a.jpg' }
    const win = only(
      open(initialState, 'photos', photos, { payload, title: 'a.jpg - Photos' }),
    )
    expect(win.payload).toBe(payload)
    expect(win.title).toBe('a.jpg - Photos')
  })
})

describe('OPEN_APP single-instance apps', () => {
  it('replaces payload and title on the existing window and raises it', () => {
    let state = open(initialState, 'photos', photos, {
      payload: { name: 'a.jpg' },
      title: 'a.jpg - Photos',
    })
    const first = only(state)
    // Something else on top so "raise" is observable.
    state = open(state, 'about', { title: 'About', defaultSize: photos.defaultSize })
    expect(state.focusedId).not.toBe(first.id)

    state = open(state, 'photos', photos, {
      payload: { name: 'b.jpg' },
      title: 'b.jpg - Photos',
    })

    expect(state.windows).toHaveLength(2)
    const again = state.windows.find((w) => w.appId === 'photos')
    expect(again.id).toBe(first.id)
    expect(again.payload).toEqual({ name: 'b.jpg' })
    expect(again.title).toBe('b.jpg - Photos')
    expect(state.focusedId).toBe(first.id)
    expect(again.z).toBeGreaterThan(first.z)
  })

  it('ignores key for single-instance apps', () => {
    let state = open(initialState, 'photos', photos, { key: 'x' })
    state = open(state, 'photos', photos, { key: 'y' })
    expect(state.windows).toHaveLength(1)
  })
})

describe('OPEN_APP multiInstance apps', () => {
  it('opens a second window for a different key', () => {
    let state = open(initialState, 'notepad', notepad, { key: 'a/README.txt' })
    state = open(state, 'notepad', notepad, { key: 'b/README.txt' })
    expect(state.windows).toHaveLength(2)
    expect(state.windows.map((w) => w.key)).toEqual([
      'a/README.txt',
      'b/README.txt',
    ])
  })

  it('focuses the existing window for the same key instead of duplicating', () => {
    let state = open(initialState, 'notepad', notepad, {
      key: 'a/README.txt',
      payload: { text: 'first' },
    })
    const first = only(state)
    state = open(state, 'notepad', notepad, { key: 'b/README.txt' })
    expect(state.focusedId).not.toBe(first.id)

    state = open(state, 'notepad', notepad, {
      key: 'a/README.txt',
      payload: { text: 'should not replace' },
    })

    expect(state.windows).toHaveLength(2)
    expect(state.focusedId).toBe(first.id)
    // Same file, same content — the original payload stands.
    const again = state.windows.find((w) => w.id === first.id)
    expect(again.payload).toEqual({ text: 'first' })
  })
})

describe('UPDATE_WINDOW', () => {
  it('patches title and payload on the target window', () => {
    let state = open(initialState, 'photos', photos, { title: 'a.jpg - Photos' })
    const { id } = only(state)

    state = windowReducer(
      state,
      actions.update(id, { title: 'b.jpg - Photos', payload: { name: 'b.jpg' } }),
    )

    const win = only(state)
    expect(win.title).toBe('b.jpg - Photos')
    expect(win.payload).toEqual({ name: 'b.jpg' })
  })

  it('cannot touch geometry or stacking', () => {
    let state = open(initialState, 'photos', photos)
    const before = only(state)

    state = windowReducer(
      state,
      actions.update(before.id, { x: 999, y: 999, w: 1, h: 1, z: 9999, minimized: true }),
    )

    const after = only(state)
    expect(after.x).toBe(before.x)
    expect(after.y).toBe(before.y)
    expect(after.w).toBe(before.w)
    expect(after.h).toBe(before.h)
    expect(after.z).toBe(before.z)
    expect(after.minimized).toBe(false)
  })

  it('is a no-op for an unknown id', () => {
    const state = open(initialState, 'photos', photos)
    const next = windowReducer(state, actions.update(12345, { title: 'x' }))
    expect(next).toBe(state)
  })
})
