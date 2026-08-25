import { useCallback, useEffect, useReducer, useRef, useState } from 'react'
import ConfirmDialog from '../components/common/ConfirmDialog'
import FeedbackMessage, { type Feedback } from '../components/guide/FeedbackMessage'
import ProgressBar from '../components/guide/ProgressBar'
import StepGuide from '../components/guide/StepGuide'
import Mascot from '../components/layout/Mascot'
import NumericKeypad from '../components/input/NumericKeypad'
import VerticalMathProblem from '../components/math/VerticalMathProblem'
import { buildChallengeSettings, getLevel, getNextLevelId } from '../data/levels'
import { generateSession } from '../lib/problemGenerator'
import { starsFor } from '../lib/scoring'
import { playCelebrate, playCorrect, playWrong } from '../lib/sound'
import { useNavigation } from '../state/NavigationContext'
import { useProgress } from '../state/ProgressContext'
import type { LearningStep, MathProblem, SessionStats, SessionSummary } from '../types'

interface ProblemResult {
  problem: MathProblem
  wrongAttempts: number
}

export type { LearnState }

interface LearnState {
  problems: MathProblem[]
  problemIndex: number
  stepIndex: number
  answers: (number | null)[]
  carries: (number | null)[]
  /** Nilai pinjam terungkap per kolom grid; null = belum dijelaskan */
  borrowValues: (number | null)[]
  doneAnswerColumns: number[]
  interim: string
  attempts: number
  wrongInProblem: number
  feedback: Feedback | null
  stepComplete: boolean
  /**
   * Ditambah setiap kali langkah selesai dengan BENAR (bukan diungkap).
   * Komponen memakainya untuk auto-lanjut; null berarti tidak ada jadwal.
   */
  autoAdvanceToken: number | null
  results: ProblemResult[]
  finished: boolean
}

export type LearnAction =
  | { type: 'digit'; digit: number }
  | { type: 'backspace' }
  | { type: 'choose'; answer: 'bisa' | 'tidak-bisa' }
  | { type: 'check-interim' }
  | { type: 'next' }
  | { type: 'prev' }
  | { type: 'repeat' }

function isAutoCompleteStep(step: LearningStep): boolean {
  return step.kind === 'intro' || step.kind === 'borrow-explain' || step.kind === 'review'
}

function currentStepOf(state: LearnState): LearningStep | undefined {
  return state.problems[state.problemIndex]?.learningSteps[state.stepIndex]
}

function uniqueAdd(list: readonly number[], value: number): number[] {
  return list.includes(value) ? [...list] : [...list, value]
}

function freshProblemState(
  problem: MathProblem,
): Pick<
  LearnState,
  | 'answers'
  | 'carries'
  | 'borrowValues'
  | 'doneAnswerColumns'
  | 'interim'
  | 'attempts'
  | 'wrongInProblem'
  | 'feedback'
  | 'stepComplete'
> {
  const width = problem.columns.length
  return {
    answers: new Array<number | null>(width).fill(null),
    carries: new Array<number | null>(width).fill(null),
    borrowValues: new Array<number | null>(width).fill(null),
    doneAnswerColumns: [],
    interim: '',
    attempts: 0,
    wrongInProblem: 0,
    feedback: null,
    stepComplete: isAutoCompleteStep(problem.learningSteps[0]),
  }
}

export function initState(problems: MathProblem[]): LearnState {
  return {
    problems,
    problemIndex: 0,
    stepIndex: 0,
    results: [],
    finished: false,
    autoAdvanceToken: null,
    ...freshProblemState(problems[0]),
  }
}

