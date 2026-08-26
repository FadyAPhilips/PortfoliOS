import { useWindows } from '../os/WindowManager'
import Window from './Window'

export default function WindowLayer() {
  const { windows, focusedId } = useWindows()

  return (
    <>
      {windows
        .filter((w) => !w.minimized)
        .map((w) => (
          <Window key={w.id} win={w} focused={w.id === focusedId} />
        ))}
    </>
  )
}
