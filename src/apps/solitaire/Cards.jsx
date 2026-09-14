import { isRed } from './engine'
import { BACKS, PIPS, RANK_LABELS, SUIT_PATHS } from './cardArt'

const W = 71
const H = 96
const CX = W / 2
const CY = H / 2
const RED = '#d00000'
const BLACK = '#000'
const GOLD = '#ffd020'

/**
 * Shared <defs>: the four suit symbols and the six back patterns, rendered
 * ONCE by the table. Every card references them by id, so 52 faces don't
 * each carry their own copies (and the document doesn't fill with duplicate
 * ids).
 */
export function CardDefs() {
  return (
    <svg id="sol-defs" width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
      <defs>
        {SUIT_PATHS.map((d, suit) => (
          <symbol key={suit} id={`sol-suit-${suit}`} viewBox="0 0 20 20">
            <path d={d} fill={isRed(suit) ? RED : BLACK} />
          </symbol>
        ))}
        {BACKS.map((b, i) => (
          <pattern
            key={i}
            id={`sol-back-${i}`}
            width={b.tile}
            height={b.kind === 'waves' ? b.tile / 2 : b.tile}
            patternUnits="userSpaceOnUse"
          >
            <rect width={b.tile} height={b.tile} fill={b.bg} />
            <BackMotif back={b} />
          </pattern>
        ))}
      </defs>
    </svg>
  )
}

function BackMotif({ back: b }) {
  const t = b.tile
  switch (b.kind) {
    case 'diagonals':
      return <path d={`M0 ${t} L${t} 0 M${-t / 2} ${t / 2} L${t / 2} ${-t / 2} M${t / 2} ${t * 1.5} L${t * 1.5} ${t / 2}`} stroke={b.ink} strokeWidth="1" />
    case 'grid':
      return <path d={`M0 ${t / 2} H${t} M${t / 2} 0 V${t}`} stroke={b.ink} strokeWidth="0.8" />
    case 'dots':
      return <circle cx={t / 2} cy={t / 2} r="1.4" fill={b.ink} />
    case 'rings':
      return <circle cx={t / 2} cy={t / 2} r={t / 3} fill="none" stroke={b.ink} strokeWidth="1" />
    case 'checks':
      return (
        <>
          <rect width={t / 2} height={t / 2} fill={b.ink} />
          <rect x={t / 2} y={t / 2} width={t / 2} height={t / 2} fill={b.ink} />
        </>
      )
    case 'waves':
      return <path d={`M0 ${t / 4} Q${t / 4} 0 ${t / 2} ${t / 4} T${t} ${t / 4}`} fill="none" stroke={b.ink} strokeWidth="1" />
    default:
      return null
  }
}

function Frame() {
  return <rect x="0.5" y="0.5" width={W - 1} height={H - 1} rx="4" fill="#fff" stroke={BLACK} />
}

function Corner({ rank, suit }) {
  return (
    <>
      <text x="4" y="14" fontFamily="Arial, sans-serif" fontSize="12" fontWeight="bold" fill={isRed(suit) ? RED : BLACK}>
        {RANK_LABELS[rank]}
      </text>
      <use href={`#sol-suit-${suit}`} x="4" y="16" width="9" height="9" />
    </>
  )
}

// Pip area: columns at x 22 / 35.5 / 49, rows from y 24 to 72.
const PIP = 11
const COL_X = [22, CX, 49]
const pipAt = (row) => 24 + row * 48

function Pips({ rank, suit }) {
  if (rank === 1) {
    const s = 30
    return <use href={`#sol-suit-${suit}`} x={CX - s / 2} y={CY - s / 2} width={s} height={s} />
  }
  return PIPS[rank].map(([col, row], i) => {
    const cx = COL_X[col]
    const cy = pipAt(row)
    const flip = row > 0.5 ? `rotate(180 ${cx} ${cy})` : undefined
    return (
      <use
        key={i}
        href={`#sol-suit-${suit}`}
        x={cx - PIP / 2}
        y={cy - PIP / 2}
        width={PIP}
        height={PIP}
        transform={flip}
      />
    )
  })
}

// K / Q / J: a stylized figure — headgear over a head over shoulders in the
// suit's colour — mirrored top and bottom the way court cards are.
function Court({ rank, suit }) {
  const robe = isRed(suit) ? RED : '#203070'
  const headgear =
    rank === 13 ? (
      <path d="M25 25 L28 16 L32 21 L35.5 13 L39 21 L43 16 L46 25 Z" fill={GOLD} stroke={BLACK} strokeWidth="0.8" />
    ) : rank === 12 ? (
      <>
        <path d="M26 25 Q35.5 11 45 25 Z" fill={GOLD} stroke={BLACK} strokeWidth="0.8" />
        <circle cx="35.5" cy="17" r="1.6" fill={RED} />
      </>
    ) : (
      <>
        <rect x="26" y="19" width="19" height="6" rx="1" fill={robe} stroke={BLACK} strokeWidth="0.8" />
        <path d="M44 20 L52 14" stroke={GOLD} strokeWidth="1.5" />
      </>
    )
  const figure = (
    <>
      {headgear}
      <circle cx="35.5" cy="31" r="6.5" fill="#f0c090" stroke={BLACK} strokeWidth="0.8" />
      <path d="M21 47 Q35.5 33 50 47 Z" fill={robe} stroke={BLACK} strokeWidth="0.8" />
      <use href={`#sol-suit-${suit}`} x="31" y="39" width="9" height="9" />
    </>
  )
  return (
    <>
      <rect x="12.5" y="15.5" width="46" height="65" fill="#fff" stroke={BLACK} strokeWidth="0.8" />
      {figure}
      <g transform={`rotate(180 ${CX} ${CY})`}>{figure}</g>
    </>
  )
}

export function CardFace({ rank, suit }) {
  return (
    <svg viewBox={`0 0 ${W} ${H}`} aria-label={`${RANK_LABELS[rank]} of ${['spades', 'hearts', 'clubs', 'diamonds'][suit]}`}>
      <Frame />
      <Corner rank={rank} suit={suit} />
      <g transform={`rotate(180 ${CX} ${CY})`}>
        <Corner rank={rank} suit={suit} />
      </g>
      {rank > 10 ? <Court rank={rank} suit={suit} /> : <Pips rank={rank} suit={suit} />}
    </svg>
  )
}

export function CardBack({ design = 0 }) {
  return (
    <svg viewBox={`0 0 ${W} ${H}`} aria-hidden="true">
      <Frame />
      <rect x="4" y="4" width={W - 8} height={H - 8} rx="2" fill={`url(#sol-back-${design})`} stroke={BLACK} strokeWidth="0.8" />
    </svg>
  )
}