/** Kembali ke langkah sebelumnya dengan memutar ulang langkah yang sudah selesai. */
function replayTo(state: LearnState, targetIndex: number): LearnState {
  const problem = state.problems[state.problemIndex]
  const width = problem.columns.length
  const answers: (number | null)[] = new Array(width).fill(null)
  const carries: (number | null)[] = new Array(width).fill(null)
  const borrowValues: (number | null)[] = new Array(width).fill(null)
  let doneAnswerColumns: number[] = []

  for (let i = 0; i < targetIndex; i++) {
    const step = problem.learningSteps[i]
    if (step.kind === 'answer-digit') {
      answers[step.columnIndex] = step.expectedDigit
      doneAnswerColumns = uniqueAdd(doneAnswerColumns, step.columnIndex)
    } else if (step.kind === 'carry-digit') {
      carries[step.columnIndex] = step.expectedDigit
    } else if (step.kind === 'borrow-explain') {
      for (const change of step.changes) borrowValues[change.columnIndex] = change.after
    }
  }

  const step = problem.learningSteps[targetIndex]
  const filled =
    step.kind === 'answer-digit'
      ? answers[step.columnIndex] !== null
      : step.kind === 'carry-digit'
        ? carries[step.columnIndex] !== null
        : false

  return {
    ...state,
    stepIndex: targetIndex,
    answers,
    carries,
    borrowValues,
    doneAnswerColumns,
    interim: '',
    attempts: 0,
    stepComplete: isAutoCompleteStep(step) || filled,
    feedback: null,
    autoAdvanceToken: null,
  }
}

function digitHint(given: number, expected: number, attempts: number): string {
  if (attempts <= 1) return 'Hampir! Coba hitung sekali lagi ya.'
  return `Petunjuk: angka yang benar ${expected > given ? 'lebih besar' : 'lebih kecil'} dari ${given}.`
}

