export default function DesktopIcon({ appId, app, selected, onSelect, onOpen }) {
  return (
    <button
      type="button"
      className={`desktop-icon${selected ? ' is-selected' : ''}`}
      // pointerdown rather than click so selection lands before the
      // desktop's deselect pass. Deliberately does NOT stopPropagation —
      // that would also swallow the Start menu's document-level close
      // listener, leaving the menu open behind the icon.
      onPointerDown={() => onSelect(appId)}
      onDoubleClick={() => onOpen(appId)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onOpen(appId)
        }
      }}
    >
      <svg className="desktop-icon-img" aria-hidden="true">
        <use href={`/icons.svg#${app.icon}`} />
      </svg>
      <span className="desktop-icon-label">{app.title}</span>
    </button>
  )
}
