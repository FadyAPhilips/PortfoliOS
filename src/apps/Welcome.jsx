import { useState } from 'react'
import { useWindowActions } from '../os/WindowManager'
import { APPS } from './registry'
import site from '../content/site.json'
import { topics } from '../content/welcome.json'

// welcome.json writes the owner and brand as tokens so they live in one place.
const fill = (text) =>
  text.replaceAll('{owner}', site.owner).replaceAll('{brand}', site.brand)

/**
 * Windows 98's "Welcome to Windows" screen: a banner, a Contents list down
 * the left, the chosen topic on the right, and Close in the corner.
 */
export default function Welcome({ windowId }) {
  const { openApp, close } = useWindowActions()
  const [selected, setSelected] = useState(0)
  const topic = topics[selected]
  // An unknown id would crash openApp, so it just gets no button.
  const launch = topic?.open && APPS[topic.open] ? topic.open : null

  return (
    <div className="welcome">
      <div className="welcome-banner">
        <span className="welcome-word">Welcome</span>
        <span className="welcome-to">
          to <strong>{site.brand}</strong>
        </span>
      </div>

      <div className="welcome-main">
        <nav className="welcome-contents" aria-label="Contents">
          <h3>Contents</h3>
          <ul>
            {topics.map((t, i) => (
              <li key={t.title}>
                <button
                  type="button"
                  className={i === selected ? 'is-selected' : undefined}
                  aria-current={i === selected ? 'true' : undefined}
                  onClick={() => setSelected(i)}
                >
                  <svg aria-hidden="true">
                    <use href={`/icons.svg#${t.icon}`} />
                  </svg>
                  <span>{fill(t.title)}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {topic && (
          <section className="welcome-page" aria-live="polite">
            <h2>{fill(topic.title)}</h2>
            {topic.body.map((p) => (
              <p key={p}>{fill(p)}</p>
            ))}
            {launch && (
              <button type="button" onClick={() => openApp(launch)}>
                Open {APPS[launch].title}
              </button>
            )}
          </section>
        )}
      </div>

      <div className="welcome-actions">
        <button type="button" onClick={() => close(windowId)}>
          Close
        </button>
      </div>
    </div>
  )
}
