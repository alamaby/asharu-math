import { achievementShareText } from '../../lib/achievements'
import type { AchievementDefinition } from '../../types'
import ShareAchievement from './ShareAchievement'

interface AchievementCardProps {
  achievement: AchievementDefinition
  /** Tanggal (ISO) saat terbuka; null berarti masih terkunci */
  unlockedDate: string | null
}

function formatDate(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
}

export default function AchievementCard({ achievement, unlockedDate }: AchievementCardProps) {
  const unlocked = unlockedDate !== null

  return (
    <article
      className={`rounded-3xl border-2 p-4 shadow-sm ${
        unlocked ? 'border-amber-300 bg-amber-50' : 'border-slate-200 bg-slate-50'
      }`}
    >
      <div className="flex items-start gap-3">
        <span
          aria-hidden="true"
          className={`text-4xl ${unlocked ? '' : 'opacity-40 grayscale'}`}
        >
          {achievement.icon}
        </span>
        <div className="flex-1">
          <h3 className={`text-base font-black ${unlocked ? 'text-amber-900' : 'text-slate-600'}`}>
            {achievement.name}
          </h3>
          <p className={`mt-0.5 text-sm font-semibold ${unlocked ? 'text-amber-800' : 'text-slate-500'}`}>
            {achievement.description}
          </p>
          {unlocked && (
            <p className="mt-1 text-xs font-bold text-amber-700">Dibuka pada {formatDate(unlockedDate)}</p>
          )}
        </div>
      </div>
      {unlocked && <ShareAchievement text={achievementShareText(achievement)} />}
    </article>
  )
}
