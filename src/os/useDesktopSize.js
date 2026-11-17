import { useEffect, useState } from 'react'
import { COMPACT_BREAKPOINT } from './constants'

const read = (taskbarH) => {
  const width = window.innerWidth
  const height = window.innerHeight - taskbarH
  return { width, height, isCompact: width < COMPACT_BREAKPOINT }
}

/**
 * Usable desktop area — the viewport minus the taskbar. Drives maximize
 * bounds, drag clamping, and the compact (mobile) layout switch.
 *
 * `taskbarH` is the live taskbar height from the text size setting; changing
 * it re-reads the size, so maximized and compact windows refit at once.
 */
export function useDesktopSize(taskbarH) {
  const [size, setSize] = useState(() => read(taskbarH))

  useEffect(() => {
    let frame = 0
    const onResize = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => setSize(read(taskbarH)))
    }
    // A new taskbar height applies now, not on the next browser resize.
    onResize()
    window.addEventListener('resize', onResize)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('resize', onResize)
    }
  }, [taskbarH])

  return size
}
