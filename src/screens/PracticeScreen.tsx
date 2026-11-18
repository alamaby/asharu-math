import { useCallback, useEffect, useReducer, useRef, useState } from 'react'
import FeedbackMessage from '../components/guide/FeedbackMessage'
import HintPanel from '../components/guide/HintPanel'
import ProgressBar from '../components/guide/ProgressBar'
import MascotBubble from '../components/layout/MascotBubble'
import NumericKeypad from '../components/input/NumericKeypad'
import StoryCard from '../components/story/StoryCard'
import VerticalMathProblem from '../components/math/VerticalMathProblem'
import { useI18n } from '../i18n/LanguageContext'
import { buildProblem, generateSession } from '../lib/problemGenerator'
import { generateStorySession } from '../lib/storyGenerator'
import { starsFor } from '../lib/scoring'
import { playCorrect, playWrong } from '../lib/sound'
import {
  checkAnswerDigits,
  getHint,
  requiredAnswerColumnIndexes,
  shouldOfferGuidedMode,
} from '../lib/validation'
import { useNavigation } from '../state/NavigationContext'
import { useProgress } from '../state/ProgressContext'
import type {
  CarryMode,
  DigitCount,
  GeneratorSettings,
  MathProblem,
  OperationChoice,
  OperationType,
  SessionStats,
  SessionSummary,
  StoryFamily,
  StoryPart,
  StoryProblem,
  StorySettings,
} from '../types'
import {
  columnSessionReducer,
  initColumnSessionState,
  type ColumnSessionState,
} from '../lib/columnSessionMachine'
import { useQuestionSession } from '../hooks/useQuestionSession'
import type { QuestionResult } from '../lib/questionSessionMachine'

interface StoryQueueItem {
  story: StoryProblem
  part: StoryPart
}

export type PracticeSessionState =
  | { kind: 'setup' }
  | {
      kind: 'column'
      problems: MathProblem[]
      settings: GeneratorSettings | null
      title: string
    }
  | {
      kind: 'story'
      queue: StoryQueueItem[]
      settings: GeneratorSettings | null
      title: string
    }

function familiesForPractice(digits: DigitCount, op: OperationChoice): readonly StoryFamily[] {
  const f0: StoryFamily[] =
    op === 'addition' ? ['f0-add'] : op === 'subtraction' ? ['f0-sub'] : ['f0-add', 'f0-sub']
  if (digits <= 1) return f0 as readonly StoryFamily[]
  if (digits === 2) return [...f0, 'f1-diff'] as readonly StoryFamily[]
  return [
    ...f0,
    'f1-diff',
    'f2-transfer',
    'f3-chain',
    'f4-join3',
    'f5-tiered',
  ] as readonly StoryFamily[]
}

