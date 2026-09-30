import { useEffect, useState } from 'react'
import MenuBar from './MenuBar'
import { loadTextFile } from './loadTextFile'
import ZoomControls from './ZoomControls'

// 100% is Notepad's 12px text; the text rewraps at every level, so zooming
// never needs a sideways scroll.
const ZOOM_STEPS = [0.5, 0.75, 1, 1.25, 1.5, 2, 2.5, 3]
const BASE_FONT_PX = 12

/**
 * Read-only Notepad. The payload is either { name, text } for text the JSON
 * carries (the derived README) or { name, src } for a file read from
 * public/ when it opens.
 */
export default function Notepad({ payload }) {
  const { name, text, src } = payload ?? {}
  // Keyed by src rather than a bare flag, so opening another file shows its
  // own state instead of the last one's contents.
  const [read, setRead] = useState(null)
  // Keyed by file for the same reason: a newly opened file starts at 100%.
  const [zoom, setZoom] = useState({ file: null, level: 1 })

  useEffect(() => {
    if (!src) return
    // A slow read of the file we just left must not land on top of this one.
    let ignore = false
    loadTextFile(src).then(
      (contents) => !ignore && setRead({ src, contents }),
      () => !ignore && setRead({ src, contents: null }),
    )
    return () => {
      ignore = true
    }
  }, [src])

  if (!payload) return <p className="viewer-empty">No file open.</p>

  const done = !src || read?.src === src
  const contents = src ? read?.contents : text
  const file = src ?? name
  const level = zoom.file === file ? zoom.level : 1

  return (
    <div className="app-pane notepad">
      <MenuBar items={['File', 'Edit', 'Search', 'Help']} />
      <div className="viewer-toolbar">
        <ZoomControls
          steps={ZOOM_STEPS}
          level={level}
          onChange={(next) => setZoom({ file, level: next })}
        />
      </div>
      {!done ? (
        <p className="viewer-empty">Opening {name}…</p>
      ) : contents === null || contents === undefined ? (
        <p className="viewer-empty">Cannot display {name}.</p>
      ) : (
        /* A real textarea so the text is selectable and scrolls natively. */
        <textarea
          className="notepad-text app-grow"
          value={contents}
          readOnly
          spellCheck={false}
          aria-label={name}
          style={{ fontSize: BASE_FONT_PX * level }}
        />
      )}
    </div>
  )
}
