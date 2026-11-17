import { useState } from 'react'
import { useWindowActions } from '../os/WindowManager'
import { useSettings } from '../os/settingsContext'
import {
  DEFAULTS,
  DESKTOP_COLORS,
  FONT_STYLES,
  TEXT_SIZES,
  changedFields,
  cssVars,
} from '../os/settings'
import copy from '../content/settings.json'
import site from '../content/site.json'

const TABS = ['appearance', 'background', 'effects']
const label = (id) => copy.options[id] ?? id
const fill = (text) => text.replaceAll('{brand}', site.brand)

// The variables the preview needs to draw the staged choice in its own box.
const PREVIEW_VARS = [
  '--fs-ui',
  '--titlebar-h',
  '--font-ui',
  '--font-control',
  '--font-smoothing',
  '--desktop-teal',
]

/**
 * Display Properties. Changes are staged in the dialog and shown in the
 * preview; Apply commits them, OK commits and closes, Cancel (or the title
 * bar's close box) discards whatever wasn't applied — Windows 98 semantics.
 */
export default function Settings({ windowId }) {
  const { close } = useWindowActions()
  const { settings, commit } = useSettings()
  const [staged, setStaged] = useState(settings)
  const [tab, setTab] = useState(TABS[0])

  const pending = changedFields(settings, staged)
  const dirty = Object.keys(pending).length > 0
  const stage = (patch) => setStaged((s) => ({ ...s, ...patch }))

  const apply = () => dirty && commit(pending)
  const ok = () => {
    apply()
    close(windowId)
  }

  const vars = cssVars(staged)
  const previewStyle = Object.fromEntries(PREVIEW_VARS.map((k) => [k, vars[k]]))

  return (
    <div className="settings">
      <menu role="tablist">
        {TABS.map((id) => (
          <li key={id} role="tab" aria-selected={tab === id}>
            <a
              href={`#settings-${id}`}
              onClick={(e) => {
                e.preventDefault()
                setTab(id)
              }}
            >
              {copy.tabs[id]}
            </a>
          </li>
        ))}
      </menu>

      <div className="window settings-panel" role="tabpanel">
        <div className="window-body">
          {tab !== 'effects' && (
            <div className="settings-preview" style={previewStyle} aria-hidden="true">
              <div className="window">
                <div className="title-bar">
                  <div className="title-bar-text">{copy.appearance.preview.title}</div>
                </div>
                <div className="window-body">
                  <span>{copy.appearance.preview.text}</span>
                  <button type="button" tabIndex={-1}>
                    {copy.appearance.preview.button}
                  </button>
                </div>
              </div>
            </div>
          )}

          {tab === 'appearance' && (
            <>
              <div className="settings-field">
                <label htmlFor="settings-size">{copy.appearance.textSize}</label>
                <select
                  id="settings-size"
                  value={staged.textSize}
                  onChange={(e) => stage({ textSize: e.target.value })}
                >
                  {TEXT_SIZES.map(({ id }) => (
                    <option key={id} value={id}>
                      {label(id)}
                    </option>
                  ))}
                </select>

                <label htmlFor="settings-font">{copy.appearance.fontStyle}</label>
                <select
                  id="settings-font"
                  value={staged.fontStyle}
                  onChange={(e) => stage({ fontStyle: e.target.value })}
                >
                  {FONT_STYLES.map(({ id }) => (
                    <option key={id} value={id}>
                      {label(id)}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                className="settings-restore"
                onClick={() =>
                  stage({ textSize: DEFAULTS.textSize, fontStyle: DEFAULTS.fontStyle })
                }
              >
                {copy.appearance.restore}
              </button>
            </>
          )}

          {tab === 'background' && (
            <div>
              <p id="settings-colors-label">{copy.background.label}</p>
              <ul className="settings-colors" aria-labelledby="settings-colors-label">
                {DESKTOP_COLORS.map(({ id, hex }) => (
                  <li key={id}>
                    <button
                      type="button"
                      className={`settings-color${staged.desktopColor === id ? ' is-selected' : ''}`}
                      aria-pressed={staged.desktopColor === id}
                      onClick={() => stage({ desktopColor: id })}
                    >
                      <span className="settings-swatch" style={{ background: hex }} />
                      {label(id)}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {tab === 'effects' && (
            <div className="settings-check">
              <div className="field-row">
                <input
                  type="checkbox"
                  id="settings-welcome"
                  checked={staged.showWelcome}
                  onChange={(e) => stage({ showWelcome: e.target.checked })}
                />
                <label htmlFor="settings-welcome">{fill(copy.effects.showWelcome)}</label>
              </div>
              <div className="field-row">
                <input
                  type="checkbox"
                  id="settings-motion"
                  checked={staged.reduceMotion}
                  onChange={(e) => stage({ reduceMotion: e.target.checked })}
                />
                <label htmlFor="settings-motion">{copy.effects.reduceMotion}</label>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="settings-actions">
        <button type="button" onClick={ok}>
          {copy.buttons.ok}
        </button>
        <button type="button" onClick={() => close(windowId)}>
          {copy.buttons.cancel}
        </button>
        <button type="button" onClick={apply} disabled={!dirty}>
          {copy.buttons.apply}
        </button>
      </div>
    </div>
  )
}
