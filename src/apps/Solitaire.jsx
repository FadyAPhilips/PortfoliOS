// Placeholder — the game itself is a later pass. This stub reserves the
// window and its felt-green play surface.
export default function Solitaire() {
  return (
    <div className="app-pane">
      <div className="felt app-grow">
        <div className="felt-note">
          <p>Solitaire</p>
          <p className="app-sub">Coming soon</p>
        </div>
      </div>
      <div className="status-bar">
        <p className="status-bar-field">Score: 0</p>
        <p className="status-bar-field">Time: 0</p>
      </div>
    </div>
  )
}
