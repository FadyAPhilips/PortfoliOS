const DIRECTIONS = ['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw']

/**
 * Eight invisible grab strips around the window edge. Corners sit above the
 * edges (higher z-index in CSS) so they win the overlap.
 */
export default function ResizeHandles({ onBegin, onMove, onEnd }) {
  return (
    <>
      {DIRECTIONS.map((dir) => (
        <div
          key={dir}
          className={`resize-handle resize-${dir}`}
          onPointerDown={(e) => onBegin(e, dir)}
          onPointerMove={onMove}
          onPointerUp={onEnd}
          onPointerCancel={onEnd}
        />
      ))}
    </>
  )
}
