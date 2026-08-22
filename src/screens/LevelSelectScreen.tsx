import LevelCard from '../components/LevelCard'
import MascotBubble from '../components/layout/MascotBubble'
import { LEVELS, isLevelUnlocked } from '../data/levels'
import { useNavigation } from '../state/NavigationContext'
import { useProgress } from '../state/ProgressContext'

export default function LevelSelectScreen() {
  const { navigate } = useNavigation()
  const { progress } = useProgress()

  return (
    <div className="space-y-4">
      <MascotBubble text="Pilih level ya! Selesaikan level berurutan untuk membuka level berikutnya. Kamu juga bisa mengulang level lama kapan saja." />
      <div className="space-y-3">
        {LEVELS.map((level) => (
          <LevelCard
            key={level.id}
            level={level}
            unlocked={isLevelUnlocked(level.id, progress.completedLevelIds)}
            completed={progress.completedLevelIds.includes(level.id)}
            stars={progress.bestScores[level.id] ?? 0}
            onStart={() => navigate({ name: 'learn', levelId: level.id })}
          />
        ))}
      </div>
    </div>
  )
}
