import type { AchievementDefinition } from '../../types'
import ShareAchievement from './ShareAchievement'
import { useI18n } from '../../i18n/LanguageContext'

interface AchievementCardProps {
  achievement: AchievementDefinition
  /** Tanggal (ISO) saat terbuka; null berarti masih terkunci */
  unlockedDate: string | null
  /** Nama panggilan anak untuk kartu/teks yang dibagikan */
  childName: string | null
}

export default function AchievementCard({
  achievement,
  unlockedDate,
  childName,
}: AchievementCardProps) {
  const { lang, t } = useI18n()
  const unlocked = unlockedDate !== null

  return (
    <article
      className={`rounded-3xl border-2 p-4 shadow-sm ${
        unlocked ? 'border-amber-300 bg-amber-50' : 'border-slate-200 bg-slate-50'
      }`}
    >
      <div className="flex items-start gap-3">
        <span aria-hidden="true" className={`text-4xl ${unlocked ? '' : 'opacity-40 grayscale'}`}>
          {achievement.icon}
        </span>
        <div className="flex-1">
          <h3 className={`text-base font-black ${unlocked ? 'text-amber-900' : 'text-slate-600'}`}>
            {achievement.name[lang]}
          </h3>
          <p
            className={`mt-0.5 text-sm font-semibold ${unlocked ? 'text-amber-800' : 'text-slate-500'}`}
          >
            {achievement.description[lang]}
          </p>
          {unlocked && unlockedDate && (
            <p className="mt-1 text-xs font-bold text-amber-700">
              {t('ach.unlockedAt', {
                date: new Date(unlockedDate).toLocaleDateString(lang === 'id' ? 'id-ID' : 'en-US', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                }),
              })}
            </p>
          )}
        </div>
      </div>
      {unlocked && <ShareAchievement achievement={achievement} childName={childName} />}
    </article>
  )
}
