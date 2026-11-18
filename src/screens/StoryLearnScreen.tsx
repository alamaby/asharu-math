import { useCallback, useEffect, useMemo, useState } from 'react'
import ConfirmDialog from '../components/common/ConfirmDialog'
import FeedbackMessage from '../components/guide/FeedbackMessage'
import ProgressBar from '../components/guide/ProgressBar'
import MascotBubble from '../components/layout/MascotBubble'
import NumericKeypad from '../components/input/NumericKeypad'
import StoryCard from '../components/story/StoryCard'
import { getLevel, getNextLevelId } from '../data/levels'
import { useI18n } from '../i18n/LanguageContext'
import { generateStorySession } from '../lib/storyGenerator'
import { starsFor } from '../lib/scoring'
import { useNavigation } from '../state/NavigationContext'
import { useProgress } from '../state/ProgressContext'
import type { StoryPart, StoryProblem, StorySettings } from '../types'
import { useQuestionSession } from '../hooks/useQuestionSession'
import type { QuestionResult } from '../lib/questionSessionMachine'

interface StoryQueueItem {
  story: StoryProblem
  part: StoryPart
}

export interface StoryLearnScreenProps {
  levelId: string
  problems?: StoryProblem[]
}

const DEFAULT_CERITA3: StorySettings = {
  kind: 'story',
  operation: 'mixed',
  digitCount: 2,
  carryMode: 'any',
  questionCount: 5,
  families: ['f0-add', 'f0-sub', 'f1-diff'],
}

