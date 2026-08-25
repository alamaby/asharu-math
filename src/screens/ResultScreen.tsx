import AchievementCard from '../components/achievement/AchievementCard'
import { useI18n } from '../i18n/LanguageContext'
import Mascot from '../components/layout/Mascot'
import { getAchievement } from '../lib/achievements'
import { isLevelUnlocked } from '../data/levels'
import { useNavigation } from '../state/NavigationContext'
import { useProgress } from '../state/ProgressContext'
import type { SessionSummary } from '../types'

export interface ResultScreenProps {
  summary: SessionSummary
}

export default function ResultScreen({ summary }: ResultScreenProps) {
  const { navigate, goToTab } = useNavigation()
  const { progress } = useProgress()
  const { t } = useI18n()

  const nextLevelAvailable =
    summary.nextLevelId !== null && isLevelUnlocked(summary.nextLevelId, progress.completedLevelIds)

  return (
    <div className="space-y-5">
      <section className="animate-pop-in flex flex-col items-center gap-2 rounded-3xl border-2 border-sky-100 bg-white p-6 text-center shadow-sm">
        <Mascot mood="cheer" size={80} className="animate-celebrate" />
        <h1 className="text-xl font-black text-slate-800">
          {t('result.titleSuffix', { title: summary.title })}
        </h1>
        <div
          className="text-4xl tracking-widest"
          aria-label={t('result.starsAria', { stars: summary.stars })}
        >
          {[1, 2, 3].map((position) => (
            <span
              key={position}
              aria-hidden="true"
              className={position <= summary.stars ? 'text-amber-400' : 'text-slate-200'}
            >
              ★
            </span>
          ))}
        </div>
        <div className="mt-2 grid w-full grid-cols-3 gap-2">
          <div className="rounded-2xl bg-sky-50 p-2">
            <p className="text-lg font-black text-sky-700">{summary.totalQuestions}</p>
            <p className="text-[0.65rem] font-bold text-slate-500">{t('result.totalQuestions')}</p>
          </div>
          <div className="rounded-2xl bg-emerald-50 p-2">
            <p className="text-lg font-black text-emerald-700">{summary.correctFirstTry}</p>
            <p className="text-[0.65rem] font-bold text-slate-500">{t('result.firstTry')}</p>
          </div>
          <div className="rounded-2xl bg-amber-50 p-2">
            <p className="text-lg font-black text-amber-700">{summary.recovered}</p>
            <p className="text-[0.65rem] font-bold text-slate-500">{t('result.recovered')}</p>
          </div>
        </div>
      </section>

      {summary.newAchievementIds.length > 0 && (
        <section aria-label={t('result.newAchievements')}>
          <h2 className="mb-2 text-sm font-black text-slate-700">{t('result.newAchievements')}</h2>
          <div className="space-y-3">
            {summary.newAchievementIds.map((id) => {
              const achievement = getAchievement(id)
              if (!achievement) return null
              return (
                <AchievementCard
                  key={id}
                  achievement={achievement}
                  unlockedDate={new Date().toISOString()}
                  childName={progress.childName}
                />
              )
            })}
          </div>
        </section>
      )}

      <section aria-label={t('result.nextActionsAria')} className="space-y-2">
        {summary.settings && (
          <button
            type="button"
            onClick={() => navigate({ name: 'practice', settings: summary.settings ?? undefined })}
            className="min-h-14 w-full rounded-2xl border-b-4 border-amber-500 bg-amber-400 text-base font-black text-amber-950 hover:bg-amber-300 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-amber-200"
          >
            {t('result.practiceAgain')}
          </button>
        )}
        {summary.levelId && (
          <button
            type="button"
            onClick={() => navigate({ name: 'learn', levelId: summary.levelId })}
            className="min-h-14 w-full rounded-2xl border-b-4 border-sky-600 bg-sky-500 text-base font-black text-white hover:bg-sky-400 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-300"
          >
            {t('result.retryLevel')}
          </button>
        )}
        {nextLevelAvailable && (
          <button
            type="button"
            onClick={() => navigate({ name: 'learn', levelId: summary.nextLevelId })}
            className="min-h-14 w-full rounded-2xl border-b-4 border-emerald-600 bg-emerald-500 text-base font-black text-white hover:bg-emerald-400 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-300"
          >
            {t('result.nextLevel')}
          </button>
        )}
        <button
          type="button"
          onClick={() => goToTab('home')}
          className="min-h-12 w-full rounded-2xl border-2 border-slate-200 bg-white text-sm font-bold text-slate-600 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-300"
        >
          {t('result.goHome')}
        </button>
      </section>
    </div>
  )
}
