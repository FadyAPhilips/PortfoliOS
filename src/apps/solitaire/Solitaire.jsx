import { useCallback, useEffect, useRef, useState } from 'react'
import { useWindowActions, useWindows } from '../../os/WindowManager'
import MenuBar from '../MenuBar'
import Dialog from '../Dialog'
import { autoMove, drawFromStock, moveCards, newGame, solve, tick, undo } from './engine'
import { CARD_H, CARD_W, TABLE_H, TABLE_W, cardRect, slotRect } from './layout'
import { CardBack, CardDefs, CardFace } from './Cards'
import { cardKey, useCardDrag } from './useCardDrag'
import OptionsDialog from './OptionsDialog'
import DeckDialog from './DeckDialog'
import AboutDialog from './AboutDialog'
import WinAnimation from './WinAnimation'
import { rasterizeCards } from './rasterize'

const SLOTS = [
  { pile: 'stock' },
  { pile: 'waste' },
  ...[0, 1, 2, 3].map((index) => ({ pile: 'foundation', index })),
  ...[0, 1, 2, 3, 4, 5, 6].map((index) => ({ pile: 'tableau', index })),
]

// Every card on the table with where it sits, flattened for rendering.
// Cards keep a stable key across piles so React moves nodes, never remounts.
function placeCards(game) {
  const out = []
  const push = (k, loc, z) => out.push({ k, loc, z, rect: cardRect(game, loc) })
  game.stock.forEach((k, i) => push(k, { pile: 'stock', card: i }, i))
  game.waste.forEach((k, i) => push(k, { pile: 'waste', card: i }, i))
  game.foundations.forEach((pile, index) =>
    pile.forEach((k, i) => push(k, { pile: 'foundation', index, card: i }, i)),
  )
  game.tableau.forEach((col, index) =>
    col.forEach((k, i) => push(k, { pile: 'tableau', index, card: i }, i)),
  )
  return out
}