export function learnReducer(state: LearnState, action: LearnAction): LearnState {
  if (state.finished) return state
  const problem = state.problems[state.problemIndex]
  if (!problem) return state
  const step = problem.learningSteps[state.stepIndex]
  if (!step) return state
  const nextToken = (): number => (state.autoAdvanceToken ?? 0) + 1

  switch (action.type) {
    case 'digit': {
      if (state.stepComplete) return state
      if (step.kind === 'interim-sum') {
        if (state.interim.length >= 2) return state
        return { ...state, interim: state.interim + String(action.digit), feedback: null }
      }
      if (step.kind === 'answer-digit') {
        const answers = [...state.answers]
        if (action.digit === step.expectedDigit) {
          answers[step.columnIndex] = action.digit
          return {
            ...state,
            answers,
            doneAnswerColumns: uniqueAdd(state.doneAnswerColumns, step.columnIndex),
            stepComplete: true,
            attempts: 0,
            feedback: { kind: 'correct', text: 'Benar! Hebat!' },
            autoAdvanceToken: nextToken(),
          }
        }
        const attempts = state.attempts + 1
        const wrongInProblem = state.wrongInProblem + 1
        answers[step.columnIndex] = attempts >= 3 ? step.expectedDigit : null
        if (attempts >= 3) {
          return {
            ...state,
            answers,
            doneAnswerColumns: uniqueAdd(state.doneAnswerColumns, step.columnIndex),
            stepComplete: true,
            attempts: 0,
            wrongInProblem,
            feedback: {
              kind: 'info',
              text: `Tidak apa-apa, kita coba bersama. Angka yang benar adalah ${step.expectedDigit}.`,
            },
          }
        }
        return {
          ...state,
          answers,
          attempts,
          wrongInProblem,
          feedback: { kind: 'wrong', text: digitHint(action.digit, step.expectedDigit, attempts) },
        }
      }
      if (step.kind === 'carry-digit') {
        const carries = [...state.carries]
        if (action.digit === step.expectedDigit) {
          carries[step.columnIndex] = action.digit
          return {
            ...state,
            carries,
            stepComplete: true,
            attempts: 0,
            feedback: { kind: 'correct', text: 'Bagus sekali! Simpanannya sudah benar.' },
            autoAdvanceToken: nextToken(),
          }
        }
        const attempts = state.attempts + 1
        const wrongInProblem = state.wrongInProblem + 1
        carries[step.columnIndex] = attempts >= 3 ? step.expectedDigit : null
        if (attempts >= 3) {
          return {
            ...state,
            carries,
            stepComplete: true,
            attempts: 0,
            wrongInProblem,
            feedback: {
              kind: 'info',
              text: `Tidak apa-apa. Angka simpan yang benar adalah ${step.expectedDigit}.`,
            },
          }
        }
        return {
          ...state,
          carries,
          attempts,
          wrongInProblem,
          feedback: { kind: 'wrong', text: digitHint(action.digit, step.expectedDigit, attempts) },
        }
      }
      return state
    }

    case 'backspace': {
      if (state.stepComplete) return state
      if (step.kind === 'interim-sum') {
        return { ...state, interim: state.interim.slice(0, -1) }
      }
      if (step.kind === 'answer-digit') {
        const answers = [...state.answers]
        answers[step.columnIndex] = null
        return { ...state, answers }
      }
      if (step.kind === 'carry-digit') {
        const carries = [...state.carries]
        carries[step.columnIndex] = null
        return { ...state, carries }
      }
      return state
    }

    case 'choose': {
      if (step.kind !== 'borrow-question' || state.stepComplete) return state
      if (action.answer === 'tidak-bisa') {
        return {
          ...state,
          stepComplete: true,
          attempts: 0,
          feedback: {
            kind: 'correct',
            text: `Betul! ${step.top} tidak cukup dikurangi ${step.bottom}, jadi kita perlu meminjam.`,
          },
          autoAdvanceToken: nextToken(),
        }
      }
      const attempts = state.attempts + 1
      const wrongInProblem = state.wrongInProblem + 1
      if (attempts >= 3) {
        return {
          ...state,
          stepComplete: true,
          attempts: 0,
          wrongInProblem,
          feedback: {
            kind: 'info',
            text: `${step.top} lebih kecil dari ${step.bottom}, jadi kita perlu meminjam. Ayo lanjut!`,
          },
        }
      }
      return {
        ...state,
        attempts,
        wrongInProblem,
        feedback: {
          kind: 'wrong',
          text: `Coba lihat sekali lagi. Mana yang lebih besar, ${step.top} atau ${step.bottom}?`,
        },
      }
    }

    case 'check-interim': {
      if (step.kind !== 'interim-sum' || state.stepComplete) return state
      const given = Number(state.interim)
      const sumText =
        step.carryIn > 0
          ? `${step.carryIn} + ${step.addendA} + ${step.addendB}`
          : `${step.addendA} + ${step.addendB}`
      if (state.interim !== '' && given === step.expected) {
        const text =
          step.expected >= 10
            ? `Bagus! Tulis ${step.expected % 10} di kotak jawaban, lalu simpan ${Math.floor(step.expected / 10)}.`
            : 'Bagus! Sekarang tulis hasilnya di kotak jawaban.'
        return {
          ...state,
          stepComplete: true,
          attempts: 0,
          feedback: { kind: 'correct', text },
          autoAdvanceToken: nextToken(),
        }
      }
      const attempts = state.attempts + 1
      const wrongInProblem = state.wrongInProblem + 1
      if (attempts >= 3) {
        return {
          ...state,
          interim: String(step.expected),
          stepComplete: true,
          attempts: 0,
          wrongInProblem,
          feedback: {
            kind: 'info',
            text: `Tidak apa-apa, kita coba bersama. ${sumText} = ${step.expected}.`,
          },
        }
      }
      const hint =
        state.interim === ''
          ? 'Isi dulu hasil hitungannya ya.'
          : `Belum tepat. ${sumText} bukan ${state.interim}. Coba hitung lagi ya!`
      return {
        ...state,
        interim: '',
        attempts,
        wrongInProblem,
        feedback: { kind: 'wrong', text: hint },
      }
    }

    case 'next': {
      if (!state.stepComplete) return state
      const steps = problem.learningSteps
      const nextIndex = state.stepIndex + 1
      if (nextIndex < steps.length) {
        const nextStep = steps[nextIndex]
        const updated: LearnState = {
          ...state,
          stepIndex: nextIndex,
          attempts: 0,
          interim: '',
          stepComplete: isAutoCompleteStep(nextStep),
          feedback: null,
          autoAdvanceToken: null,
        }
        if (nextStep.kind === 'borrow-explain') {
          const values = [...updated.borrowValues]
          for (const change of nextStep.changes) values[change.columnIndex] = change.after
          updated.borrowValues = values
        }
        if (nextStep.kind === 'review') {
          updated.answers = problem.columns.map((column) =>
            column.resultDigit === null ? null : Number(column.resultDigit),
          )
          updated.doneAnswerColumns = problem.columns
            .filter((column) => column.resultDigit !== null)
            .map((column) => column.index)
          // Review ikut auto-lanjut agar sesi selalu tuntas tercatat selesai
          // meski anak tidak menekan Berikutnya (mencegah level tidak tersimpan).
          updated.autoAdvanceToken = nextToken()
        }
        return updated
      }
      const results = [...state.results, { problem, wrongAttempts: state.wrongInProblem }]
      const nextProblemIndex = state.problemIndex + 1
      if (nextProblemIndex < state.problems.length) {
        const nextProblem = state.problems[nextProblemIndex]
        return {
          ...state,
          results,
          problemIndex: nextProblemIndex,
          stepIndex: 0,
          autoAdvanceToken: null,
          ...freshProblemState(nextProblem),
        }
      }
      return { ...state, results, finished: true, autoAdvanceToken: null }
    }

    case 'prev': {
      if (state.stepIndex === 0) return state
      return replayTo(state, state.stepIndex - 1)
    }

    case 'repeat': {
      const reset: LearnState = {
        ...state,
        attempts: 0,
        interim: '',
        feedback: null,
        stepComplete: isAutoCompleteStep(step),
        autoAdvanceToken: null,
      }
      if (step.kind === 'answer-digit') {
        const answers = [...state.answers]
        answers[step.columnIndex] = null
        reset.answers = answers
        reset.doneAnswerColumns = state.doneAnswerColumns.filter(
          (index) => index !== step.columnIndex,
        )
        reset.stepComplete = false
      }
      if (step.kind === 'carry-digit') {
        const carries = [...state.carries]
        carries[step.columnIndex] = null
        reset.carries = carries
        reset.stepComplete = false
      }
      return reset
    }

    default:
      return state
  }
}