function OptionGroup<T extends string | number>(props: {
  label: string
  options: { value: T; label: string }[]
  value: T
  onChange: (value: T) => void
}) {
  const { label, options, value, onChange } = props
  return (
    <fieldset>
      <legend className="text-sm font-black text-slate-700">{label}</legend>
      <div className="mt-2 flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={String(option.value)}
            type="button"
            aria-pressed={option.value === value}
            onClick={() => onChange(option.value)}
            className={`min-h-11 rounded-2xl border-2 px-4 text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-300 ${
              option.value === value
                ? 'border-sky-500 bg-sky-100 text-sky-800'
                : 'border-slate-200 bg-white text-slate-600 hover:bg-sky-50'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </fieldset>
  )
}

// ─── Setup View ─────────────────────────────────────────────────────────────

interface PracticeSetupViewProps {
  initialSettings?: GeneratorSettings
  onStartConfigured: (settings: GeneratorSettings, mode: 'column' | 'story') => void
  onStartCustom: (problem: MathProblem) => void
}

function PracticeSetupView({
  initialSettings,
  onStartConfigured,
  onStartCustom,
}: PracticeSetupViewProps) {
  const { t } = useI18n()

  const [formMode, setFormMode] = useState<'column' | 'story'>(
    initialSettings?.presentation ?? 'column',
  )
  const [formOperation, setFormOperation] = useState<OperationChoice>('addition')
  const [formDigits, setFormDigits] = useState<DigitCount>(2)
  const [formCount, setFormCount] = useState(5)
  const [formCarry, setFormCarry] = useState<CarryMode>('any')

  const [customFirst, setCustomFirst] = useState('26')
  const [customSecond, setCustomSecond] = useState('87')
  const [customOperation, setCustomOperation] = useState<OperationType>('addition')
  const [customError, setCustomError] = useState<string | null>(null)

  const handleStartConfigured = () => {
    const settings: GeneratorSettings = {
      operation: formOperation,
      digitCount: formDigits,
      carryMode: formCarry,
      questionCount: formCount,
    }
    onStartConfigured(settings, formMode)
  }

  const handleStartCustom = () => {
    const first = Number(customFirst)
    const second = Number(customSecond)
    if (customFirst === '' || customSecond === '') {
      setCustomError('Isi kedua angka dulu ya.')
      return
    }
    if (first > 9999 || second > 9999) {
      setCustomError('Angka maksimal 4 digit ya.')
      return
    }
    if (customOperation === 'subtraction' && first < second) {
      setCustomError(
        'Untuk pengurangan, angka atas harus lebih besar atau sama dengan angka bawah.',
      )
      return
    }
    if (customOperation === 'addition' && first + second > 9999) {
      setCustomError('Hasil penjumlahan maksimal 9999 ya. Coba angka yang lebih kecil.')
      return
    }
    setCustomError(null)
    const problem = buildProblem(customOperation, first, second)
    onStartCustom(problem)
  }

  return (
    <div className="space-y-5">
      <MascotBubble text={t('practice.bubble')} mood="happy" />

      <section className="space-y-4 rounded-3xl border-2 border-sky-100 bg-white p-4 shadow-sm md:p-5">
        <h2 className="text-base font-black text-slate-800">{t('practice.configTitle')}</h2>
        <OptionGroup
          label={t('practice.modeLabel')}
          value={formMode}
          onChange={setFormMode}
          options={[
            { value: 'column', label: t('practice.modeColumn') },
            { value: 'story', label: t('practice.modeStory') },
          ]}
        />
        <OptionGroup
          label={t('practice.operationLabel')}
          value={formOperation}
          onChange={setFormOperation}
          options={[
            { value: 'addition', label: t('practice.op.addition') },
            { value: 'subtraction', label: t('practice.op.subtraction') },
            { value: 'mixed', label: t('practice.op.mixed') },
          ]}
        />
        <OptionGroup
          label={t('practice.digitsLabel')}
          value={formDigits}
          onChange={setFormDigits}
          options={[
            { value: 1, label: t('practice.digitOption', { n: 1 }) },
            { value: 2, label: t('practice.digitOption', { n: 2 }) },
            { value: 3, label: t('practice.digitOption', { n: 3 }) },
            { value: 4, label: t('practice.digitOption', { n: 4 }) },
          ]}
        />
        <OptionGroup
          label={t('practice.countLabel')}
          value={formCount}
          onChange={setFormCount}
          options={[
            { value: 5, label: t('practice.countOption', { n: 5 }) },
            { value: 10, label: t('practice.countOption', { n: 10 }) },
            { value: 15, label: t('practice.countOption', { n: 15 }) },
            { value: 20, label: t('practice.countOption', { n: 20 }) },
          ]}
        />
        <OptionGroup
          label={t('practice.carryLabel')}
          value={formCarry}
          onChange={setFormCarry}
          options={[
            { value: 'none', label: t('practice.carry.none') },
            { value: 'required', label: t('practice.carry.required') },
            { value: 'any', label: t('practice.carry.any') },
          ]}
        />
        <button
          type="button"
          onClick={handleStartConfigured}
          className="min-h-12 w-full rounded-2xl border-b-4 border-sky-600 bg-sky-500 text-base font-black text-white hover:bg-sky-400 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-300"
        >
          {t('practice.start')}
        </button>
      </section>

      <section className="space-y-4 rounded-3xl border-2 border-amber-200 bg-amber-50 p-4 shadow-sm md:p-5">
        <h2 className="text-base font-black text-amber-900">{t('practice.customTitle')}</h2>
        <p className="text-sm font-semibold text-amber-800">{t('practice.customDesc')}</p>
        <div className="flex flex-wrap items-end gap-3">
          <label className="flex flex-col gap-1 text-xs font-bold text-amber-900">
            {t('practice.topNumber')}
            <input
              value={customFirst}
              onChange={(event) =>
                setCustomFirst(event.target.value.replace(/[^0-9]/g, '').slice(0, 4))
              }
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={4}
              placeholder="26"
              aria-label={t('practice.topAria')}
              className="h-12 w-24 rounded-xl border-2 border-amber-300 bg-white px-3 text-xl font-extrabold tabular-nums text-slate-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-amber-200"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs font-bold text-amber-900">
            {t('practice.bottomNumber')}
            <input
              value={customSecond}
              onChange={(event) =>
                setCustomSecond(event.target.value.replace(/[^0-9]/g, '').slice(0, 4))
              }
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={4}
              placeholder="87"
              aria-label={t('practice.bottomAria')}
              className="h-12 w-24 rounded-xl border-2 border-amber-300 bg-white px-3 text-xl font-extrabold tabular-nums text-slate-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-amber-200"
            />
          </label>
          <div className="flex gap-2" role="group" aria-label={t('practice.groupAria')}>
            {(
              [
                { value: 'addition', label: t('practice.addBtn') },
                { value: 'subtraction', label: t('practice.subBtn') },
              ] as const
            ).map((option) => (
              <button
                key={option.value}
                type="button"
                aria-pressed={customOperation === option.value}
                onClick={() => setCustomOperation(option.value)}
                className={`min-h-12 rounded-2xl border-2 px-4 text-sm font-bold focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-amber-200 ${
                  customOperation === option.value
                    ? 'border-amber-500 bg-amber-200 text-amber-900'
                    : 'border-amber-300 bg-white text-amber-800'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
        {customError && (
          <p role="alert" className="text-sm font-bold text-amber-800">
            {customError}
          </p>
        )}
        <button
          type="button"
          onClick={handleStartCustom}
          className="min-h-12 w-full rounded-2xl border-b-4 border-amber-500 bg-amber-400 text-base font-black text-amber-950 hover:bg-amber-300 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-amber-200"
        >
          {t('practice.doIt')}
        </button>
      </section>
    </div>
  )
}

// ─── Story Solving View ─────────────────────────────────────────────────────

interface PracticeStorySolvingViewProps {
  queue: StoryQueueItem[]
  title: string
  settings: GeneratorSettings | null
  onFinish: (
    results: QuestionResult<StoryQueueItem>[],
    title: string,
    settings: GeneratorSettings | null,
  ) => void
  onSwitchToGuided: (remaining: MathProblem[], stats: SessionStats, title: string) => void
}

function PracticeStorySolvingView({
  queue,
  title,
  settings,
  onFinish,
  onSwitchToGuided,
}: PracticeStorySolvingViewProps) {
  const { t } = useI18n()

  const handleComplete = useCallback(
    (results: QuestionResult<StoryQueueItem>[]) => {
      onFinish(results, title, settings)
    },
    [onFinish, title, settings],
  )

  const {
    currentItem: item,
    isLocked,
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
    onComplete: handleComplete,
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

  const handleSwitchToGuided = () => {
    if (!part) return
    const remaining = queue.slice(index)
    const initialStats: SessionStats = {
      correctFirstTry: results.filter((r) => r.wrongAttempts === 0).length,
      wrongAttempts: results.reduce((sum, r) => sum + r.wrongAttempts, 0) + wrongInCurrent,
      recovered: results.filter((r) => r.wrongAttempts > 0).length,
      totalDone: results.length,
    }
    onSwitchToGuided(
      remaining.map((q) => q.part.math),
      initialStats,
      title,
    )
  }

  if (!item || !part || !story) return null

  const checkDisabled = interim === '' || isLocked

  return (
    <div className="space-y-4">
      <section aria-label={t('practice.progressAria')} className="space-y-1.5">
        <div className="flex items-baseline justify-between">
          <h1 className="text-base font-black text-slate-800 md:text-lg">{title}</h1>
          <p className="text-xs font-bold text-slate-500">
            {t('learn.questionOf', {
              current: index + 1,
              total: totalItems,
            })}
          </p>
        </div>
        <ProgressBar value={index / totalItems} label="Progres cerita" />
      </section>

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
          checkDisabled={checkDisabled}
          digitsDisabled={isLocked}
          checkLabel={t('keypad.checkDefault')}
        />
        {attempts >= 2 && !isLocked && (
          <button
            type="button"
            onClick={handleSwitchToGuided}
            className="min-h-11 rounded-2xl border-2 border-violet-200 bg-violet-50 px-4 text-sm font-bold text-violet-700 hover:bg-violet-100 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-violet-300"
          >
            {t('story.tryColumn')}
          </button>
        )}
        <FeedbackMessage feedback={feedback} />
      </div>
    </div>
  )
}

// ─── Column Solving View ────────────────────────────────────────────────────

interface PracticeColumnSolvingViewProps {
  problems: MathProblem[]
  settings: GeneratorSettings | null
  title: string
  onFinish: (finished: ColumnSessionState) => void
  onSwitchToGuided: (remaining: MathProblem[], stats: SessionStats, title: string) => void
}

function PracticeColumnSolvingView({
  problems,
  settings,
  title,
  onFinish,
  onSwitchToGuided,
}: PracticeColumnSolvingViewProps) {
  const { t } = useI18n()
  const [session, dispatch] = useReducer(
    columnSessionReducer,
    { problems, settings, title },
    (init) => initColumnSessionState(init.problems, init.settings, init.title),
  )

  const finishedRef = useRef(false)
  useEffect(() => {
    if (session.finished && !finishedRef.current) {
      finishedRef.current = true
      onFinish(session)
    }
  }, [session, onFinish])

  const problem = session.problems[session.index]

  const timeoutRef = useRef<number | null>(null)
  useEffect(() => {
    return () => {
      if (timeoutRef.current !== null) window.clearTimeout(timeoutRef.current)
    }
  }, [])

  const handleDigit = (digit: number) => {
    dispatch({ type: 'digit', digit })
  }

  const handleBackspace = () => {
    dispatch({ type: 'backspace' })
  }

  const handleSelectCol = (columnIndex: number) => {
    dispatch({ type: 'select_col', columnIndex })
  }

  const handleCheck = () => {
    if (!problem || session.locked) return
    const required = requiredAnswerColumnIndexes(problem)
    if (required.some((columnIndex) => session.given[columnIndex] === null)) return

    const result = checkAnswerDigits(problem, session.given)
    if (result.allCorrect) {
      playCorrect()
      const praises = [
        t('practice.praise1'),
        t('practice.praise2'),
        t('practice.praise3'),
        t('practice.praise4'),
      ]
      const praise = praises[Math.floor(Math.random() * praises.length)]
      dispatch({ type: 'check_correct', praise })
      if (timeoutRef.current !== null) window.clearTimeout(timeoutRef.current)
      timeoutRef.current = window.setTimeout(() => {
        dispatch({ type: 'advance', nextProblemFeedbackText: t('feedback.nextProblem') })
      }, 1000)
      return
    }

    playWrong()
    const attempts = session.attempts + 1
    dispatch({
      type: 'check_wrong',
      wrongCols: result.wrongColumnIndexes,
      feedbackText: t('feedback.wrongPractice'),
      hint: getHint(problem, attempts, result.wrongColumnIndexes, t),
      offerHelp: shouldOfferGuidedMode(attempts),
    })
    if (timeoutRef.current !== null) window.clearTimeout(timeoutRef.current)
    timeoutRef.current = window.setTimeout(() => {
      dispatch({ type: 'unlock' })
    }, 700)
  }

  const switchToGuided = () => {
    if (!problem) return
    const remaining = session.problems.slice(session.index)
    const initialStats: SessionStats = {
      correctFirstTry: session.results.filter((r) => r.wrongAttempts === 0).length,
      wrongAttempts:
        session.results.reduce((sum, r) => sum + r.wrongAttempts, 0) + session.wrongInProblem,
      recovered: session.results.filter((r) => r.wrongAttempts > 0).length,
      totalDone: session.results.length,
    }
    onSwitchToGuided(remaining, initialStats, session.title)
  }

  if (!problem) return null

  const required = requiredAnswerColumnIndexes(problem)
  const checkDisabled =
    session.locked || required.some((columnIndex) => session.given[columnIndex] === null)

  return (
    <div className="solve-split">
      <section aria-label={t('practice.progressAria')} className="solve-progress space-y-1.5">
        <div className="flex items-baseline justify-between">
          <h1 className="text-base font-black text-slate-800 md:text-lg">{session.title}</h1>
          <p className="text-xs font-bold text-slate-500">
            {t('learn.questionOf', {
              current: session.index + 1,
              total: session.problems.length,
            })}
          </p>
        </div>
        <ProgressBar value={session.index / session.problems.length} label="Progres latihan" />
      </section>

      <div className="solve-main flex justify-center rounded-3xl border-2 border-sky-100 bg-white p-3 shadow-sm md:p-5">
        <VerticalMathProblem
          problem={problem}
          answers={session.given}
          activeCell={{ kind: 'answer', columnIndex: session.activeCol }}
          wrongAnswerColumns={session.wrongCols}
          onSelectAnswerCell={handleSelectCol}
        />
      </div>

      <div className="solve-feedback space-y-3">
        <FeedbackMessage feedback={session.feedback} />
        <HintPanel hint={session.hint} />

        {session.offerHelp && (
          <div className="animate-rise rounded-3xl border-2 border-violet-200 bg-violet-50 p-4">
            <p className="text-sm font-bold text-violet-800">{t('practice.offerGuided')}</p>
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={switchToGuided}
                className="min-h-11 flex-1 rounded-2xl border-b-4 border-violet-600 bg-violet-500 text-sm font-bold text-white hover:bg-violet-400 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-violet-300"
              >
                {t('practice.guidedYes')}
              </button>
              <button
                type="button"
                onClick={() => dispatch({ type: 'dismiss_help' })}
                className="min-h-11 flex-1 rounded-2xl border-2 border-violet-200 bg-white text-sm font-bold text-violet-700 hover:bg-violet-100 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-violet-300"
              >
                {t('practice.guidedNo')}
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="solve-guide" />

      <div className="solve-side">
        <NumericKeypad
          onDigit={handleDigit}
          onBackspace={handleBackspace}
          onCheck={handleCheck}
          checkDisabled={checkDisabled}
          digitsDisabled={session.locked}
          checkLabel={t('keypad.checkDefault')}
        />
        <p className="text-center text-xs font-bold text-slate-400">{t('practice.hintFooter')}</p>
      </div>
    </div>
  )
}

// ─── Main PracticeScreen ────────────────────────────────────────────────────

export interface PracticeScreenProps {
  settings?: GeneratorSettings
}

export default function PracticeScreen({ settings: initialSettings }: PracticeScreenProps) {
  const { navigate } = useNavigation()
  const { recordAnswer } = useProgress()
  const { t } = useI18n()

  const [sessionState, setSessionState] = useState<PracticeSessionState>(() => {
    if (initialSettings?.presentation === 'story') {
      const storySettings: StorySettings = {
        kind: 'story',
        operation: initialSettings.operation,
        digitCount: initialSettings.digitCount,
        carryMode: initialSettings.carryMode,
        questionCount: initialSettings.questionCount,
        families: familiesForPractice(initialSettings.digitCount, initialSettings.operation),
      }
      const stems = generateStorySession(storySettings)
      const queue = stems.flatMap((s) => s.parts.map((p) => ({ story: s, part: p })))
      return {
        kind: 'story',
        queue,
        settings: initialSettings,
        title: t('practice.sessionTitle'),
      }
    }
    if (initialSettings) {
      return {
        kind: 'column',
        problems: generateSession(initialSettings),
        settings: initialSettings,
        title: t('practice.sessionTitle'),
      }
    }
    return { kind: 'setup' }
  })

  const handleFinishColumn = useCallback(
    (finished: ColumnSessionState) => {
      const totalQuestions = finished.results.length
      const correctFirstTry = finished.results.filter((r) => r.wrongAttempts === 0).length
      const wrongAttempts = finished.results.reduce((sum, r) => sum + r.wrongAttempts, 0)
      const recovered = finished.results.filter((r) => r.wrongAttempts > 0).length
      const stars = starsFor(correctFirstTry, totalQuestions)
      const newAchievementIds: string[] = []
      for (const result of finished.results) {
        newAchievementIds.push(
          ...recordAnswer({ problem: result.problem, wrongAttempts: result.wrongAttempts }).map(
            (a) => a.id,
          ),
        )
      }
      const summary: SessionSummary = {
        title: finished.title,
        totalQuestions,
        correctFirstTry,
        wrongAttempts,
        recovered,
        stars,
        levelId: null,
        settings: finished.settings,
        nextLevelId: null,
        newAchievementIds: [...new Set(newAchievementIds)],
      }
      navigate({ name: 'result', summary })
    },
    [navigate, recordAnswer],
  )

  const handleFinishStory = useCallback(
    (
      results: QuestionResult<StoryQueueItem>[],
      title: string,
      settings: GeneratorSettings | null,
    ) => {
      const totalQuestions = results.length
      const correctFirstTry = results.filter((r) => r.wrongAttempts === 0).length
      const wrongAttempts = results.reduce((sum, r) => sum + r.wrongAttempts, 0)
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
      const summary: SessionSummary = {
        title,
        totalQuestions,
        correctFirstTry,
        wrongAttempts,
        recovered,
        stars,
        levelId: null,
        settings,
        nextLevelId: null,
        newAchievementIds: [...new Set(newAchievementIds)],
      }
      navigate({ name: 'result', summary })
    },
    [navigate, recordAnswer],
  )

  const handleSwitchToGuided = useCallback(
    (remaining: MathProblem[], initialStats: SessionStats, title: string) => {
      navigate({
        name: 'learn',
        levelId: null,
        problems: remaining,
        initialStats,
        title,
      })
    },
    [navigate],
  )

  if (sessionState.kind === 'column') {
    return (
      <PracticeColumnSolvingView
        problems={sessionState.problems}
        settings={sessionState.settings}
        title={sessionState.title}
        onFinish={handleFinishColumn}
        onSwitchToGuided={handleSwitchToGuided}
      />
    )
  }

  if (sessionState.kind === 'story') {
    return (
      <PracticeStorySolvingView
        queue={sessionState.queue}
        settings={sessionState.settings}
        title={sessionState.title}
        onFinish={handleFinishStory}
        onSwitchToGuided={handleSwitchToGuided}
      />
    )
  }

  return (
    <PracticeSetupView
      initialSettings={initialSettings}
      onStartConfigured={(settings, mode) => {
        if (mode === 'story') {
          const storySettings: StorySettings = {
            kind: 'story',
            operation: settings.operation,
            digitCount: settings.digitCount,
            carryMode: settings.carryMode,
            questionCount: settings.questionCount,
            families: familiesForPractice(settings.digitCount, settings.operation),
          }
          const stems = generateStorySession(storySettings)
          const queue = stems.flatMap((s) => s.parts.map((p) => ({ story: s, part: p })))
          setSessionState({
            kind: 'story',
            queue,
            settings: { ...settings, presentation: 'story' },
            title: t('practice.sessionTitle'),
          })
        } else {
          setSessionState({
            kind: 'column',
            problems: generateSession(settings),
            settings,
            title: t('practice.sessionTitle'),
          })
        }
      }}
      onStartCustom={(problem) => {
        setSessionState({
          kind: 'column',
          problems: [problem],
          settings: null,
          title: t('practice.customSessionTitle'),
        })
      }}
    />
  )
}
