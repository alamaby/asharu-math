import type { CSSProperties } from 'react'
import { PLACE_LABELS } from '../../lib/placeValue'
import type { PlaceValue } from '../../types'

interface AnswerCellProps {
  place: PlaceValue
  used: boolean
  value: number | null
  active?: boolean
  done?: boolean
  wrong?: boolean
  /** Kolom sedang dibahas pada mode belajar (sorot lembut) */
  columnHighlighted?: boolean
  onSelect?: () => void
  testId?: string
}

/**
 * Kotak jawaban satu digit. Berupa tombol (bukan input) supaya
 * keyboard huruf perangkat mobile tidak pernah muncul; input digit
 * datang dari keyboard angka aplikasi atau keyboard fisik.
 */
export default function AnswerCell({
  place,
  used,
  value,
  active = false,
  done = false,
  wrong = false,
  columnHighlighted = false,
  onSelect,
  testId,
}: AnswerCellProps) {
  const placeLabel = PLACE_LABELS[place]
  const stateClass = active
    ? 'border-sky-500 bg-sky-50 ring-4 ring-sky-200 text-sky-900'
    : done
      ? 'border-emerald-400 bg-emerald-50 text-emerald-700'
      : wrong
        ? 'border-amber-500 bg-amber-50 text-amber-800'
        : columnHighlighted
          ? 'border-sky-400 bg-sky-50 text-sky-900 ring-2 ring-sky-200'
          : used
            ? 'border-slate-300 bg-white text-slate-800'
            : 'border-slate-200 border-dashed bg-white/50 text-slate-400'

  const style: CSSProperties = { width: 'var(--cell-w)', height: 'var(--cell-w)' }

  return (
    <div className="relative flex justify-center">
      {active && (
        <span
          aria-hidden="true"
          className="motion-safe:animate-bounce absolute -top-5 text-lg text-sky-500"
        >
          ▾
        </span>
      )}
      <button
        type="button"
        data-testid={testId}
        onClick={onSelect}
        disabled={!onSelect}
        style={style}
        aria-label={`Kotak jawaban ${placeLabel}${value === null ? ', kosong' : `, berisi ${value}`}`}
        className={`flex items-center justify-center rounded-xl border-2 text-3xl font-extrabold tabular-nums shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-300 disabled:cursor-default ${stateClass} ${
          onSelect ? 'cursor-pointer hover:border-sky-400' : ''
        }`}
      >
        {value ?? ''}
      </button>
    </div>
  )
}