export interface LearnScreenProps {
  levelId: string | null
  problems?: MathProblem[]
  initialStats?: SessionStats
  title?: string
}

export default function LearnScreen({
  levelId,
  problems: providedProblems,
  initialStats,
  title,
}: LearnScreenProps) {
  const { navigate, setLeaveGuard, confirmPendingNavigation, cancelPendingNavigation } =
    useNavigation()
  const { progress, recordAnswer, completeLevel, markLevelStarted } = useProgress()

  const [problems] = useState<MathProblem[]>(() => {
    if (providedProblems && providedProblems.length > 0) return providedProblems
    const level = levelId ? getLevel(levelId) : undefined
    if (!level) {
      return generateSession({
        operation: 'mixed',
        digitCount: 2,
        carryMode: 'any',
        questionCount: 5,
      })
    }
    const settings =
      level.id === 'tantangan' ? buildChallengeSettings(progress.practiceHistory) : level.settings
    return generateSession(settings)
  })

  const [state, dispatch] = useReducer(learnReducer, undefined, () => initState(problems))
  const reportedRef = useRef(false)

  const level = levelId ? getLevel(levelId) : undefined
  const screenTitle = title ?? level?.name ?? 'Belajar Langkah demi Langkah'
  const step = currentStepOf(state)
  const problem = state.problems[state.problemIndex]

  useEffect(() => {
    if (levelId) markLevelStarted(levelId)
  }, [levelId, markLevelStarted])

  // Guard keluar mid-session: selama sesi belum selesai, setiap usaha navigasi
  // (bottom-nav, header back, dsb.) membuka dialog konfirmasi dulu.
  const [exitDialogOpen, setExitDialogOpen] = useState(false)
  const openExitDialog = useCallback(() => setExitDialogOpen(true), [])
  useEffect(() => {
    if (state.finished) {
      setLeaveGuard(null)
      return
    }
    setLeaveGuard(openExitDialog)
    return () => setLeaveGuard(null)
  }, [state.finished, setLeaveGuard, openExitDialog])

  useEffect(() => {
    if (!state.feedback) return
    if (state.feedback.kind === 'correct') playCorrect()
    else if (state.feedback.kind === 'wrong') playWrong()
  }, [state.feedback])

  const isReview = step?.kind === 'review'
  useEffect(() => {
    if (isReview) playCelebrate()
  }, [isReview])

  // Auto-periksa Kotak Hitung begitu jumlah digit yang diketik pas
  // dengan panjang jawaban yang diharapkan (pola input OTP).
  const autoCheckedRef = useRef<string | null>(null)
  useEffect(() => {
    if (state.interim === '') {
      autoCheckedRef.current = null
      return
    }
    if (step?.kind !== 'interim-sum' || state.stepComplete) return
    if (state.interim.length !== String(step.expected).length) return
    if (autoCheckedRef.current === state.interim) return
    autoCheckedRef.current = state.interim
    dispatch({ type: 'check-interim' })
  }, [state.interim, state.stepComplete, step])

  // Auto-lanjut ke langkah berikutnya segera setelah jawaban benar,
  // agar anak cukup mengetik tanpa menekan Periksa lalu Berikutnya.
  useEffect(() => {
    if (state.autoAdvanceToken === null) return
    const timer = window.setTimeout(() => dispatch({ type: 'next' }), 700)
    return () => window.clearTimeout(timer)
  }, [state.autoAdvanceToken])

  useEffect(() => {
    if (!state.finished || reportedRef.current) return
    reportedRef.current = true

    const base: SessionStats = initialStats ?? {
      correctFirstTry: 0,
      wrongAttempts: 0,
      recovered: 0,
      totalDone: 0,
    }
    const correctFirstTry =
      base.correctFirstTry + state.results.filter((r) => r.wrongAttempts === 0).length
    const wrongAttempts =
      base.wrongAttempts + state.results.reduce((sum, r) => sum + r.wrongAttempts, 0)
    const recovered = base.recovered + state.results.filter((r) => r.wrongAttempts > 0).length
    const totalQuestions = base.totalDone + state.problems.length
    const stars = starsFor(correctFirstTry, totalQuestions)

    const newAchievementIds: string[] = []
    for (const result of state.results) {
      newAchievementIds.push(
        ...recordAnswer({ problem: result.problem, wrongAttempts: result.wrongAttempts }).map(
          (a) => a.id,
        ),
      )
    }
    if (levelId) {
      newAchievementIds.push(...completeLevel(levelId, stars).map((a) => a.id))
    }

    const summary: SessionSummary = {
      title: screenTitle,
      totalQuestions,
      correctFirstTry,
      wrongAttempts,
      recovered,
      stars,
      levelId,
      settings: level ? level.settings : null,
      nextLevelId: getNextLevelId(levelId),
      newAchievementIds: [...new Set(newAchievementIds)],
    }
    // Navigasi programatik ke result tidak boleh terbentur leave-guard
    setLeaveGuard(null)
    navigate({ name: 'result', summary })
  }, [
    state.finished,
    state.results,
    state.problems,
    initialStats,
    levelId,
    screenTitle,
    level,
    recordAnswer,
    completeLevel,
    setLeaveGuard,
    navigate,
  ])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return
      const target = event.target as HTMLElement | null
      if (target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA') return
      if (/^[0-9]$/.test(event.key)) {
        event.preventDefault()
        dispatch({ type: 'digit', digit: Number(event.key) })
      } else if (event.key === 'Backspace') {
        event.preventDefault()
        dispatch({ type: 'backspace' })
      } else if (event.key === 'Enter') {
        if (target?.tagName === 'BUTTON') return
        event.preventDefault()
        if (state.stepComplete) dispatch({ type: 'next' })
        else if (step?.kind === 'interim-sum') dispatch({ type: 'check-interim' })
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [state.stepComplete, step])

  if (state.finished || !problem) {
    return (
      <div className="animate-pop-in flex flex-col items-center gap-4 py-10 text-center">
        <Mascot mood="cheer" size={96} className="animate-celebrate" />
        <h2 className="text-2xl font-black text-slate-800">Selesai! Kamu hebat! 🎉</h2>
        <p className="text-sm font-bold text-slate-500">Menyiapkan hasil latihan…</p>
      </div>
    )
  }

  const activeCell =
    step?.kind === 'answer-digit'
      ? { kind: 'answer' as const, columnIndex: step.columnIndex }
      : step?.kind === 'carry-digit'
        ? { kind: 'carry' as const, columnIndex: step.columnIndex }
        : null
  const highlightColumn = step && 'columnIndex' in step ? step.columnIndex : null
  const mood =
    isReview || state.feedback?.kind === 'correct'
      ? 'cheer'
      : step?.kind === 'borrow-explain'
        ? 'think'
        : 'happy'
  const interim =
    step?.kind === 'interim-sum' ? { value: state.interim, active: !state.stepComplete } : null
  const choice =
    step?.kind === 'borrow-question' && !state.stepComplete
      ? {
          onChoose: (answer: 'bisa' | 'tidak-bisa') => dispatch({ type: 'choose', answer }),
          disabled: false,
        }
      : null
  // Tombol Periksa hanya aktif saat memeriksa isi Kotak Hitung;
  // untuk lanjut langkah selalu lewat tombol Berikutnya agar label
  // tidak pernah bertentangan dengan instruksi.
  const canCheck = step?.kind === 'interim-sum' && !state.stepComplete && state.interim !== ''
  // Tombol angka hanya aktif pada langkah yang memang menerima input angka
  const acceptsDigits =
    !state.stepComplete &&
    (step?.kind === 'interim-sum' || step?.kind === 'answer-digit' || step?.kind === 'carry-digit')

  const onCheck = () => {
    if (canCheck) {
      dispatch({ type: 'check-interim' })
    }
  }

  return (
    <div className="solve-split">
      <section aria-label="Progres sesi" className="solve-progress space-y-1.5">
        <div className="flex items-baseline justify-between">
          <h1 className="text-base font-black text-slate-800 md:text-lg">{screenTitle}</h1>
          <p className="text-xs font-bold text-slate-500">
            Soal {state.problemIndex + 1} dari {state.problems.length}
          </p>
        </div>
        <ProgressBar
          value={
            (state.problemIndex + (state.stepIndex + 1) / problem.learningSteps.length) /
            state.problems.length
          }
          label={`Progres belajar, soal ${state.problemIndex + 1} dari ${state.problems.length}`}
        />
      </section>

      <div className="solve-main flex justify-center rounded-3xl border-2 border-sky-100 bg-white p-3 shadow-sm md:p-5">
        <VerticalMathProblem
          problem={problem}
          answers={state.answers}
          carries={state.carries}
          activeCell={activeCell}
          doneAnswerColumns={state.doneAnswerColumns}
          borrowValues={state.borrowValues}
          highlightColumn={highlightColumn}
        />
      </div>

      <div className="solve-feedback">
        <FeedbackMessage feedback={state.feedback} />
      </div>

      <div className="solve-guide">
        <StepGuide
          instruction={step?.instruction ?? ''}
          mood={mood}
          interim={interim}
          choice={choice}
          canGoBack={state.stepIndex > 0}
          canGoNext={state.stepComplete}
          pulseNext={step?.kind === 'intro' || state.stepComplete}
          onBack={() => dispatch({ type: 'prev' })}
          onRepeat={() => dispatch({ type: 'repeat' })}
          onNext={() => dispatch({ type: 'next' })}
        />
      </div>

      <div className="solve-side">
        <NumericKeypad
          onDigit={(digit) => dispatch({ type: 'digit', digit })}
          onBackspace={() => dispatch({ type: 'backspace' })}
          onCheck={onCheck}
          checkDisabled={!canCheck}
          checkLabel="Periksa"
          digitsDisabled={!acceptsDigits}
        />
      </div>

      <ConfirmDialog
        open={exitDialogOpen}
        title="Keluar dari level?"
        description="Level ini belum selesai, jadi progresnya belum tersimpan. Yuk lanjut supaya levelnya terbuka!"
        confirmLabel="Ya, Keluar"
        cancelLabel="Lanjut Belajar"
        danger
        onConfirm={() => {
          setExitDialogOpen(false)
          confirmPendingNavigation()
        }}
        onCancel={() => {
          setExitDialogOpen(false)
          cancelPendingNavigation()
        }}
      />
    </div>
  )
}
