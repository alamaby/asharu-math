import { useCallback, useEffect, useMemo, useState } from 'react'
import ConceptQuestionView from '../components/concept/ConceptQuestionView'
import FeedbackMessage, { type Feedback } from '../components/guide/FeedbackMessage'
import ProgressBar from '../components/guide/ProgressBar'
import MascotBubble from '../components/layout/MascotBubble'
import { getLevel, getNextLevelId } from '../data/levels'
import { useI18n } from '../i18n/LanguageContext'
import { conceptChoices, conceptPrompt } from '../i18n/concept'
import { generateConceptSession } from '../lib/conceptGenerator'
import { starsFor } from '../lib/scoring'
import { playCorrect, playWrong } from '../lib/sound'
import { useNavigation } from '../state/NavigationContext'
import { useProgress } from '../state/ProgressContext'
import type { ConceptProblem, ConceptSettings, SessionSummary } from '../types'

interface ConceptLearnState {
  problems: ConceptProblem[]
  index: number
  attempts: number
  wrongInProblem: number
  feedback: Feedback | null
  locked: boolean
  results: { problem: ConceptProblem; wrongAttempts: number }[]
  finished: boolean
}

export interface ConceptLearnScreenProps {
  levelId: string
  problems?: ConceptProblem[]
}

export default function ConceptLearnScreen({
  levelId,
  problems: provided,
}: ConceptLearnScreenProps) {
  const { navigate, setLeaveGuard, confirmPendingNavigation, cancelPendingNavigation } =
    useNavigation()
  const { recordConceptAnswer, completeLevel, markLevelStarted } = useProgress()
  const { lang, t } = useI18n()

  const level = getLevel(levelId)
  const title = level ? level.name[lang] : t('learn.adhocTitle')

  const [state, setState] = useState<ConceptLearnState>(() => {
    const initial =
      provided && provided.length > 0
        ? provided
        : level && level.levelKind === 'concept'
          ? generateConceptSession(
              (level.settings as ConceptSettings).conceptKind,
              level.questionCount,
            )
          : generateConceptSession('counting', 5)
    return {
      problems: initial,
      index: 0,
      attempts: 0,
      wrongInProblem: 0,
      feedback: null,
      locked: false,
      results: [],
      finished: false,
    }
  })

  useEffect(() => {
    markLevelStarted(levelId)
  }, [levelId, markLevelStarted])

  const problem = state.problems[state.index]

  const finishSession = useCallback(
    (finished: ConceptLearnState) => {
      const totalQuestions = finished.results.length
      const correctFirstTry = finished.results.filter((r) => r.wrongAttempts === 0).length
      const wrongAttempts = finished.results.reduce((s, r) => s + r.wrongAttempts, 0)
      const recovered = finished.results.filter((r) => r.wrongAttempts > 0).length
      const stars = starsFor(correctFirstTry, totalQuestions)
      const newAchievementIds: string[] = []
      for (const r of finished.results) {
        newAchievementIds.push(
          ...recordConceptAnswer({ kind: r.problem.kind, wrongAttempts: r.wrongAttempts }).map(
            (a) => a.id,
          ),
        )
      }
      newAchievementIds.push(...completeLevel(levelId, stars).map((a) => a.id))
      const summary: SessionSummary = {
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
    [completeLevel, levelId, navigate, recordConceptAnswer, setLeaveGuard, title],
  )

  const handleChoice = (choice: string) => {
    if (state.locked || !problem) return
    const correct = choice === problem.expectedAnswer
    if (correct) {
      playCorrect()
      const feedback: Feedback = { kind: 'correct', text: t('concept.correctFeedback') }
      const nextResults = [...state.results, { problem, wrongAttempts: state.wrongInProblem }]
      setState((s) => ({ ...s, feedback, locked: true }))
      window.setTimeout(() => {
        if (state.index + 1 < state.problems.length) {
          setState({
            problems: state.problems,
            index: state.index + 1,
            attempts: 0,
            wrongInProblem: 0,
            feedback: null,
            locked: false,
            results: nextResults,
            finished: false,
          })
        } else {
          finishSession({ ...state, results: nextResults, finished: true })
        }
      }, 700)
      return
    }
    playWrong()
    const attempts = state.attempts + 1
    const wrongInProblem = state.wrongInProblem + 1
    if (attempts >= 3) {
      const expectedLabel =
        problem.kind === 'compare'
          ? (conceptChoices(problem, t)[problem.choices.indexOf(problem.expectedAnswer)] ??
            problem.expectedAnswer)
          : problem.expectedAnswer
      setState((s) => ({
        ...s,
        attempts: 0,
        wrongInProblem,
        feedback: { kind: 'info', text: t('concept.revealedFeedback', { answer: expectedLabel }) },
        locked: true,
      }))
      window.setTimeout(() => {
        const nextResults = [...state.results, { problem, wrongAttempts: wrongInProblem }]
        if (state.index + 1 < state.problems.length) {
          setState({
            problems: state.problems,
            index: state.index + 1,
            attempts: 0,
            wrongInProblem: 0,
            feedback: null,
            locked: false,
            results: nextResults,
            finished: false,
          })
        } else {
          finishSession({ ...state, results: nextResults, finished: true })
        }
      }, 1200)
      return
    }
    setState((s) => ({
      ...s,
      attempts,
      wrongInProblem,
      feedback: { kind: 'wrong', text: t('concept.wrongFeedback') },
      locked: true,
    }))
    window.setTimeout(() => setState((s) => ({ ...s, locked: false })), 600)
  }

  const prompt = useMemo(() => (problem ? conceptPrompt(problem.question, t) : ''), [problem, t])
  const choiceLabels = useMemo(() => (problem ? conceptChoices(problem, t) : []), [problem, t])

  const [exitOpen, setExitOpen] = useState(false)
  const openExit = useCallback(() => setExitOpen(true), [])
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

  if (!problem) {
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
            {t('learn.questionOf', { current: state.index + 1, total: state.problems.length })}
          </p>
        </div>
        <ProgressBar
          value={state.index / state.problems.length}
          label={t('learn.progressLabel', {
            current: state.index + 1,
            total: state.problems.length,
          })}
        />
      </section>

      <MascotBubble text={prompt} mood={state.feedback?.kind === 'correct' ? 'cheer' : 'happy'} />

      <div className="rounded-3xl border-2 border-sky-100 bg-white p-4 shadow-sm">
        <ConceptQuestionView problem={problem} />
      </div>

      <div className="space-y-2">
        <FeedbackMessage feedback={state.feedback} />
        <div className="grid grid-cols-2 gap-2">
          {problem.choices.map((choice, i) => (
            <button
              key={choice + String(i)}
              type="button"
              disabled={state.locked}
              onClick={() => handleChoice(choice)}
              className="min-h-14 rounded-2xl border-2 border-sky-200 bg-white px-3 py-3 text-sm font-black text-slate-700 hover:bg-sky-50 disabled:opacity-50"
            >
              {choiceLabels[i]}
            </button>
          ))}
        </div>
      </div>

      {exitOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl">
            <h2 className="text-base font-black text-slate-800">{t('learn.exitTitle')}</h2>
            <p className="mt-2 text-sm text-slate-600">{t('learn.exitDesc')}</p>
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setExitOpen(false)
                  confirmPendingNavigation()
                }}
                className="flex-1 rounded-xl bg-rose-500 py-2 text-sm font-bold text-white"
              >
                {t('learn.exitConfirm')}
              </button>
              <button
                type="button"
                onClick={() => {
                  setExitOpen(false)
                  cancelPendingNavigation()
                }}
                className="flex-1 rounded-xl border-2 border-slate-200 py-2 text-sm font-bold text-slate-700"
              >
                {t('learn.exitCancel')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
