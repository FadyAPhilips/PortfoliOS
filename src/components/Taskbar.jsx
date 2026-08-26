import { APPS } from '../apps/registry'
import { useWindowActions, useWindows } from '../os/WindowManager'
import site from '../content/site.json'
import Clock from './Clock'
import StartMenu from './StartMenu'

export default function Taskbar({ startOpen, onToggleStart, onCloseStart }) {
  const { windows, focusedId } = useWindows()
  const { toggleFromTaskbar } = useWindowActions()

  return (
    <>
      <StartMenu open={startOpen} onClose={onCloseStart} />

      <div className="taskbar" onPointerDown={(e) => e.stopPropagation()}>
        <button
          type="button"
          className={`start-button${startOpen ? ' is-open' : ''}`}
          aria-expanded={startOpen}
          onClick={onToggleStart}
        >
          <svg className="start-logo" aria-hidden="true">
            <use href="/icons.svg#icon-logo" />
          </svg>
          <strong>{site.startMenuLabel}</strong>
        </button>

        <div className="taskbar-divider" />

        <div className="task-buttons">
          {windows.map((w) => (
            <button
              key={w.id}
              type="button"
              className={`task-button${
                w.id === focusedId && !w.minimized ? ' is-active' : ''
              }`}
              onClick={() => toggleFromTaskbar(w.id)}
            >
              <svg className="task-icon" aria-hidden="true">
                <use href={`/icons.svg#${APPS[w.appId].icon}`} />
              </svg>
              <span>{w.title}</span>
            </button>
          ))}
        </div>

        <Clock />
      </div>
    </>
  )
}
