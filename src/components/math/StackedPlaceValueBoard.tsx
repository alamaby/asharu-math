import type { CSSProperties } from 'react'
import type { MathProblem } from '../../types'

// Komponen ini khusus papan kebun/akuarium sehingga pakai 'ones'
// (PlaceValue repo memakai 'units' untuk tempat satuan umum).
export type StackedColumnId = 'ones' | 'tens' | 'hundreds'

export interface StackedBoardProps {
  problem: MathProblem
  answers: (number | null)[]
  activeColumn: StackedColumnId | null
  carryValues: (number | null)[]
  borrowValues: (number | null)[]
  highlightColumn: StackedColumnId | null
  wrongColumns: boolean[]
  tone: 'sky' | 'emerald'
  onSelectColumn: (c: StackedColumnId) => void
}

export function columnIdForIndex(index: number, width: number): StackedColumnId {
  if (width === 2) {
    if (index === 0) return 'tens'
    if (index === 1) return 'ones'
  } else if (width === 3) {
    if (index === 0) return 'hundreds'
    if (index === 1) return 'tens'
    if (index === 2) return 'ones'
  }
  throw new Error(`Kolom di luar jangkauan: index ${index}, width ${width}`)
}

function labelText(id: StackedColumnId): string {
  if (id === 'hundreds') return 'Ratusan · R'
  if (id === 'tens') return 'Puluhan · P'
  return 'Satuan · S'
}

function answerLabel(id: StackedColumnId): string {
  if (id === 'hundreds') return 'ratusan'
  if (id === 'tens') return 'puluhan'
  return 'satuan'
}

function labelColor(id: StackedColumnId, tone: 'sky' | 'emerald'): string {
  if (id === 'hundreds') return 'text-violet-700'
  if (id === 'tens') return tone === 'sky' ? 'text-sky-700' : 'text-emerald-700'
  return 'text-amber-700'
}

function labelHighlight(id: StackedColumnId, tone: 'sky' | 'emerald'): string {
  if (id === 'hundreds') return 'rounded-full bg-violet-100 ring-2 ring-violet-300'
  if (id === 'tens')
    return tone === 'sky'
      ? 'rounded-full bg-sky-100 ring-2 ring-sky-300'
      : 'rounded-full bg-emerald-100 ring-2 ring-emerald-300'
  return 'rounded-full bg-amber-100 ring-2 ring-amber-300'
}

function digitBoxClass(id: StackedColumnId, tone: 'sky' | 'emerald'): string {
  const base =
    'flex h-11 w-11 items-center justify-center rounded-2xl border-2 text-xl font-black tabular-nums'
  if (id === 'hundreds') return `${base} border-violet-100 bg-violet-50 text-violet-700`
  if (id === 'tens')
    return tone === 'sky'
      ? `${base} border-sky-100 bg-sky-50 text-sky-700`
      : `${base} border-emerald-100 bg-emerald-50 text-emerald-700`
  return `${base} border-amber-100 bg-amber-50 text-amber-700`
}

function answerClass(active: boolean, wrong: boolean, highlight: boolean): string {
  const base =
    'flex h-11 w-11 items-center justify-center rounded-2xl border-2 text-xl font-black tabular-nums'
  const state = active
    ? 'border-sky-500 bg-sky-50 ring-4 ring-sky-200'
    : wrong
      ? 'border-amber-400 bg-amber-50'
      : highlight
        ? 'border-sky-300 bg-sky-50 ring-2 ring-sky-200'
        : 'border-slate-200 bg-white'
  return `${base} ${state}`
}

