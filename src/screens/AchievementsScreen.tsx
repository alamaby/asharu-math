import AchievementCard from '../components/achievement/AchievementCard'
import MascotBubble from '../components/layout/MascotBubble'
import { useI18n } from '../i18n/LanguageContext'
import { ACHIEVEMENTS } from '../lib/achievements'
import { useProgress } from '../state/ProgressContext'

export default function AchievementsScreen() {
  const { progress } = useProgress()
  const { t } = useI18n()
  const unlockedCount = Object.keys(progress.unlockedAchievements).length

  return (
    <div className="space-y-4">
      <MascotBubble
        text={t('ach.bubble', { count: unlockedCount, total: ACHIEVEMENTS.length })}
        mood="cheer"
      />
      <div className="space-y-3">
        {ACHIEVEMENTS.map((achievement) => (
          <AchievementCard
            key={achievement.id}
            achievement={achievement}
            unlockedDate={progress.unlockedAchievements[achievement.id] ?? null}
            childName={progress.childName}
          />
        ))}
      </div>
    </div>
  )
}
