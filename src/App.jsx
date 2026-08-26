import { useCallback, useState } from 'react'
import { WindowManagerProvider } from './os/WindowManager'
import Desktop from './components/Desktop'
import WindowLayer from './components/WindowLayer'
import Taskbar from './components/Taskbar'

export default function App() {
  const [startOpen, setStartOpen] = useState(false)
  const closeStart = useCallback(() => setStartOpen(false), [])

  return (
    <WindowManagerProvider>
      <Desktop onBackgroundPointerDown={closeStart}>
        <WindowLayer />
      </Desktop>
      <Taskbar
        startOpen={startOpen}
        onToggleStart={() => setStartOpen((v) => !v)}
        onCloseStart={closeStart}
      />
    </WindowManagerProvider>
  )
}
