import { useWindowActions } from '../os/WindowManager'

/**
 * A skill's Properties, as a real desktop window rather than a modal — it
 * drags, resizes, minimizes and gets its own taskbar button like any other
 * program. The window frame supplies the title bar and close box, so all
 * this renders is the tab and its panel.
 *
 * Opened only from the Skills tree, which passes the skill as the payload.
 * One "General" tab: name and description are the only fields there are, and
 * Device Manager showed a lone General tab for simple devices too.
 */
export default function SkillProperties({ windowId, payload }) {
  const { close } = useWindowActions()

  if (!payload) return <p className="viewer-empty">No skill selected.</p>

  return (
    <div className="app-pane skill-props">
      {/* No href: there is only one tab, so there is nowhere to navigate. */}
      <menu role="tablist">
        <li role="tab" aria-selected="true">
          <a>General</a>
        </li>
      </menu>

      <div className="window props-panel" role="tabpanel">
        <div className="window-body">
          <h3 className="app-title">{payload.name}</h3>
          <hr className="props-rule" />
          {payload.description ? (
            <p>{payload.description}</p>
          ) : (
            <p className="props-empty">No description available.</p>
          )}
        </div>
      </div>

      <div className="props-actions">
        <button type="button" onClick={() => close(windowId)}>
          OK
        </button>
      </div>
    </div>
  )
}
