import { useEffect, useState } from 'react'
import data from '../content/skills.json'

/**
 * A Win95 Properties dialog, modal to the Skills window rather than to the
 * desktop — it renders inside the app pane, so the window manager stays out
 * of it. One "General" tab: name and description are the only fields there
 * are, and Device Manager shows a lone General tab for simple devices too.
 */
function SkillProperties({ skill, onClose }) {
  return (
    <div className="props-backdrop" onClick={onClose}>
      <div
        className="window props-dialog"
        role="dialog"
        aria-modal="true"
        aria-label={`${skill.name} Properties`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="title-bar">
          <div className="title-bar-text">{skill.name} Properties</div>
          <div className="title-bar-controls">
            <button type="button" aria-label="Close" onClick={onClose} />
          </div>
        </div>
        <div className="window-body">
          {/* No href: there is only one tab, so there is nowhere to navigate. */}
          <menu role="tablist">
            <li role="tab" aria-selected="true">
              <a>General</a>
            </li>
          </menu>
          <div className="window props-panel" role="tabpanel">
            <div className="window-body">
              <h3 className="app-title">{skill.name}</h3>
              <hr className="props-rule" />
              {skill.description ? (
                <p>{skill.description}</p>
              ) : (
                <p className="props-empty">No description available.</p>
              )}
            </div>
          </div>
          <div className="props-actions">
            <button type="button" onClick={onClose}>
              OK
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Skills() {
  const { groups } = data
  const [active, setActive] = useState(null)
  const total = groups.reduce((n, g) => n + g.items.length, 0)

  // Escape dismisses the dialog, the way a real modal does.
  useEffect(() => {
    if (!active) return
    const onKey = (e) => {
      if (e.key === 'Escape') setActive(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [active])

  return (
    <div className="app-pane skills">
      {/* 98.css draws the +/- boxes, dotted connectors and indentation from
          <details>/<summary> alone, and <details> holds the open state. */}
      <ul className="tree-view app-grow">
        {groups.map((group, gi) => (
          <li key={group.name}>
            <details open={gi === 0}>
              <summary>{group.name}</summary>
              <ul>
                {group.items.map((item) => (
                  <li key={item.name}>
                    <button
                      type="button"
                      className={`skill-leaf${
                        active?.name === item.name ? ' selected' : ''
                      }`}
                      onClick={() => setActive(item)}
                    >
                      {item.name}
                    </button>
                  </li>
                ))}
              </ul>
            </details>
          </li>
        ))}
      </ul>

      <div className="status-bar">
        <p className="status-bar-field">{total} item(s)</p>
        <p className="status-bar-field">{active ? active.name : ''}</p>
      </div>

      {active && (
        <SkillProperties skill={active} onClose={() => setActive(null)} />
      )}
    </div>
  )
}
