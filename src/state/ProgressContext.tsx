import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { evaluateNewAchievements } from '../lib/achievements'
import { setSoundEnabled } from '../lib/sound'
import {
  clearProgress,
  defaultProgress,
  loadProgress,
  saveProgress,
  touchDayStreak,
} from '../lib/storage'
import type { AchievementDefinition, MathProblem, UserProgress } from '../types'

export interface RecordAnswerParams {
  problem: MathProblem
  wrongAttempts: number
}

interface ProgressContextValue {
  progress: UserProgress
  /** Mencatat satu soal selesai; mengembalikan achievement yang baru terbuka */
  recordAnswer: (params: RecordAnswerParams) => AchievementDefinition[]
  /** Menandai level selesai; mengembalikan achievement yang baru terbuka */
  completeLevel: (levelId: string, stars: number) => AchievementDefinition[]
  markLevelStarted: (levelId: string) => void
  setPreferences: (prefs: { soundEnabled?: boolean; animationsEnabled?: boolean }) => void
  resetProgress: () => void
}

const ProgressContext = createContext<ProgressContextValue | null>(null)

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [progress, setProgress] = useState<UserProgress>(() => loadProgress())
  const progressRef = useRef(progress)

  const update = useCallback((mutate: (current: UserProgress) => UserProgress): UserProgress => {
    const next = mutate(progressRef.current)
    progressRef.current = next
    setProgress(next)
    return next
  }, [])

  const withNewAchievements = useCallback((next: UserProgress): AchievementDefinition[] => {
    const unlocked = evaluateNewAchievements(next)
    if (unlocked.length === 0) return []
    const today = new Date().toISOString()
    const decorated: UserProgress = {
      ...next,
      unlockedAchievements: {
        ...next.unlockedAchievements,
        ...Object.fromEntries(unlocked.map((achievement) => [achievement.id, today])),
      },
    }
    progressRef.current = decorated
    setProgress(decorated)
    return unlocked
  }, [])

  const recordAnswer = useCallback(
    ({ problem, wrongAttempts }: RecordAnswerParams): AchievementDefinition[] => {
      const correct = true // soal selalu diselesaikan sampai benar (dibantu petunjuk bertahap)
      let next = update((current) =>
        touchDayStreak({
          ...current,
          totalCorrect: current.totalCorrect + (correct ? 1 : 0),
          totalWrong: current.totalWrong + wrongAttempts,
          currentStreak: wrongAttempts === 0 ? current.currentStreak + 1 : 0,
          carryCorrect: current.carryCorrect + (problem.requiresCarry ? 1 : 0),
          borrowCorrect: current.borrowCorrect + (problem.requiresBorrow ? 1 : 0),
          recoveredCount: current.recoveredCount + (wrongAttempts > 0 ? 1 : 0),
          practiceHistory: [
            ...current.practiceHistory,
            { date: new Date().toISOString(), correct: 1, total: 1 + wrongAttempts },
          ].slice(-20),
        }),
      )
      next = touchStreakBest(next)
      return withNewAchievements(next)
    },
    [update, withNewAchievements],
  )

  const completeLevel = useCallback(
    (levelId: string, stars: number): AchievementDefinition[] => {
      const next = update((current) =>
        touchDayStreak({
          ...current,
          completedLevelIds: current.completedLevelIds.includes(levelId)
            ? current.completedLevelIds
            : [...current.completedLevelIds, levelId],
          bestScores: {
            ...current.bestScores,
            [levelId]: Math.max(current.bestScores[levelId] ?? 0, stars),
          },
        }),
      )
      return withNewAchievements(next)
    },
    [update, withNewAchievements],
  )

  const markLevelStarted = useCallback(
    (levelId: string) => {
      update((current) => (current.lastLevelId === levelId ? current : { ...current, lastLevelId: levelId }))
    },
    [update],
  )

  const setPreferences = useCallback(
    (prefs: { soundEnabled?: boolean; animationsEnabled?: boolean }) => {
      update((current) => ({ ...current, ...prefs }))
    },
    [update],
  )

  const resetProgress = useCallback(() => {
    clearProgress()
    const fresh = defaultProgress()
    progressRef.current = fresh
    setProgress(fresh)
  }, [])

  useEffect(() => {
    saveProgress(progress)
  }, [progress])

  useEffect(() => {
    setSoundEnabled(progress.soundEnabled)
  }, [progress.soundEnabled])

  const value = useMemo<ProgressContextValue>(
    () => ({ progress, recordAnswer, completeLevel, markLevelStarted, setPreferences, resetProgress }),
    [progress, recordAnswer, completeLevel, markLevelStarted, setPreferences, resetProgress],
  )

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>
}

function touchStreakBest(progress: UserProgress): UserProgress {
  if (progress.currentStreak <= progress.bestStreak) return progress
  return { ...progress, bestStreak: progress.currentStreak }
}

export function useProgress(): ProgressContextValue {
  const context = useContext(ProgressContext)
  if (!context) {
    throw new Error('useProgress harus dipakai di dalam ProgressProvider')
  }
  return context
}
