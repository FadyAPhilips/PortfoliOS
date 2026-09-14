import MenuBar from './MenuBar'

/** Read-only Notepad. The payload is { name, text }. */
export default function Notepad({ payload }) {
  if (!payload) return <p className="viewer-empty">No file open.</p>

  return (
    <div className="app-pane notepad">
      <MenuBar items={['File', 'Edit', 'Search', 'Help']} />
      {/* A real textarea so the text is selectable and scrolls natively. */}
      <textarea
        className="notepad-text app-grow"
        value={payload.text}
        readOnly
        spellCheck={false}
        aria-label={payload.name}
      />
    </div>
  )
}
