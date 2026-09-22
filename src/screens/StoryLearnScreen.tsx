import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import ConfirmDialog from '../components/common/ConfirmDialog'
import FeedbackMessage, { type Feedback } from '../components/guide/FeedbackMessage'
import ProgressBar from '../components/guide/ProgressBar'
import MascotBubble from '../components/layout/MascotBubble'
import NumericKeypad from '../components/input/NumericKeypad'
import StoryCard from '../components/story/StoryCard'
import { getLevel, getNextLevelId } from '../data/levels'
import { useI18n } from '../i18n/LanguageContext'
import { generateStorySession } from '../lib/storyGenerator'
import { starsFor } from '../lib/scoring'
import { playCorrect, playWrong } from '../lib/sound'
import { useNavigation } from '../state/NavigationContext'
import { useProgress } from '../state/ProgressContext'
import type { StoryPart, StoryProblem, StorySettings } from '../types'

interface StoryQueueItem {
  story: StoryProblem
  part: StoryPart
}

interface StoryLearnState {
  queue: StoryQueueItem[]
  index: number
  interim: string
  attempts: number
  wrongInPart: number
  feedback: Feedback | null
  locked: boolean
  results: { part: StoryPart; wrongAttempts: number }[]
  finished: boolean
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

  const [state, setState] = useState<StoryLearnState>(() => ({
    queue,
    index: 0,
    interim: '',
    attempts: 0,
    wrongInPart: 0,
    feedback: null,
    locked: false,
    results: [],
    finished: false,
  }))

  useEffect(() => {
    markLevelStarted(levelId)
  }, [levelId, markLevelStarted])

  const item = state.queue[state.index]
  const part = item?.part
  const story = item?.story

