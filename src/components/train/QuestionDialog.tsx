import { useI18n } from '../../i18n/LanguageContext'
import type { TrainQuestion } from '../../lib/trainQuestionGenerator'

export interface QuestionDialogProps {
  question: TrainQuestion
  round: number
  total: number
  attempts: number
  showHint: boolean
  feedback: { kind: 'correct' | 'wrong' | 'info'; text: string } | null
  disabled: boolean
  onAnswer: (choiceIndex: 0 | 1 | 2) => void
}

function HintVisual({ question }: { question: TrainQuestion }) {
  if (question.topic === 'comparison') {
    return (
      <div
        aria-hidden="true"
        className="mt-2 flex items-center justify-center gap-1 text-lg font-black text-slate-500"
      >
        <span>&lt;</span>
        <span className="mx-2 h-1 w-24 rounded-full bg-slate-200" />
        <span>=</span>
        <span className="mx-2 h-1 w-24 rounded-full bg-slate-200" />
        <span>&gt;</span>
      </div>
    )
  }
  if (question.topic === 'multiplication' || question.topic === 'division') {
    return (
      <div
        aria-hidden="true"
        className="mt-2 grid grid-cols-5 justify-items-center gap-1 text-base"
      >
        {Array.from({ length: 10 }).map((_, i) => (
          <span
            key={i}
            className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-100 font-black text-violet-700"
          >
            ●
          </span>
        ))}
      </div>
    )
  }
  const nums = question.prompt
    .split(/[^0-9]+/)
    .filter(Boolean)
    .map(Number)
  const dots = Math.min(nums[0] ?? 5, 20)
  return (
    <div aria-hidden="true" className="mt-2 flex flex-wrap justify-center gap-1 text-base">
      {Array.from({ length: dots }).map((_, i) => (
        <span
          key={i}
          className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 font-black text-emerald-700"
        >
          🍎
        </span>
      ))}
    </div>
  )
}

export default function QuestionDialog({
  question,
  round,
  total,
  attempts,
  showHint,
  feedback,
  disabled,
  onAnswer,
}: QuestionDialogProps) {
  const { t } = useI18n()
  if (new Set(question.choices).size !== 3) {
    console.error('Train choices harus 3 unik')
  }
  void round
  void total
  void attempts
  const branchLabel = ['← Kiri', '↑ Tengah', 'Kanan →']
  return (
    <section
      role="dialog"
      aria-modal="true"
      aria-labelledby="train-q-title"
      className="rounded-3xl border-2 border-amber-200 bg-white p-4 shadow-sm"
    >
      <h2
        id="train-q-title"
        className="text-center text-3xl font-black tracking-wide text-slate-800"
      >
        {question.prompt}
      </h2>
      <p className="mt-1 text-center text-xs font-bold text-slate-400">
        {t('train.questionOf', { n: round + 1, total })} · {branchLabel.join(' · ')}
      </p>
      <div className="mt-3 grid grid-cols-3 gap-2">
        {([0, 1, 2] as const).map((i) => (
          <button
            key={i}
            type="button"
            data-testid={`train-choice-${i}`}
            data-branch={i}
            disabled={disabled}
            onClick={() => onAnswer(i)}
            aria-label={t('train.chooseBranchAria', { answer: question.choices[i]! })}
            className="min-h-14 rounded-2xl border-b-4 border-sky-600 bg-sky-500 px-2 py-3 text-xl font-black text-white hover:bg-sky-400 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-300 disabled:opacity-40"
          >
            {question.choices[i]}
            <span className="mt-0.5 block text-[0.65rem] font-bold opacity-80">
              {branchLabel[i]}
            </span>
          </button>
        ))}
      </div>
      {showHint && (
        <div className="mt-3 rounded-2xl border-2 border-violet-200 bg-violet-50 p-3">
          <p className="text-sm font-black text-violet-800">{t('train.hintTitle')}</p>
          <p className="mt-1 text-sm font-bold text-violet-700">{question.hintText}</p>
          <HintVisual question={question} />
        </div>
      )}
      {feedback && (
        <p
          aria-live="polite"
          className={`mt-3 rounded-2xl border-2 p-3 text-center text-sm font-black ${
            feedback.kind === 'correct'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
              : feedback.kind === 'wrong'
                ? 'border-amber-200 bg-amber-50 text-amber-800'
                : 'border-sky-200 bg-sky-50 text-sky-800'
          }`}
        >
          {feedback.text}
        </p>
      )}
    </section>
  )
}
