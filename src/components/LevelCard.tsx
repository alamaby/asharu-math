import { useI18n } from '../i18n/LanguageContext'
import type { LevelDefinition } from '../types'

interface LevelCardProps {
  level: LevelDefinition
  unlocked: boolean
  completed: boolean
  stars: number
  onStart: () => void
}

function StarRow({ count, large }: { count: number; large?: boolean }) {
  const { t } = useI18n()
  const clamped = Math.max(0, Math.min(3, count))
  if (clamped === 0) {
    return (
      <span aria-label={t('result.starsAria', { stars: 0 })} className="text-sm tracking-tight">
        {[1, 2, 3].map((position) => (
          <span key={position} aria-hidden="true" className="text-slate-300">
            ☆
          </span>
        ))}
      </span>
    )
  }
  return (
    <span
      aria-label={t('result.starsAria', { stars: clamped })}
      className={`tracking-tight ${large ? 'text-base' : 'text-sm'}`}
    >
      {[1, 2, 3].map((position) => (
        <span
          key={position}
          aria-hidden="true"
          className={position <= clamped ? 'text-amber-400' : 'text-slate-300'}
        >
          ★
        </span>
      ))}
    </span>
  )
}

export default function LevelCard({
  level,
  unlocked: _unlocked,
  completed,
  stars,
  onStart,
}: LevelCardProps) {
  // unlocked selalu true by design — dipertahankan untuk kompatibilitas pemanggil
  const { lang, t } = useI18n()
  const heading =
    level.number !== null
      ? t('levelCard.numbered', { number: level.number, name: level.name[lang] })
      : t('levelCard.challenge', { name: level.name[lang] })
  const clampedStars = Math.max(0, Math.min(3, stars))
  const isPerfect = completed && clampedStars === 3
  const isUntried = !completed

  const cardClass = isPerfect
    ? 'rounded-3xl border-2 p-4 shadow-sm border-amber-400 bg-amber-50'
    : isUntried
      ? 'rounded-3xl border-2 p-4 shadow-sm border-violet-200 bg-violet-50'
      : 'rounded-3xl border-2 p-4 shadow-sm border-sky-200 bg-white'

  const iconBgClass = isPerfect
    ? 'bg-amber-100 text-amber-800'
    : isUntried
      ? 'bg-violet-100 text-violet-700'
      : 'bg-sky-100 text-sky-700'

  const titleClass = isPerfect ? 'text-amber-900' : isUntried ? 'text-slate-800' : 'text-slate-800'

  const goalClass = isPerfect ? 'text-amber-800' : isUntried ? 'text-slate-600' : 'text-slate-600'

  return (
    <article className={cardClass}>
      <div className="flex items-start gap-3">
        <span
          aria-hidden="true"
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-sm font-black ${iconBgClass}`}
        >
          {level.number ?? '⚡'}
        </span>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className={`text-base font-black ${titleClass}`}>{heading}</h3>
            <span
              className={`rounded-full px-2 py-0.5 text-[0.65rem] font-black ${
                level.grade === 1 ? 'bg-emerald-100 text-emerald-700' : 'bg-sky-100 text-sky-700'
              }`}
            >
              {t(level.grade === 1 ? 'levels.grade1' : 'levels.grade2')}
            </span>
          </div>
          <p className={`mt-0.5 text-sm font-semibold ${goalClass}`}>{level.goal[lang]}</p>
          <p className="mt-1 text-xs font-bold text-slate-400">
            {t('levelCard.examplePrefix')} {level.example[lang]} ·{' '}
            {t('levelCard.questionSuffix', { n: level.questionCount })}
          </p>
          <div className="mt-2 flex items-center justify-between gap-2">
            <span className="flex flex-col gap-1">
              <StarRow count={clampedStars} large={isPerfect} />
              {isPerfect && (
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[0.65rem] font-black text-amber-800">
                  {t('levelCard.perfect')}
                </span>
              )}
              {isUntried && (
                <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[0.65rem] font-black text-violet-700">
                  {t('levelCard.neverTried')}
                </span>
              )}
            </span>
            <button
              type="button"
              onClick={onStart}
              className="min-h-11 rounded-2xl border-b-4 border-sky-600 bg-sky-500 px-4 text-sm font-bold text-white hover:bg-sky-400 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-300"
            >
              {completed ? t('levelCard.repeat') : t('levelCard.start')}
            </button>
          </div>
        </div>
      </div>
    </article>
  )
}