export default function Solitaire({ windowId }) {
  const { close } = useWindowActions()
  const { focusedId } = useWindows()
  const [game, setGame] = useState(() => newGame())
  const [ui, setUi] = useState({ statusBar: true, design: 0 })
  const [dialog, setDialog] = useState(null) // 'options' | 'deck' | 'about' | 'dealAgain'
  const [cascade, setCascade] = useState(null) // launches for WinAnimation
  const feltRef = useRef(null)
  const tableRef = useRef(null)
  const [scale, setScale] = useState(1)

  // sol.exe never scaled its cards, so the table only ever shrinks to fit.
  useEffect(() => {
    const el = feltRef.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      setScale(Math.min(1, width / TABLE_W, height / TABLE_H))
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // The clock runs from the first move until the game is won.
  useEffect(() => {
    if (!game.started || game.won) return
    const id = setInterval(() => setGame(tick), 1000)
    return () => clearInterval(id)
  }, [game.started, game.won])

  const deal = useCallback(() => {
    setCascade(null)
    setDialog(null)
    setGame(newGame(game.options))
  }, [game.options])

  // F2 deals, but only while this is the active window.
  useEffect(() => {
    if (focusedId !== windowId) return
    const onKey = (e) => {
      if (e.key === 'F2') {
        e.preventDefault()
        deal()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [focusedId, windowId, deal])

  // Winning — by play or by Solve — starts the cascade once the winning
  // table has rendered, so the foundation cards can be rasterized and
  // launched from where they really are on screen.
  useEffect(() => {
    if (!game.won || !tableRef.current) return
    let cancelled = false
    const table = tableRef.current
    const origin = table.getBoundingClientRect()
    rasterizeCards(table, document.getElementById('sol-defs')).then((images) => {
      if (cancelled) return
      const launches = []
      // Top card of each foundation in turn: the kings, then the queens…
      for (let rank = 13; rank >= 1; rank--) {
        game.foundations.forEach((pile, index) => {
          const k = pile[rank - 1]
          const img = k && images.get(String(cardKey(k)))
          if (!img) return
          const slot = slotRect({ pile: 'foundation', index })
          launches.push({
            img,
            x: origin.left + slot.x * scale,
            y: origin.top + slot.y * scale,
            w: CARD_W * scale,
            h: CARD_H * scale,
          })
        })
      }
      setCascade(launches)
    })
    return () => {
      cancelled = true
    }
  }, [game.won, game.foundations, scale])

  const drag = useCardDrag({
    tableRef,
    game,
    scale,
    onDrop: (from, to) => setGame((g) => moveCards(g, from, to)),
  })

  const onStock = () => setGame(drawFromStock)
  const onDouble = (loc) => setGame((g) => autoMove(g, loc))

  const applyOptions = (options, statusBar) => {
    setUi((u) => ({ ...u, statusBar }))
    // Windows redeals when the rules change; timing and the status bar
    // just take effect.
    const rulesChanged =
      options.draw !== game.options.draw || options.scoring !== game.options.scoring
    setGame(rulesChanged ? newGame(options) : { ...game, options })
    setDialog(null)
  }

  const menus = [
    {
      label: 'Game',
      menu: [
        { label: 'Deal', shortcut: 'F2', onSelect: deal },
        { label: 'Undo', disabled: !game.undo, onSelect: () => setGame(undo) },
        { label: 'Solve', disabled: game.won, onSelect: () => setGame(solve) },
        'separator',
        { label: 'Deck…', onSelect: () => setDialog('deck') },
        { label: 'Options…', onSelect: () => setDialog('options') },
        'separator',
        { label: 'Exit', onSelect: () => close(windowId) },
      ],
    },
    {
      label: 'Help',
      menu: [{ label: 'About Solitaire…', onSelect: () => setDialog('about') }],
    },
  ]

  return (
    <div className="sol">
      <MenuBar items={menus} />

      <div className="sol-felt" ref={feltRef}>
        <CardDefs />
        <div
          className="sol-table"
          ref={tableRef}
          style={{ width: TABLE_W, height: TABLE_H, transform: `scale(${scale})` }}
        >
          {SLOTS.map((loc) => {
            const r = slotRect(loc)
            const isStock = loc.pile === 'stock'
            return (
              <div
                key={`${loc.pile}${loc.index ?? ''}`}
                className={`sol-slot${isStock && game.stock.length === 0 ? ' sol-slot-stock' : ''}`}
                style={{ left: r.x, top: r.y, width: r.w, height: r.h }}
                onClick={isStock ? onStock : undefined}
              />
            )
          })}

          {placeCards(game).map(({ k, loc, z, rect }) => {
            const stock = loc.pile === 'stock'
            return (
              <div
                key={cardKey(k)}
                className="sol-card"
                data-key={cardKey(k)}
                style={{ left: rect.x, top: rect.y, zIndex: z }}
                onClick={stock ? onStock : undefined}
                onPointerDown={stock ? undefined : (e) => drag.begin(e, loc)}
                onPointerMove={stock ? undefined : drag.move}
                onPointerUp={stock ? undefined : drag.end}
                onPointerCancel={stock ? undefined : drag.end}
                onDoubleClick={stock ? undefined : () => onDouble(loc)}
              >
                {k.faceUp ? (
                  <CardFace rank={k.rank} suit={k.suit} />
                ) : (
                  <CardBack design={ui.design} />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {ui.statusBar && (
        <div className="status-bar sol-status">
          <p className="status-bar-field">Score: {game.score}</p>
          <p className="status-bar-field">Time: {game.seconds}</p>
          <p className="status-bar-field">
            <button
              type="button"
              className="sol-solve"
              onClick={() => setGame(solve)}
              disabled={game.won}
            >
              Solve
            </button>
          </p>
        </div>
      )}

      {dialog === 'options' && (
        <OptionsDialog
          options={game.options}
          statusBar={ui.statusBar}
          onOk={applyOptions}
          onCancel={() => setDialog(null)}
        />
      )}
      {dialog === 'deck' && (
        <DeckDialog
          design={ui.design}
          onOk={(design) => {
            setUi((u) => ({ ...u, design }))
            setDialog(null)
          }}
          onCancel={() => setDialog(null)}
        />
      )}
      {dialog === 'about' && <AboutDialog onClose={() => setDialog(null)} />}
      {dialog === 'dealAgain' && (
        <Dialog
          title="Solitaire"
          width={220}
          onClose={() => setDialog(null)}
          actions={
            <>
              <button type="button" onClick={deal}>
                Yes
              </button>
              <button type="button" onClick={() => setDialog(null)}>
                No
              </button>
            </>
          }
        >
          <p className="sol-deal-again">Deal again?</p>
        </Dialog>
      )}

      {cascade && (
        <WinAnimation
          launches={cascade}
          onDone={() => {
            setCascade(null)
            setDialog('dealAgain')
          }}
        />
      )}
    </div>
  )
}
