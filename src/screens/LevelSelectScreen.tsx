import LevelCard from '../components/LevelCard'
import MascotBubble from '../components/layout/MascotBubble'
import { LEVELS, isLevelUnlocked } from '../data/levels'
import { useI18n } from '../i18n/LanguageContext'
import { useNavigation } from '../state/NavigationContext'
import { useProgress } from '../state/ProgressContext'
import AdSlot from '../components/common/AdSlot'
import type { GradeLevel } from '../types'

const GRADE_ORDER: readonly GradeLevel[] = [1, 2]

export default function LevelSelectScreen() {
  const { navigate } = useNavigation()
  const { progress } = useProgress()
  const { t } = useI18n()

  return (
    <div className="space-y-4">
      <MascotBubble text={t('levels.bubble')} />
      {GRADE_ORDER.map((grade) => {
        const gradeLevels = LEVELS.filter((level) => level.grade === grade)
        if (gradeLevels.length === 0) return null
        return (
          <section key={grade} aria-label={t(grade === 1 ? 'levels.grade1' : 'levels.grade2')}>
            <h2 className="mb-2 text-sm font-black text-slate-700">
              {t(grade === 1 ? 'levels.grade1' : 'levels.grade2')}
            </h2>
            <div className="space-y-3">
              {gradeLevels.map((level) => (
                <LevelCard
                  key={level.id}
                  level={level}
                  unlocked={isLevelUnlocked(level.id, progress.completedLevelIds)}
                  completed={progress.completedLevelIds.includes(level.id)}
                  stars={progress.bestScores[level.id] ?? 0}
                  onStart={() => {
                    if (level.id.startsWith('kebun-')) {
                      navigate({ name: 'garden', levelId: level.id })
                      return
                    }
                    if (level.id.startsWith('akuarium-')) {
                      navigate({ name: 'aquarium', levelId: level.id })
                      return
                    }
                    return level.levelKind === 'story'
                      ? navigate({ name: 'story-learn', levelId: level.id })
                      : level.levelKind === 'concept'
                        ? navigate({ name: 'concept-learn', levelId: level.id })
                        : navigate({ name: 'learn', levelId: level.id })
                  }}
                />
              ))}
            </div>
          </section>
        )
      })}

      <AdSlot placement="levels" />
    </div>
  )
}
