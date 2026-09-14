import Dialog from '../Dialog'

export default function AboutDialog({ onClose }) {
  return (
    <Dialog
      title="About Solitaire"
      onClose={onClose}
      width={280}
      actions={
        <button type="button" onClick={onClose}>
          OK
        </button>
      }
    >
      <div className="sol-about">
        <svg className="sol-about-icon" aria-hidden="true">
          <use href="/icons.svg#icon-solitaire" />
        </svg>
        <div>
          <p className="app-title">Solitaire</p>
          <p className="app-sub">Version 1.0 · PortfoliOS</p>
          <p>Klondike, the way Windows 98 played it. Original artwork.</p>
        </div>
      </div>
    </Dialog>
  )
}
