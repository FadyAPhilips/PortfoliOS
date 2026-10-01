import { useEffect, useState } from 'react'
import { checkPdf } from './loadPdf'

/**
 * PDF Viewer. The payload is { name, src, details? }. The browser's own
 * reader draws the document in an iframe — but only after checkPdf confirms
 * the path really is a PDF, because a mistyped one is answered with the app
 * shell. `details` comes from Homework entries ({ fields, verifyUrl }) and
 * shows as a strip above the page; a project PDF has none and shows none.
 */
export default function PdfViewer({ payload }) {
  const { name, src, details } = payload ?? {}
  // Keyed by src so opening another file shows its own state, not the last.
  const [check, setCheck] = useState(null)

  useEffect(() => {
    if (!src) return
    // A slow check of the file we just left must not land on this one.
    let ignore = false
    checkPdf(src).then(
      () => !ignore && setCheck({ src, ok: true }),
      () => !ignore && setCheck({ src, ok: false }),
    )
    return () => {
      ignore = true
    }
  }, [src])

  if (!src) return <p className="viewer-empty">No file open.</p>

  const fields = details?.fields ?? []
  const verifyUrl = details?.verifyUrl
  const state = check?.src !== src ? 'checking' : check.ok ? 'ok' : 'failed'

  return (
    <div className="app-pane pdf">
      {(fields.length > 0 || verifyUrl) && (
        <div className="pdf-details">
          <dl>
            {fields.map(({ label, value }) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
          {verifyUrl && (
            <a href={verifyUrl} target="_blank" rel="noopener noreferrer">
              View original
            </a>
          )}
        </div>
      )}

      <div className="viewer-toolbar">
        {/* Mobile browsers often won't draw a PDF inline; this always works. */}
        {state === 'ok' && (
          <a href={src} target="_blank" rel="noopener noreferrer">
            Open in new tab
          </a>
        )}
      </div>

      <div className="pdf-page app-grow">
        {state === 'checking' && <p className="viewer-empty">Opening {name}…</p>}
        {state === 'failed' && <p className="viewer-empty">Cannot display {name}.</p>}
        {state === 'ok' && <iframe key={src} className="pdf-frame" src={src} title={name} />}
      </div>
    </div>
  )
}