export default function StoryLearnScreen({ levelId, problems: provided }: StoryLearnScreenProps) {
  const { navigate, setLeaveGuard, confirmPendingNavigation, cancelPendingNavigation } =
    useNavigation()
  const { recordAnswer, completeLevel, markLevelStarted } = useProgress()
  const { lang, t } = useI18n()

  const level = getLevel(levelId)
  const title = level ? level.name[lang] : t('learn.adhocTitle')

  const initProblems = useMemo<StoryProblem[]>(() => {
    if (provided && provided.length > 0) return provided
    if (level?.levelKind === 'story') {
      return generateStorySession(level.settings as StorySettings)
    }
    return generateStorySession(DEFAULT_CERITA3)
  }, [provided, level])

  const queue = useMemo<StoryQueueItem[]>(
    () => initProblems.flatMap((s) => s.parts.map((p) => ({ story: s, part: p }))),
    [initProblems],
  )

  useEffect(() => {
    markLevelStarted(levelId)
  }, [levelId, markLevelStarted])

  const finishSession = useCallback(
    (results: QuestionResult<StoryQueueItem>[]) => {
      const totalQuestions = results.length
      const correctFirstTry = results.filter((r) => r.wrongAttempts === 0).length
      const wrongAttempts = results.reduce((s, r) => s + r.wrongAttempts, 0)
      const recovered = results.filter((r) => r.wrongAttempts > 0).length
      const stars = starsFor(correctFirstTry, totalQuestions)
      const newAchievementIds: string[] = []
      for (const r of results) {
        newAchievementIds.push(
          ...recordAnswer({ problem: r.item.part.math, wrongAttempts: r.wrongAttempts }).map(
            (a) => a.id,
          ),
        )
      }
      newAchievementIds.push(...completeLevel(levelId, stars).map((a) => a.id))
      const summary = {
        title,
        totalQuestions,
        correctFirstTry,
        wrongAttempts,
        recovered,
        stars,
        levelId,
        settings: null,
        nextLevelId: getNextLevelId(levelId),
        newAchievementIds: [...new Set(newAchievementIds)],
      }
      setLeaveGuard(null)
      navigate({ name: 'result', summary })
    },
    [completeLevel, levelId, navigate, recordAnswer, setLeaveGuard, title],
  )

  const {
    currentItem: item,
    isLocked,
    isCompleted,
    interim,
    attempts,
    wrongInCurrent,
    feedback,
    index,
    totalItems,
    results,
    handleDigit,
    handleBackspace,
    submitAnswer,
  } = useQuestionSession<StoryQueueItem>({
    items: queue,
    onComplete: finishSession,
  })

  const part = item?.part
  const story = item?.story

  const handleCheck = () => {
    if (!part || isLocked || interim === '') return
    const answer = Number(interim)
    if (answer === part.expectedAnswer) {
      submitAnswer(true, { kind: 'correct', text: t('concept.correctFeedback') })
      return
    }
    const nextAttempts = attempts + 1
    if (nextAttempts >= 3) {
      submitAnswer(
        false,
        {
          kind: 'info',
          text: t('concept.revealedFeedback', { answer: String(part.expectedAnswer) }),
        },
        String(part.expectedAnswer),
      )
      return
    }
    submitAnswer(false, { kind: 'wrong', text: t('concept.wrongFeedback') })
  }

  const switchToGuided = () => {
    if (!part) return
    const remaining = queue.slice(index)
    const initialStats = {
      correctFirstTry: results.filter((r) => r.wrongAttempts === 0).length,
      wrongAttempts: results.reduce((sum, r) => sum + r.wrongAttempts, 0) + wrongInCurrent,
      recovered: results.filter((r) => r.wrongAttempts > 0).length,
      totalDone: results.length,
    }
    setLeaveGuard(null)
    navigate({
      name: 'learn',
      levelId: null,
      problems: remaining.map((q) => q.part.math),
      initialStats,
      title,
    })
  }

  const [exitOpen, setExitOpen] = useState(false)
  const openExit = useCallback(() => setExitOpen(true), [setExitOpen])
  useEffect(() => {
    if (isCompleted) {
      setLeaveGuard(null)
      return
    }
    setLeaveGuard(openExit)
    return () => setLeaveGuard(null)
  }, [isCompleted, setLeaveGuard, openExit])

  if (!item || !part || !story) {
    return (
      <div className="flex flex-col items-center gap-4 py-10 text-center">
        <p className="text-sm font-bold text-slate-500">{t('learn.preparingResult')}</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <section aria-label={t('learn.sessionAria')} className="space-y-1.5">
        <div className="flex items-baseline justify-between">
          <h1 className="text-base font-black text-slate-800 md:text-lg">{title}</h1>
          <p className="text-xs font-bold text-slate-500">
            {t('learn.questionOf', { current: index + 1, total: totalItems })}
          </p>
        </div>
        <ProgressBar
          value={index / totalItems}
          label={t('learn.progressLabel', {
            current: index + 1,
            total: totalItems,
          })}
        />
      </section>

      <MascotBubble
        text={t('story.tryColumn')}
        mood={feedback?.kind === 'correct' ? 'cheer' : 'happy'}
      />

      <div className="rounded-3xl border-2 border-sky-100 bg-white p-4 shadow-sm">
        <StoryCard story={story} part={part} />
      </div>

      <div className="flex flex-col items-center gap-3">
        <div
          aria-live="polite"
          className="flex h-16 w-full max-w-xs items-center justify-center rounded-2xl border-2 border-sky-200 bg-white text-3xl font-black text-slate-800"
        >
          {interim || <span className="text-slate-300">...</span>}
        </div>
        <NumericKeypad
          onDigit={handleDigit}
          onBackspace={handleBackspace}
          onCheck={handleCheck}
          checkDisabled={isLocked || interim === ''}
          digitsDisabled={isLocked}
          checkLabel={t('keypad.checkDefault')}
        />
        {attempts >= 2 && !isLocked && (
          <button
            type="button"
            onClick={switchToGuided}
            className="min-h-11 rounded-2xl border-2 border-violet-200 bg-violet-50 px-4 text-sm font-bold text-violet-700 hover:bg-violet-100 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-violet-300"
          >
            {t('story.tryColumn')}
          </button>
        )}
        <FeedbackMessage feedback={feedback} />
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
