import { useEffect, useRef, useState, useCallback } from 'react'
import type { MathProblem, PracticeRecord, SessionSummary } from '../types'
import MagicAppleGarden from '../components/garden/MagicAppleGarden'
import { generateGardenSession } from '../lib/gardenQuestionGenerator'
import type { GardenLevelId } from '../lib/gardenQuestionGenerator'
import { buildChallengeSettings, getLevel, getNextLevelId } from '../data/levels'
import { starsFor } from '../lib/scoring'
import type { GeneratorSettings } from '../types'
import { useNavigation } from '../state/NavigationContext'
import { useProgress } from '../state/ProgressContext'
import { useI18n } from '../i18n/LanguageContext'
import ConfirmDialog from '../components/common/ConfirmDialog'
import Mascot from '../components/layout/Mascot'

type GardenScreenProps = {
  levelId: GardenLevelId
}

export default function GardenScreen({ levelId }: GardenScreenProps) {
  const { navigate, setLeaveGuard, confirmPendingNavigation, cancelPendingNavigation } =
    useNavigation()
  const { progress, recordAnswer, completeLevel, markLevelStarted, setPreferences } = useProgress()
  const { lang, t } = useI18n()
  const [problems, setProblems] = useState<MathProblem[]>(() => generateGardenSession(levelId, 5))
  const [index, setIndex] = useState(0)
  const [results, setResults] = useState<{ problem: MathProblem; wrongAttempts: number }[]>([])
  const [correctFirstTry, setCorrectFirstTry] = useState(0)
  const [wrongTotal, setWrongTotal] = useState(0)
  const finishedRef = useRef(false)
  const [exitOpen, setExitOpen] = useState(false)

  const level = getLevel(levelId)
  const screenTitle = level ? level.name[lang] : t('garden.title')

  useEffect(() => {
    markLevelStarted(levelId)
  }, [levelId, markLevelStarted])

  useEffect(() => {
    const handler = () => {
      setPreferences({ soundEnabled: !progress.soundEnabled })
    }
    window.addEventListener('garden:toggle-sound', handler as EventListener)
    return () => window.removeEventListener('garden:toggle-sound', handler as EventListener)
  }, [progress.soundEnabled, setPreferences])

  const openExit = useCallback(() => setExitOpen(true), [])
  useEffect(() => {
    if (finishedRef.current) {
      setLeaveGuard(null)
      return
    }
    setLeaveGuard(openExit)
    return () => setLeaveGuard(null)
  }, [setLeaveGuard, openExit, index, results.length])

  const handleComplete = useCallback(
    (correctFirstTryFlag: boolean, wrongAttempts: number) => {
      const problem = problems[index]
      const nextResults = [...results, { problem, wrongAttempts }]
      setResults(nextResults)
      if (correctFirstTryFlag) setCorrectFirstTry((v) => v + 1)
      setWrongTotal((v) => v + wrongAttempts)

      if (index + 1 < problems.length) {
        // jeda singkat lalu lanjut
        window.setTimeout(() => setIndex((i) => i + 1), 700)
      } else {
        finishedRef.current = true
        const totalQuestions = problems.length
        const finalCorrect = correctFirstTry + (correctFirstTryFlag ? 1 : 0)
        const finalWrong = wrongTotal + wrongAttempts
        const stars = starsFor(finalCorrect, totalQuestions)
        const newAchievementIds: string[] = []
        for (const r of nextResults) {
          newAchievementIds.push(
            ...recordAnswer({ problem: r.problem, wrongAttempts: r.wrongAttempts }).map(
              (a) => a.id,
            ),
          )
        }
        newAchievementIds.push(...completeLevel(levelId, stars).map((a) => a.id))
        const summary: SessionSummary = {
          title: screenTitle,
          totalQuestions,
          correctFirstTry: finalCorrect,
          wrongAttempts: finalWrong,
          recovered: nextResults.filter((r) => r.wrongAttempts > 0).length,
          stars,
          levelId,
          settings:
            level && level.levelKind === 'column' ? (level.settings as GeneratorSettings) : null,
          nextLevelId: getNextLevelId(levelId),
          newAchievementIds: [...new Set(newAchievementIds)],
        }
        // izinkan navigasi ke result
        setLeaveGuard(null)
        navigate({ name: 'result', summary })
      }
    },
    [
      problems,
      index,
      results,
      correctFirstTry,
      wrongTotal,
      recordAnswer,
      completeLevel,
      levelId,
      screenTitle,
      level,
      navigate,
      setLeaveGuard,
    ],
  )

  if (problems.length === 0) {
    return (
      <div className="py-10 text-center">
        <Mascot mood="cheer" size={96} />
        <p className="mt-4 text-sm font-bold text-slate-500">Menyiapkan kebun...</p>
      </div>
    )
  }

  const problem = problems[index]
  if (!problem) return null

  return (
    <div className="space-y-4">
      <MagicAppleGarden
        key={problem.id}
        problem={problem}
        currentIndex={index}
        total={problems.length}
        onComplete={handleComplete}
      />
      <div className="flex justify-center">
        <button
          type="button"
          onClick={() => {
            setProblems(generateGardenSession(levelId, 5))
            setIndex(0)
            setResults([])
            setCorrectFirstTry(0)
            setWrongTotal(0)
            finishedRef.current = false
          }}
          className="min-h-11 rounded-2xl border-2 border-slate-200 bg-white px-4 text-sm font-bold text-slate-600 hover:bg-sky-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-300"
        >
          🔄 Acak soal baru
        </button>
      </div>
      <ConfirmDialog
        open={exitOpen}
        title={t('learn.exitTitle')}
        description={t('learn.exitDesc')}
        confirmLabel={t('learn.exitConfirm')}
        cancelLabel={t('learn.exitCancel')}
        danger
        onConfirm={() => {
          setExitOpen(false)
          confirmPendingNavigation()
        }}
        onCancel={() => {
          setExitOpen(false)
          cancelPendingNavigation()
        }}
      />
    </div>
  )
}

// helper agar preview build tidak tree-shake
export function _gardenChallenge(levelId: string, history: PracticeRecord[]) {
  if (levelId === 'tantangan') return buildChallengeSettings(history)
  return null
}
