import { useRef, useState } from 'react'

const format = (seconds) => {
  if (!Number.isFinite(seconds)) return '0:00'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${String(s).padStart(2, '0')}`
}

const CANNOT_PLAY = 'Cannot play file'

function Player({ src, name }) {
  const ref = useRef(null)
  const [status, setStatus] = useState('Stopped')
  const [time, setTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const failed = status === CANNOT_PLAY

  const toggle = () => {
    const v = ref.current
    if (!v) return
    if (v.paused) v.play().catch(() => setStatus(CANNOT_PLAY))
    else v.pause()
  }

  const stop = () => {
    const v = ref.current
    if (!v) return
    v.pause()
    // Rewound before the (async) pause event fires, so onPause reads 0 and
    // reports Stopped rather than Paused.
    v.currentTime = 0
  }

  return (
    <div className="app-pane media">
      <div className="media-screen app-grow">
        <video
          ref={ref}
          className="media-video"
          src={src}
          preload="metadata"
          playsInline
          onPlay={() => setStatus('Playing')}
          onPause={(e) =>
            setStatus(e.currentTarget.currentTime === 0 ? 'Stopped' : 'Paused')
          }
          onEnded={() => setStatus('Stopped')}
          onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
          onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
          onError={() => setStatus(CANNOT_PLAY)}
        />
      </div>

      <div className="media-transport">
        <button type="button" onClick={toggle} disabled={failed}>
          {status === 'Playing' ? 'Pause' : 'Play'}
        </button>
        <button type="button" onClick={stop} disabled={failed}>
          Stop
        </button>
        <input
          type="range"
          className="media-seek"
          min="0"
          max={duration || 0}
          step="0.1"
          value={time}
          disabled={!duration}
          aria-label="Seek"
          onChange={(e) => {
            if (ref.current) ref.current.currentTime = Number(e.target.value)
          }}
        />
        <span className="media-time">
          {format(time)} / {format(duration)}
        </span>
      </div>

      <div className="status-bar">
        <p className="status-bar-field">{status}</p>
        <p className="status-bar-field">{name}</p>
      </div>
    </div>
  )
}

/**
 * Media Player. The payload is { src, name }. Keyed on src so opening a
 * different clip into this (single-instance) window remounts the player
 * with fresh transport state instead of carrying the old clip's over.
 */
export default function MediaPlayer({ payload }) {
  if (!payload) return <p className="viewer-empty">No file open.</p>
  return <Player key={payload.src} src={payload.src} name={payload.name} />
}
