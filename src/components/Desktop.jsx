import { useState } from 'react'
import { APPS, APP_ORDER } from '../apps/registry'
import { useWindowActions } from '../os/WindowManager'
import DesktopIcon from './DesktopIcon'

export default function Desktop({ children, onBackgroundPointerDown }) {
  const [selected, setSelected] = useState(null)
  const { openApp } = useWindowActions()

  return (
    <div
      className="desktop"
      onPointerDown={(e) => {
        // Windows and icons are children of the desktop, so only clear the
        // selection when the press really landed on empty background.
        if (!e.target.closest('.desktop-icon')) setSelected(null)
        onBackgroundPointerDown?.()
      }}
    >
      <div className="icon-field">
        {APP_ORDER.map((appId) => (
          <DesktopIcon
            key={appId}
            appId={appId}
            app={APPS[appId]}
            selected={selected === appId}
            onSelect={setSelected}
            onOpen={openApp}
          />
        ))}
      </div>
      {children}
    </div>
  )
}
