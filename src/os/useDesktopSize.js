import { useEffect, useState } from 'react'
import { COMPACT_BREAKPOINT, TASKBAR_H } from './constants'

const read = () => {
  const width = window.innerWidth
  const height = window.innerHeight - TASKBAR_H
  return { width, height, isCompact: width < COMPACT_BREAKPOINT }
}

/**
 * Usable desktop area — the viewport minus the taskbar. Drives maximize
 * bounds, drag clamping, and the compact (mobile) layout switch.
 */
export function useDesktopSize() {
  const [size, setSize] = useState(read)

  useEffect(() => {
    let frame = 0
    const onResize = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => setSize(read()))
    }
    window.addEventListener('resize', onResize)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('resize', onResize)
    }
  }, [])

  return size
}