export default function StackedPlaceValueBoard({
  problem,
  answers,
  activeColumn,
  carryValues,
  borrowValues,
  highlightColumn,
  wrongColumns,
  tone,
  onSelectColumn,
}: StackedBoardProps) {
  const width = problem.columns.length
  if (width < 2 || width > 3) {
    throw new Error(`StackedPlaceValueBoard hanya untuk 2-3 digit, got width ${width}`)
  }
  if (answers.length !== width) {
    throw new Error(`answers.length ${answers.length} tidak sama dengan width ${width}`)
  }

  const op = problem.operation === 'addition' ? '+' : '−'
  const isAddition = problem.operation === 'addition'
  const operatorColumn = width + 1

  const place = (columnIndex: number, row: number): CSSProperties => ({
    gridColumn: String(columnIndex + 1),
    gridRow: String(row),
  })

  return (
    <div
      role="group"
      aria-label={`Soal ${problem.firstOperand} ${op} ${problem.secondOperand}, bersusun`}
      className="math-grid inline-grid gap-x-1"
      style={{ gridTemplateColumns: `repeat(${width}, 2.75rem) auto` }}
    >
      {problem.columns.map((column, i) => {
        const id = columnIdForIndex(i, width)
        const highlighted = highlightColumn === id
        return (
          <div key={`label-${column.index}`} style={place(i, 1)}>
            <span
              className={`w-11 text-center text-[0.65rem] font-black uppercase ${labelColor(id, tone)} ${highlighted ? labelHighlight(id, tone) : ''}`}
            >
              {labelText(id)}
            </span>
          </div>
        )
      })}
      <div style={{ gridColumn: String(operatorColumn), gridRow: '1' }} aria-hidden="true" />

      {problem.columns.map((column, i) => {
        const carry = carryValues[i] ?? null
        const borrow = borrowValues[i] ?? null
        const hideCarryForOnes = isAddition && i === width - 1
        return (
          <div
            key={`ann-${column.index}`}
            style={place(i, 2)}
            className="flex h-6 w-11 items-center justify-center"
          >
            {!hideCarryForOnes && carry != null ? (
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-violet-100 text-xs font-black text-violet-700 ring-2 ring-violet-200">
                {carry}
              </span>
            ) : borrow != null ? (
              <span className="flex h-6 w-11 items-center justify-center rounded-full bg-amber-100 text-[0.65rem] font-black text-amber-700">
                {borrow}
              </span>
            ) : null}
          </div>
        )
      })}
      <div style={{ gridColumn: String(operatorColumn), gridRow: '2' }} aria-hidden="true" />

      {problem.columns.map((column, i) => {
        const id = columnIdForIndex(i, width)
        return (
          <div key={`first-${column.index}`} style={place(i, 3)}>
            <div className={digitBoxClass(id, tone)}>
              {column.firstDigit ?? <span className="text-slate-300">·</span>}
            </div>
          </div>
        )
      })}
      <div style={{ gridColumn: String(operatorColumn), gridRow: '3' }} aria-hidden="true" />

      {problem.columns.map((column, i) => {
        const id = columnIdForIndex(i, width)
        return (
          <div key={`second-${column.index}`} style={place(i, 4)}>
            <div className={digitBoxClass(id, tone)}>
              {column.secondDigit ?? <span className="text-slate-300">·</span>}
            </div>
          </div>
        )
      })}
      <div style={{ gridColumn: String(operatorColumn), gridRow: '4' }}>
        <div
          className="flex h-11 w-8 items-center justify-center text-2xl font-black text-slate-700"
          aria-hidden="true"
          data-testid="stacked-operator"
        >
          {op}
        </div>
      </div>

      <div
        style={{ gridColumn: `1 / span ${width}`, gridRow: '5' }}
        aria-hidden="true"
        className="mb-1 h-1 rounded-full bg-slate-500"
      />

      {problem.columns.map((column, i) => {
        const id = columnIdForIndex(i, width)
        const value = answers[i]
        const active = activeColumn === id
        const wrong = wrongColumns[i] ?? false
        const highlighted = highlightColumn === id
        return (
          <div key={`ans-${column.index}`} style={place(i, 6)}>
            <button
              type="button"
              onClick={() => onSelectColumn(id)}
              aria-label={`Kotak jawaban ${answerLabel(id)}, ${value ?? 'kosong'}`}
              data-testid={`stacked-answer-${id}`}
              className={`${answerClass(active, wrong, highlighted)} focus-visible:outline-none focus-visible:ring-4`}
            >
              {value ?? '·'}
            </button>
          </div>
        )
      })}
      <div style={{ gridColumn: String(operatorColumn), gridRow: '6' }} aria-hidden="true" />
    </div>
  )
}
