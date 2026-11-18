import { useCallback, useEffect, useMemo, useState } from 'react'
import ConceptQuestionView from '../components/concept/ConceptQuestionView'
import ConfirmDialog from '../components/common/ConfirmDialog'
import FeedbackMessage from '../components/guide/FeedbackMessage'
import ProgressBar from '../components/guide/ProgressBar'
import MascotBubble from '../components/layout/MascotBubble'
import { getLevel, getNextLevelId } from '../data/levels'
import { useI18n } from '../i18n/LanguageContext'
import { conceptChoices, conceptPrompt } from '../i18n/concept'
import { generateConceptSession } from '../lib/conceptGenerator'
import { starsFor } from '../lib/scoring'
import { useNavigation } from '../state/NavigationContext'
import { useProgress } from '../state/ProgressContext'
import type { ConceptProblem, ConceptSettings, SessionSummary } from '../types'
import { useQuestionSession } from '../hooks/useQuestionSession'
import type { QuestionResult } from '../lib/questionSessionMachine'

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

  const problems = useMemo<ConceptProblem[]>(() => {
    if (provided && provided.length > 0) return provided
    if (level && level.levelKind === 'concept') {
      return generateConceptSession(
        (level.settings as ConceptSettings).conceptKind,
        level.questionCount,
      )
    }
    return generateConceptSession('counting', 5)
  }, [provided, level])

  useEffect(() => {
    markLevelStarted(levelId)
  }, [levelId, markLevelStarted])

  const finishSession = useCallback(
    (results: QuestionResult<ConceptProblem>[]) => {
      const totalQuestions = results.length
      const correctFirstTry = results.filter((r) => r.wrongAttempts === 0).length
      const wrongAttempts = results.reduce((s, r) => s + r.wrongAttempts, 0)
      const recovered = results.filter((r) => r.wrongAttempts > 0).length
      const stars = starsFor(correctFirstTry, totalQuestions)
      const newAchievementIds: string[] = []
      for (const r of results) {
        newAchievementIds.push(
          ...recordConceptAnswer({ kind: r.item.kind, wrongAttempts: r.wrongAttempts }).map(
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

  const {
    currentItem: problem,
    isLocked,
    isCompleted,
    attempts,
    feedback,
    index,
    totalItems,
    submitAnswer,
  } = useQuestionSession<ConceptProblem>({
    items: problems,
    onComplete: finishSession,
  })

  const handleChoice = (choice: string) => {
    if (isLocked || !problem) return
    const correct = choice === problem.expectedAnswer
    if (correct) {
      submitAnswer(true, { kind: 'correct', text: t('concept.correctFeedback') })
      return
    }
    const nextAttempts = attempts + 1
    if (nextAttempts >= 3) {
      const expectedLabel =
        problem.kind === 'compare'
          ? (conceptChoices(problem, t)[problem.choices.indexOf(problem.expectedAnswer)] ??
            problem.expectedAnswer)
          : problem.expectedAnswer
      submitAnswer(false, {
        kind: 'info',
        text: t('concept.revealedFeedback', { answer: expectedLabel }),
      })
      return
    }
    submitAnswer(false, { kind: 'wrong', text: t('concept.wrongFeedback') })
  }

  const prompt = useMemo(() => (problem ? conceptPrompt(problem.question, t) : ''), [problem, t])
  const choiceLabels = useMemo(() => (problem ? conceptChoices(problem, t) : []), [problem, t])

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

      <MascotBubble text={prompt} mood={feedback?.kind === 'correct' ? 'cheer' : 'happy'} />

      <div className="rounded-3xl border-2 border-sky-100 bg-white p-4 shadow-sm">
        <ConceptQuestionView problem={problem} />
      </div>

      <div className="space-y-2">
        <FeedbackMessage feedback={feedback} />
        <div className="grid grid-cols-2 gap-2">
          {problem.choices.map((choice, i) => (
            <button
              key={choice + String(i)}
              type="button"
              disabled={isLocked}
              onClick={() => handleChoice(choice)}
              className="min-h-14 rounded-2xl border-2 border-sky-200 bg-white px-3 py-3 text-sm font-black text-slate-700 hover:bg-sky-50 disabled:opacity-50"
            >
              {choiceLabels[i]}
            </button>
          ))}
        </div>
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
