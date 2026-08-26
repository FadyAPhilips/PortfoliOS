import { CASCADE_ORIGIN, CASCADE_STEP, CASCADE_WRAP, Z } from './constants'

export const initialState = {
  windows: [],
  focusedId: null,
  nextZ: Z.WINDOW_BASE,
  nextId: 1,
  opened: 0, // total opens ever, drives the cascade offset
}

export const actions = {
  // `app` is the registry entry; the reducer stays ignorant of the registry.
  openApp: (appId, app) => ({
    type: 'OPEN_APP',
    appId,
    title: app.title,
    defaultSize: app.defaultSize,
  }),
  close: (id) => ({ type: 'CLOSE', id }),
  focus: (id) => ({ type: 'FOCUS', id }),
  minimize: (id) => ({ type: 'MINIMIZE', id }),
  toggleFromTaskbar: (id) => ({ type: 'TOGGLE_FROM_TASKBAR', id }),
  toggleMaximize: (id, desktop) => ({ type: 'TOGGLE_MAXIMIZE', id, desktop }),
  setRect: (id, rect) => ({ type: 'SET_RECT', id, rect }),
}

const cascade = (opened) => {
  const step = opened % CASCADE_WRAP
  return {
    x: CASCADE_ORIGIN.x + step * CASCADE_STEP,
    y: CASCADE_ORIGIN.y + step * CASCADE_STEP,
  }
}

// Raise one window to the top of the stack and mark it focused.
const raise = (state, id) => ({
  ...state,
  focusedId: id,
  nextZ: state.nextZ + 1,
  windows: state.windows.map((w) =>
    w.id === id ? { ...w, z: state.nextZ, minimized: false } : w,
  ),
})

const patch = (state, id, changes) => ({
  ...state,
  windows: state.windows.map((w) =>
    w.id === id ? { ...w, ...(typeof changes === 'function' ? changes(w) : changes) } : w,
  ),
})

export function windowReducer(state, action) {
  switch (action.type) {
    case 'OPEN_APP': {
      // Single instance per app: reopening focuses and unminimizes the
      // existing window rather than spawning a duplicate.
      const existing = state.windows.find((w) => w.appId === action.appId)
      if (existing) return raise(state, existing.id)

      const { appId, title, defaultSize } = action
      const { x, y } = cascade(state.opened)
      const win = {
        id: state.nextId,
        appId,
        title,
        x,
        y,
        w: defaultSize.w,
        h: defaultSize.h,
        z: state.nextZ,
        minimized: false,
        maximized: false,
        restore: null,
      }
      return {
        ...state,
        windows: [...state.windows, win],
        focusedId: win.id,
        nextId: state.nextId + 1,
        nextZ: state.nextZ + 1,
        opened: state.opened + 1,
      }
    }

    case 'CLOSE': {
      const windows = state.windows.filter((w) => w.id !== action.id)
      if (windows.length === state.windows.length) return state
      // Focus falls to whatever is now topmost, matching how closing a
      // window in Win98 activates the one beneath it.
      const top = windows.reduce(
        (best, w) => (!w.minimized && (!best || w.z > best.z) ? w : best),
        null,
      )
      return { ...state, windows, focusedId: top ? top.id : null }
    }

    case 'FOCUS':
      // No-op when already focused so ordinary clicks don't burn a z value.
      if (state.focusedId === action.id) return state
      return raise(state, action.id)

    case 'MINIMIZE': {
      const next = patch(state, action.id, { minimized: true })
      if (state.focusedId !== action.id) return next
      const top = next.windows.reduce(
        (best, w) => (!w.minimized && (!best || w.z > best.z) ? w : best),
        null,
      )
      return { ...next, focusedId: top ? top.id : null }
    }

    case 'TOGGLE_FROM_TASKBAR': {
      const win = state.windows.find((w) => w.id === action.id)
      if (!win) return state
      // Authentic taskbar behavior: clicking the active window's button
      // minimizes it; anything else restores and focuses.
      if (state.focusedId === win.id && !win.minimized) {
        return windowReducer(state, actions.minimize(win.id))
      }
      return raise(state, win.id)
    }

    case 'TOGGLE_MAXIMIZE': {
      const win = state.windows.find((w) => w.id === action.id)
      if (!win) return state
      if (win.maximized) {
        const r = win.restore
        return patch(state, action.id, {
          maximized: false,
          restore: null,
          ...(r ? { x: r.x, y: r.y, w: r.w, h: r.h } : {}),
        })
      }
      const { width, height } = action.desktop
      return patch(state, action.id, (w) => ({
        maximized: true,
        restore: { x: w.x, y: w.y, w: w.w, h: w.h },
        x: 0,
        y: 0,
        w: width,
        h: height,
      }))
    }

    case 'SET_RECT':
      return patch(state, action.id, action.rect)

    default:
      return state
  }
}
