import { useState } from 'react'
import { useWindowActions } from '../os/WindowManager'
import data from '../content/skills.json'

export default function Skills() {
  const { groups } = data
  const { openApp } = useWindowActions()
  const [selected, setSelected] = useState(null)
  const total = groups.reduce((n, g) => n + g.items.length, 0)

  // Properties is a real window, not a modal. It's single-instance, so
  // clicking through the tree swaps that window's contents and retitles it
  // rather than leaving fifty-odd windows behind.
  const openProperties = (item) => {
    setSelected(item.name)
    openApp('skillprops', {
      title: `${item.name} Properties`,
      payload: item,
    })
  }

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
                        selected === item.name ? ' selected' : ''
                      }`}
                      onClick={() => openProperties(item)}
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
        <p className="status-bar-field">{selected ?? ''}</p>
      </div>
    </div>
  )
}
