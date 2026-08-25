import AchievementCard from '../components/achievement/AchievementCard'
import MascotBubble from '../components/layout/MascotBubble'
import { ACHIEVEMENTS } from '../lib/achievements'
import { useProgress } from '../state/ProgressContext'

export default function AchievementsScreen() {
  const { progress } = useProgress()
  const unlockedCount = Object.keys(progress.unlockedAchievements).length

  return (
    <div className="space-y-4">
      <MascotBubble
        text={`Kamu sudah membuka ${unlockedCount} dari ${ACHIEVEMENTS.length} pencapaian. Ayo kumpulkan semuanya!`}
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
