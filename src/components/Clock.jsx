import { useEffect, useState } from 'react'

const format = (d) =>
  d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })

export default function Clock() {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="tray">
      <span className="tray-clock" title={now.toLocaleDateString()}>
        {format(now)}
      </span>
    </div>
  )
}
