import { useI18n } from '../../i18n/LanguageContext'
import type { ConceptProblem } from '../../types'

interface Props {
  problem: ConceptProblem
}

function Dots({
  count,
  icon,
}: {
  count: number
  icon: ConceptProblem['question'] & { kind: 'counting' }
}) {
  const symbol = icon.icon === 'apple' ? '🍎' : icon.icon === 'star' ? '⭐' : '●'
  const items = Array.from({ length: count }, (_, i) => i)
  const { t } = useI18n()
  return (
    <div
      role="img"
      aria-label={t('concept.countingAriaWithCount', { count })}
      className="flex flex-wrap justify-center gap-2 py-2"
    >
      {items.map((i) => (
        <span key={i} aria-hidden="true" className="text-2xl leading-none">
          {symbol}
        </span>
      ))}
    </div>
  )
}

function CompareVisual({ left, right }: { left: number; right: number }) {
  const { t } = useI18n()
  return (
    <div
      className="flex items-center justify-center gap-3 py-3"
      aria-label={t('concept.comparePrompt', { left, right })}
    >
      <span className="rounded-2xl bg-sky-100 px-4 py-3 text-2xl font-black text-sky-800">
        {left}
      </span>
      <span aria-hidden="true" className="text-xl font-black text-slate-400">
        vs
      </span>
      <span className="rounded-2xl bg-amber-100 px-4 py-3 text-2xl font-black text-amber-800">
        {right}
      </span>
    </div>
  )
}

function PlaceVisual({ number, askedPlace }: { number: number; askedPlace: 'tens' | 'units' }) {
  const { t } = useI18n()
  const s = String(number)
  const tens = s[0] ?? '–'
  const units = s[1] ?? '–'
  return (
    <div className="flex justify-center gap-2 py-3" aria-hidden="true">
      <span
        className={`rounded-xl px-4 py-3 text-2xl font-black ${
          askedPlace === 'tens'
            ? 'bg-sky-200 text-sky-900 ring-2 ring-sky-400'
            : 'bg-slate-100 text-slate-600'
        }`}
      >
        {tens}
        <span className="ml-1 text-xs font-bold text-slate-500">{t('place.tens')}</span>
      </span>
      <span
        className={`rounded-xl px-4 py-3 text-2xl font-black ${
          askedPlace === 'units'
            ? 'bg-amber-200 text-amber-900 ring-2 ring-amber-400'
            : 'bg-slate-100 text-slate-600'
        }`}
      >
        {units}
        <span className="ml-1 text-xs font-bold text-slate-500">{t('place.units')}</span>
      </span>
    </div>
  )
}

export default function ConceptQuestionView({ problem }: Props) {
  const q = problem.question
  if (q.kind === 'counting') {
    return <Dots count={q.target} icon={q as ConceptProblem['question'] & { kind: 'counting' }} />
  }
  if (q.kind === 'compare') {
    return <CompareVisual left={q.left} right={q.right} />
  }
  return <PlaceVisual number={q.number} askedPlace={q.askedPlace} />
}
