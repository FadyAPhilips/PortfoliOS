import { createContext, useContext, useMemo, useReducer } from 'react'
import { actions, initialState, windowReducer } from './windowReducer'
import { useDesktopSize } from './useDesktopSize'
import { APPS } from '../apps/registry'

// Split so components that only ever dispatch (icons, menu items) don't
// re-render when window state changes. `dispatch` is referentially stable.
const WindowStateContext = createContext(null)
const WindowActionsContext = createContext(null)
const DesktopSizeContext = createContext(null)

export function WindowManagerProvider({ children }) {
  const [state, dispatch] = useReducer(windowReducer, initialState)
  const desktop = useDesktopSize()

  // Bound once — every consumer gets the same function identities.
  const api = useMemo(
    () => ({
      // `opts` is { payload, title, key } — see actions.openApp.
      openApp: (appId, opts) =>
        dispatch(actions.openApp(appId, APPS[appId], opts)),
      update: (id, patch) => dispatch(actions.update(id, patch)),
      close: (id) => dispatch(actions.close(id)),
      focus: (id) => dispatch(actions.focus(id)),
      minimize: (id) => dispatch(actions.minimize(id)),
      toggleFromTaskbar: (id) => dispatch(actions.toggleFromTaskbar(id)),
      setRect: (id, rect) => dispatch(actions.setRect(id, rect)),
    }),
    [],
  )

  // Maximize needs the live desktop bounds, so it can't be memoized with [].
  const actionsValue = useMemo(
    () => ({
      ...api,
      toggleMaximize: (id) => dispatch(actions.toggleMaximize(id, desktop)),
    }),
    [api, desktop],
  )

  return (
    <WindowStateContext.Provider value={state}>
      <DesktopSizeContext.Provider value={desktop}>
        <WindowActionsContext.Provider value={actionsValue}>
          {children}
        </WindowActionsContext.Provider>
      </DesktopSizeContext.Provider>
    </WindowStateContext.Provider>
  )
}

export const useWindows = () => useContext(WindowStateContext)
export const useWindowActions = () => useContext(WindowActionsContext)
export const useDesktop = () => useContext(DesktopSizeContext)