  const finishSession = useCallback(
    (finished: StoryLearnState) => {
      const totalQuestions = finished.results.length
      const correctFirstTry = finished.results.filter((r) => r.wrongAttempts === 0).length
      const wrongAttempts = finished.results.reduce((s, r) => s + r.wrongAttempts, 0)
      const recovered = finished.results.filter((r) => r.wrongAttempts > 0).length
      const stars = starsFor(correctFirstTry, totalQuestions)
      const newAchievementIds: string[] = []
      for (const r of finished.results) {
        newAchievementIds.push(
          ...recordAnswer({ problem: r.part.math, wrongAttempts: r.wrongAttempts }).map((a) => a.id),
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

  const timerRef = useRef<number | null>(null)
  useEffect(
    () => () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current)
    },
    [],
  )

  const handleDigit = (digit: number) => {
    if (state.locked || !part) return
    setState((s) => ({
      ...s,
      interim: (s.interim + String(digit)).slice(0, 3),
      feedback: null,
    }))
  }

  const handleBackspace = () => {
    if (state.locked) return
    setState((s) => ({ ...s, interim: s.interim.slice(0, -1) }))
  }

  const handleCheck = () => {
    if (!part || state.locked || state.interim === '') return
    const snapshot = state
    const answer = Number(snapshot.interim)
    if (answer === part.expectedAnswer) {
      const feedback: Feedback = { kind: 'correct', text: t('concept.correctFeedback') }
      const nextResults = [...snapshot.results, { part, wrongAttempts: snapshot.wrongInPart }]
      setState((s) => ({ ...s, feedback, locked: true }))
      if (timerRef.current !== null) window.clearTimeout(timerRef.current)
      timerRef.current = window.setTimeout(() => {
        if (snapshot.index + 1 < snapshot.queue.length) {
          setState({
            queue: snapshot.queue,
            index: snapshot.index + 1,
            interim: '',
            attempts: 0,
            wrongInPart: 0,
            feedback: null,
            locked: false,
            results: nextResults,
            finished: false,
          })
        } else {
          finishSession({ ...snapshot, results: nextResults, finished: true })
        }
      }, 700)
      return
    }
    const attempts = snapshot.attempts + 1
    const wrongInPart = snapshot.wrongInPart + 1
    if (attempts >= 3) {
      setState((s) => ({
        ...s,
        attempts: 0,
        wrongInPart,
        interim: String(part.expectedAnswer),
        feedback: { kind: 'info', text: t('concept.revealedFeedback', { answer: String(part.expectedAnswer) }) },
        locked: true,
      }))
      if (timerRef.current !== null) window.clearTimeout(timerRef.current)
      timerRef.current = window.setTimeout(() => {
        const nextResults = [...snapshot.results, { part, wrongAttempts: wrongInPart }]
        if (snapshot.index + 1 < snapshot.queue.length) {
          setState({
            queue: snapshot.queue,
            index: snapshot.index + 1,
            interim: '',
            attempts: 0,
            wrongInPart: 0,
            feedback: null,
            locked: false,
            results: nextResults,
            finished: false,
          })
        } else {
          finishSession({ ...snapshot, results: nextResults, finished: true })
        }
      }, 1200)
      return
    }
    setState((s) => ({
      ...s,
      attempts,
      wrongInPart,
      feedback: { kind: 'wrong', text: t('concept.wrongFeedback') },
      locked: true,
    }))
    if (timerRef.current !== null) window.clearTimeout(timerRef.current)
    timerRef.current = window.setTimeout(() => setState((s) => ({ ...s, locked: false })), 600)
  }

  const switchToGuided = () => {
    if (!part) return
    const remaining = state.queue.slice(state.index)
    const initialStats = {
      correctFirstTry: state.results.filter((r) => r.wrongAttempts === 0).length,
      wrongAttempts:
        state.results.reduce((sum, r) => sum + r.wrongAttempts, 0) + state.wrongInPart,
      recovered: state.results.filter((r) => r.wrongAttempts > 0).length,
      totalDone: state.results.length,
    }
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
    if (state.finished) {
      setLeaveGuard(null)
      return
    }
    setLeaveGuard(openExit)
    return () => setLeaveGuard(null)
  }, [state.finished, setLeaveGuard, openExit])

  useEffect(() => {
    if (!state.feedback) return
    if (state.feedback.kind === 'correct') playCorrect()
    else if (state.feedback.kind === 'wrong') playWrong()
  }, [state.feedback])

  if (!item) {
    return (
      <div className="flex flex-col items-center gap-4 py-10 text-center">
        <p className="text-sm font-bold text-slate-500">{t('learn.preparingResult')}</p>
      </div>
    )
  }

  const checkDisabled = state.interim === '' || state.locked

  return (
    <div className="space-y-4">
      <section aria-label={t('learn.sessionAria')} className="space-y-1.5">
        <div className="flex items-baseline justify-between">
          <h1 className="text-base font-black text-slate-800 md:text-lg">{title}</h1>
          <p className="text-xs font-bold text-slate-500">
            {t('learn.questionOf', { current: state.index + 1, total: state.queue.length })}
          </p>
        </div>
        <ProgressBar
          value={state.index / state.queue.length}
          label={t('learn.progressLabel', {
            current: state.index + 1,
            total: state.queue.length,
          })}
        />
      </section>

      <MascotBubble text={t('story.tryColumn')} mood="happy" />

      <div className="rounded-3xl border-2 border-sky-100 bg-white p-4 shadow-sm">
        <StoryCard story={story!} part={part} />
      </div>

      <div className="flex flex-col items-center gap-3">
        <div
          aria-live="polite"
          className="flex h-16 w-full max-w-xs items-center justify-center rounded-2xl border-2 border-sky-200 bg-white text-3xl font-black text-slate-800"
        >
          {state.interim || <span className="text-slate-300">...</span>}
        </div>
        <NumericKeypad
          onDigit={handleDigit}
          onBackspace={handleBackspace}
          onCheck={handleCheck}
          checkDisabled={checkDisabled}
          checkLabel={t('keypad.checkDefault')}
        />
        {state.attempts >= 2 && !state.locked && (
          <button
            type="button"
            onClick={switchToGuided}
            className="min-h-11 rounded-2xl border-2 border-violet-200 bg-violet-50 px-4 text-sm font-bold text-violet-700 hover:bg-violet-100 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-violet-300"
          >
            {t('story.tryColumn')}
          </button>
        )}
        <FeedbackMessage feedback={state.feedback} />
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
