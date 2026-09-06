import type { MathProblem } from '../../types'

type StackedGardenProps = {
  problem: MathProblem
  onesAnswer: number | null
  tensAnswer: number | null
  activeColumn: 'ones' | 'tens' | null
  carryShown: boolean
  borrowShown: boolean
  highlightColumn?: 'ones' | 'tens' | null
  onSelectOnes?: () => void
  onSelectTens?: () => void
  wrongOnes?: boolean
  wrongTens?: boolean
}

function answerClass(active?: boolean, wrong?: boolean, highlight?: boolean): string {
  const base =
    'flex min-h-11 min-w-11 items-center justify-center rounded-2xl border-2 p-2 text-xl font-black tabular-nums'
  const state = active
    ? 'border-sky-500 bg-sky-50 ring-4 ring-sky-200'
    : wrong
      ? 'border-amber-400 bg-amber-50'
      : highlight
        ? 'border-sky-300 bg-sky-50 ring-2 ring-sky-200'
        : 'border-slate-200 bg-white'
  return `${base} ${state}`
}

export default function StackedOperation({
  problem,
  onesAnswer,
  tensAnswer,
  activeColumn,
  carryShown,
  borrowShown,
  highlightColumn,
  onSelectOnes,
  onSelectTens,
  wrongOnes,
  wrongTens,
}: StackedGardenProps) {
  const op = problem.operation === 'addition' ? '+' : '−'
  const firstTens = problem.firstOperandText.length > 1 ? problem.firstOperandText[0] : null
  const firstOnes = problem.firstOperandText.slice(-1)
  const secondTens = problem.secondOperandText.length > 1 ? problem.secondOperandText[0] : null
  const secondOnes = problem.secondOperandText.slice(-1)

  const tensActive = activeColumn === 'tens'
  const onesActive = activeColumn === 'ones'
  const tensHighlight = highlightColumn === 'tens'
  const onesHighlight = highlightColumn === 'ones'

  return (
    <div
      role="group"
      aria-label={`Soal ${problem.firstOperand} ${op} ${problem.secondOperand}, bersusun`}
      className="inline-flex flex-col items-center gap-1 rounded-3xl border-2 border-slate-200 bg-white p-4 shadow-sm"
    >
      <div className="flex gap-1 text-[0.65rem] font-black uppercase tracking-wide">
        <span
          className={`px-2 py-1 text-emerald-700 ${tensHighlight ? 'rounded-full bg-emerald-100 ring-2 ring-emerald-300' : ''}`}
        >
          Puluhan · P
        </span>
        <span
          className={`px-2 py-1 text-amber-700 ${onesHighlight ? 'rounded-full bg-amber-100 ring-2 ring-amber-300' : ''}`}
        >
          Satuan · S
        </span>
      </div>
      <div className="flex gap-1">
        <div className="flex h-6 w-11 items-center justify-center">
          {carryShown && (
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-violet-100 text-xs font-black text-violet-700 ring-2 ring-violet-200">
              1
            </span>
          )}
          {borrowShown && (
            <span className="flex h-6 w-11 items-center justify-center rounded-full bg-amber-100 text-[0.65rem] font-black text-amber-700">
              {problem.firstOperandText[0]}→{Number(problem.firstOperandText[0]) - 1}
            </span>
          )}
        </div>
        <div className="h-6 w-11" aria-hidden="true" />
      </div>
      <div className="flex gap-1">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border-2 border-emerald-100 bg-emerald-50 text-xl font-black text-emerald-700">
          {firstTens ?? <span className="text-slate-300">·</span>}
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border-2 border-amber-100 bg-amber-50 text-xl font-black text-amber-700">
          {firstOnes}
        </div>
      </div>
      <div className="flex gap-1">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border-2 border-emerald-100 bg-emerald-50 text-xl font-black text-emerald-700">
          {secondTens ?? <span className="text-slate-300">·</span>}
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border-2 border-amber-100 bg-amber-50 text-xl font-black text-amber-700">
          {secondOnes}
        </div>
        <div
          className="flex h-11 w-8 items-center justify-center text-2xl font-black text-slate-700"
          aria-hidden="true"
        >
          {op}
        </div>
      </div>
      <div className="h-1 w-full rounded-full bg-slate-400" aria-hidden="true" />
      <div className="flex gap-1">
        {onSelectTens ? (
          <button
            type="button"
            onClick={onSelectTens}
            aria-label={`Kotak jawaban puluhan, ${tensAnswer ?? 'kosong'}`}
            className={`${answerClass(tensActive, wrongTens, tensHighlight)} focus-visible:outline-none focus-visible:ring-4`}
          >
            {tensAnswer ?? '·'}
          </button>
        ) : (
          <div className={answerClass(tensActive, wrongTens, tensHighlight)}>
            {tensAnswer ?? '·'}
          </div>
        )}
        {onSelectOnes ? (
          <button
            type="button"
            onClick={onSelectOnes}
            aria-label={`Kotak jawaban satuan, ${onesAnswer ?? 'kosong'}`}
            className={`${answerClass(onesActive, wrongOnes, onesHighlight)} focus-visible:outline-none focus-visible:ring-4`}
          >
            {onesAnswer ?? '·'}
          </button>
        ) : (
          <div className={answerClass(onesActive, wrongOnes, onesHighlight)}>
            {onesAnswer ?? '·'}
          </div>
        )}
      </div>
    </div>
  )
}
