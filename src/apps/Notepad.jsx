import { useEffect, useState } from 'react'
import MenuBar from './MenuBar'
import { loadTextFile } from './loadTextFile'

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

  return (
    <div className="app-pane notepad">
      <MenuBar items={['File', 'Edit', 'Search', 'Help']} />
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
        />
      )}
    </div>
  )
}
