/**
 * An icon in a folder window. Same contract as DesktopIcon — pointerdown
 * selects, double-click or Enter/Space opens — but black-on-white with a
 * navy selection, so it carries its own styles rather than the desktop's.
 */
export default function FileIcon({ icon, label, selected, onSelect, onOpen }) {
  return (
    <button
      type="button"
      className={`file-icon${selected ? ' is-selected' : ''}`}
      onPointerDown={onSelect}
      onDoubleClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onOpen()
        }
      }}
    >
      <svg className="file-icon-img" aria-hidden="true">
        <use href={`/icons.svg#${icon}`} />
      </svg>
      <span className="file-icon-label">{label}</span>
    </button>
  )
}
