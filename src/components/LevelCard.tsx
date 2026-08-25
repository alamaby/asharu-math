import { useI18n } from '../i18n/LanguageContext'
import type { LevelDefinition } from '../types'

interface LevelCardProps {
  level: LevelDefinition
  unlocked: boolean
  completed: boolean
  stars: number
  onStart: () => void
}

function StarRow({ count }: { count: number }) {
  const { t } = useI18n()
  return (
    <span aria-label={t('result.starsAria', { stars: count })} className="text-sm tracking-tight">
      {[1, 2, 3].map((position) => (
        <span
          key={position}
          aria-hidden="true"
          className={position <= count ? 'text-amber-400' : 'text-slate-300'}
        >
          ★
        </span>
      ))}
    </span>
  )
}

export default function LevelCard({ level, unlocked, completed, stars, onStart }: LevelCardProps) {
  const { lang, t } = useI18n()
  const heading =
    level.number !== null
      ? t('levelCard.numbered', { number: level.number, name: level.name[lang] })
      : t('levelCard.challenge', { name: level.name[lang] })

  return (
    <article
      className={`rounded-3xl border-2 p-4 shadow-sm ${
        unlocked ? 'border-sky-200 bg-white' : 'border-slate-200 bg-slate-100'
      }`}
    >
      <div className="flex items-start gap-3">
        <span
          aria-hidden="true"
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-sm font-black ${
            unlocked ? 'bg-sky-100 text-sky-700' : 'bg-slate-200 text-slate-400'
          }`}
        >
          {unlocked ? (level.number ?? '⚡') : '🔒'}
        </span>
        <div className="flex-1">
          <h3 className={`text-base font-black ${unlocked ? 'text-slate-800' : 'text-slate-500'}`}>
            {heading}
          </h3>
          <p
            className={`mt-0.5 text-sm font-semibold ${unlocked ? 'text-slate-600' : 'text-slate-400'}`}
          >
            {level.goal[lang]}
          </p>
          <p className="mt-1 text-xs font-bold text-slate-400">
            {t('levelCard.examplePrefix')} {level.example[lang]} ·{' '}
            {t('levelCard.questionSuffix', { n: level.questionCount })}
          </p>
          <div className="mt-2 flex items-center justify-between gap-2">
            {completed ? (
              <StarRow count={stars} />
            ) : (
              <span className="text-xs font-bold text-slate-400">{t('levelCard.notFinished')}</span>
            )}
            {unlocked ? (
              <button
                type="button"
                onClick={onStart}
                className="min-h-11 rounded-2xl border-b-4 border-sky-600 bg-sky-500 px-4 text-sm font-bold text-white hover:bg-sky-400 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-300"
              >
                {completed ? t('levelCard.repeat') : t('levelCard.start')}
              </button>
            ) : (
              <span className="text-xs font-bold text-slate-400">{t('levelCard.lockedHint')}</span>
            )}
          </div>
        </div>
      </div>
    </article>
  )
}
