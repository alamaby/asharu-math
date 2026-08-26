import LevelCard from '../components/LevelCard'
import MascotBubble from '../components/layout/MascotBubble'
import { LEVELS, isLevelUnlocked } from '../data/levels'
import { useI18n } from '../i18n/LanguageContext'
import { useNavigation } from '../state/NavigationContext'
import { useProgress } from '../state/ProgressContext'
import AdSlot from '../components/common/AdSlot'

export default function LevelSelectScreen() {
  const { navigate } = useNavigation()
  const { progress } = useProgress()
  const { t } = useI18n()

  return (
    <div className="space-y-4">
      <MascotBubble text={t('levels.bubble')} />
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

      <AdSlot placement="levels" />
    </div>
  )
}
