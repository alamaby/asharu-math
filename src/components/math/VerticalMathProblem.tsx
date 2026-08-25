import { useMemo, type CSSProperties } from 'react'
import { usePlaceLabels } from '../../i18n/places'
import type { CellRef, MathProblem } from '../../types'
import AnswerCell from './AnswerCell'
import BorrowCell from './BorrowCell'
import CarryCell from './CarryCell'
import DigitCell from './DigitCell'
import OperatorCell from './OperatorCell'

export interface VerticalMathProblemProps {
  problem: MathProblem
  /** Jawaban anak per kolom grid (indeks dari kiri) */
  answers: readonly (number | null)[]
  /** Nilai kotak simpan per kolom grid (indeks dari kiri, kolom tujuan) */
  carries?: readonly (number | null)[]
  activeCell?: CellRef | null
  doneAnswerColumns?: readonly number[]
  wrongAnswerColumns?: readonly number[]
  /** Nilai pinjam terungkap per kolom grid (indeks dari kiri); null = belum dijelaskan */
  borrowValues?: readonly (number | null)[]
  /** Kotak jawaban bisa diketuk untuk dipilih (mode latihan) */
  onSelectAnswerCell?: (columnIndex: number) => void
  /** Sorot kolom yang sedang dibahas pada mode belajar */
  highlightColumn?: number | null
}

/**
 * Menampilkan soal bersusun pendek dengan CSS Grid.
 *
 * Struktur baris (atas ke bawah):
 *   1. Label nilai tempat
 *   2. Baris kotak simpan (penjumlahan) / anotasi pinjam (pengurangan)
 *   3. Operand pertama — urutan digit asli, kiri ke kanan
 *   4. Operand kedua + simbol operator pada kolom paling KANAN
 *   5. Garis batas
 *   6. Baris jawaban
 *
 * Semua posisi dipasang eksplisit (gridColumn/gridRow) sebagai string
 * (React menambahkan "px" pada nilai numerik style) sehingga kolom tidak
 * pernah bergeser pada ukuran layar mana pun.
 */
export default function VerticalMathProblem({
  problem,
  answers,
  carries,
  activeCell = null,
  doneAnswerColumns = [],
  wrongAnswerColumns = [],
  borrowValues,
  onSelectAnswerCell,
  highlightColumn = null,
}: VerticalMathProblemProps) {
  const width = problem.columns.length
  const operatorColumn = width + 1

  const { long: longPlace, short: shortPlace } = usePlaceLabels()
  const isAddition = problem.operation === 'addition'
  const doneSet = useMemo(() => new Set(doneAnswerColumns), [doneAnswerColumns])
  const wrongSet = useMemo(() => new Set(wrongAnswerColumns), [wrongAnswerColumns])
  const borrowValueAt = (columnIndex: number): number | null =>
    borrowValues !== undefined ? (borrowValues[columnIndex] ?? null) : null

  // gridColumn/gridRow wajib string agar React tidak menambahkan satuan px
  const place = (columnIndex: number, row: number): CSSProperties => ({
    gridColumn: String(columnIndex + 1),
    gridRow: String(row),
  })

  const labelRow = problem.columns.map((column) => (
    <div
      key={`label-${column.index}`}
      style={place(column.index, 1)}
      className="flex h-6 items-end justify-center pb-0.5"
    >
      <span
        title={longPlace(column.place)}
        className={`text-[0.65rem] font-extrabold uppercase tracking-wide ${
          column.used ? 'text-sky-600' : 'text-sky-600/30'
        }`}
      >
        {shortPlace(column.place)}
      </span>
    </div>
  ))

  const annotationRow = problem.columns.map((column) => {
    if (isAddition) {
      // Satuan tidak pernah menerima carry → kosongkan agar tidak membingungkan
      if (column.index === width - 1) {
        return (
          <div
            key={`ann-${column.index}`}
            style={place(column.index, 2)}
            aria-hidden="true"
            className="h-6"
          />
        )
      }
      return (
        <div
          key={`ann-${column.index}`}
          style={place(column.index, 2)}
          className="flex justify-center"
        >
          <CarryCell
            testId={`carry-cell-${column.index}`}
            place={column.place}
            value={carries ? (carries[column.index] ?? null) : null}
            active={activeCell?.kind === 'carry' && activeCell.columnIndex === column.index}
          />
        </div>
      )
    }
    const revealedValue = borrowValueAt(column.index)
    if (revealedValue !== null) {
      return (
        <div
          key={`ann-${column.index}`}
          style={place(column.index, 2)}
          className="flex justify-center"
        >
          <BorrowCell
            testId={`borrow-cell-${column.index}`}
            place={column.place}
            after={revealedValue}
          />
        </div>
      )
    }
    return (
      <div
        key={`ann-${column.index}`}
        style={place(column.index, 2)}
        aria-hidden="true"
        className="h-6"
      />
    )
  })

  const borrowLentStruck = (columnIndex: number): boolean => borrowValueAt(columnIndex) !== null

  const firstRow = problem.columns.map((column) => (
    <div key={`first-${column.index}`} style={place(column.index, 3)}>
      <DigitCell
        digit={column.firstDigit}
        struck={borrowLentStruck(column.index)}
        testId={`first-digit-${column.index}`}
      />
    </div>
  ))

  const secondRow = problem.columns.map((column) => (
    <div key={`second-${column.index}`} style={place(column.index, 4)}>
      <DigitCell
        digit={column.secondDigit}
        struck={borrowLentStruck(column.index)}
        testId={`second-digit-${column.index}`}
      />
    </div>
  ))

  const answerRow = problem.columns.map((column) => (
    <div key={`answer-${column.index}`} style={place(column.index, 6)}>
      <AnswerCell
        testId={`answer-cell-${column.index}`}
        place={column.place}
        used={column.used}
        value={answers[column.index] ?? null}
        active={activeCell?.kind === 'answer' && activeCell.columnIndex === column.index}
        done={doneSet.has(column.index)}
        wrong={wrongSet.has(column.index)}
        columnHighlighted={highlightColumn === column.index}
        onSelect={onSelectAnswerCell ? () => onSelectAnswerCell(column.index) : undefined}
      />
    </div>
  ))

  return (
    <div
      role="group"
      aria-label={`Soal ${problem.firstOperandText} ${
        problem.operation === 'addition' ? 'ditambah' : 'dikurangi'
      } ${problem.secondOperandText}, susun bersusun pendek`}
      data-testid="vertical-problem"
      className="math-grid inline-grid gap-x-1"
      style={{ gridTemplateColumns: `repeat(${width}, var(--cell-w)) auto` }}
    >
      {labelRow}
      <div style={{ gridColumn: String(operatorColumn), gridRow: '1' }} aria-hidden="true" />

      {annotationRow}
      <div style={{ gridColumn: String(operatorColumn), gridRow: '2' }} aria-hidden="true" />

      {firstRow}
      <div style={{ gridColumn: String(operatorColumn), gridRow: '3' }} aria-hidden="true" />

      {secondRow}
      <div style={{ gridColumn: String(operatorColumn), gridRow: '4' }}>
        <OperatorCell symbol={isAddition ? '+' : '−'} testId="operator-cell" />
      </div>

      <div
        style={{ gridColumn: `1 / span ${width}`, gridRow: '5' }}
        aria-hidden="true"
        className="mb-1 h-1 rounded-full bg-slate-500"
      />

      {answerRow}
      <div style={{ gridColumn: String(operatorColumn), gridRow: '6' }} aria-hidden="true" />
    </div>
  )
}
