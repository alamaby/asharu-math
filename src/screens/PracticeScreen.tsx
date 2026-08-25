import { useEffect, useRef, useState } from 'react'
import FeedbackMessage, { type Feedback } from '../components/guide/FeedbackMessage'
import HintPanel from '../components/guide/HintPanel'
import ProgressBar from '../components/guide/ProgressBar'
import MascotBubble from '../components/layout/MascotBubble'
import NumericKeypad from '../components/input/NumericKeypad'
import VerticalMathProblem from '../components/math/VerticalMathProblem'
import { buildProblem, generateSession } from '../lib/problemGenerator'
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
  SessionSummary,
} from '../types'

const PRAISES = ['Benar! Hebat!', 'Bagus sekali!', 'Kamu berhasil!', 'Luar biasa!']

interface ProblemResult {
  problem: MathProblem
  wrongAttempts: number
}

interface SessionState {
  problems: MathProblem[]
  index: number
  title: string
  settings: GeneratorSettings | null
  given: (number | null)[]
  activeCol: number
  wrongCols: number[]
  attempts: number
  wrongInProblem: number
  feedback: Feedback | null
  hint: string | null
  offerHelp: boolean
  locked: boolean
  results: ProblemResult[]
}

function startSession(
  problems: MathProblem[],
  settings: GeneratorSettings | null,
  title: string,
): SessionState {
  const required = requiredAnswerColumnIndexes(problems[0])
  return {
    problems,
    index: 0,
    title,
    settings,
    given: new Array<number | null>(problems[0].columns.length).fill(null),
    activeCol: required[required.length - 1],
    wrongCols: [],
    attempts: 0,
    wrongInProblem: 0,
    feedback: null,
    hint: null,
    offerHelp: false,
    locked: false,
    results: [],
  }
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

export interface PracticeScreenProps {
  settings?: GeneratorSettings
}

export default function PracticeScreen({ settings: initialSettings }: PracticeScreenProps) {
  const { navigate } = useNavigation()
  const { recordAnswer } = useProgress()

  const [phase, setPhase] = useState<'setup' | 'solving'>(initialSettings ? 'solving' : 'setup')
  const [session, setSession] = useState<SessionState | null>(() =>
    initialSettings
      ? startSession(generateSession(initialSettings), initialSettings, 'Latihan Soal')
      : null,
  )

  const [formOperation, setFormOperation] = useState<OperationChoice>('addition')
  const [formDigits, setFormDigits] = useState<DigitCount>(2)
  const [formCount, setFormCount] = useState(5)
  const [formCarry, setFormCarry] = useState<CarryMode>('any')

  const [customFirst, setCustomFirst] = useState('26')
  const [customSecond, setCustomSecond] = useState('87')
  const [customOperation, setCustomOperation] = useState<OperationType>('addition')
  const [customError, setCustomError] = useState<string | null>(null)

  const timeoutRef = useRef<number | null>(null)
  useEffect(() => {
    return () => {
      if (timeoutRef.current !== null) window.clearTimeout(timeoutRef.current)
    }
  }, [])

  const problem = session?.problems[session.index]

  const updateSession = (patch: Partial<SessionState>) => {
    setSession((current) => (current ? { ...current, ...patch } : current))
  }

  const startConfigured = () => {
    const settings: GeneratorSettings = {
      operation: formOperation,
      digitCount: formDigits,
      carryMode: formCarry,
      questionCount: formCount,
    }
    setSession(startSession(generateSession(settings), settings, 'Latihan Soal'))
    setPhase('solving')
  }

  const startCustom = () => {
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
    setSession(startSession([problem], null, 'Soal Buatan Sendiri'))
    setPhase('solving')
  }

  const finishSession = (finished: SessionState) => {
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
  }

  const finishProblem = (current: SessionState) => {
    const results = [
      ...current.results,
      { problem: current.problems[current.index], wrongAttempts: current.wrongInProblem },
    ]
    if (current.index + 1 < current.problems.length) {
      const nextProblem = current.problems[current.index + 1]
      const width = nextProblem.columns.length
      const required = requiredAnswerColumnIndexes(nextProblem)
      setSession({
        ...current,
        results,
        index: current.index + 1,
        given: new Array<number | null>(width).fill(null),
        activeCol: required[required.length - 1],
        wrongCols: [],
        attempts: 0,
        wrongInProblem: 0,
        feedback: { kind: 'info', text: 'Bagus! Lanjut ke soal berikutnya!' },
        hint: null,
        offerHelp: false,
        locked: false,
      })
    } else {
      finishSession({ ...current, results })
    }
  }

  const handleCheck = () => {
    if (!session || session.locked || !problem) return
    const required = requiredAnswerColumnIndexes(problem)
    if (required.some((columnIndex) => session.given[columnIndex] === null)) return

    const result = checkAnswerDigits(problem, session.given)
    if (result.allCorrect) {
      playCorrect()
      const praise = PRAISES[Math.floor(Math.random() * PRAISES.length)]
      updateSession({
        locked: true,
        feedback: { kind: 'correct', text: praise },
        hint: null,
        wrongCols: [],
      })
      const snapshot = session
      timeoutRef.current = window.setTimeout(() => finishProblem(snapshot), 1000)
      return
    }
    playWrong()
    const attempts = session.attempts + 1
    updateSession({
      locked: true,
      attempts,
      wrongCols: result.wrongColumnIndexes,
      wrongInProblem: session.wrongInProblem + 1,
      feedback: { kind: 'wrong', text: 'Belum tepat. Lihat petunjuk di bawah ya.' },
      hint: getHint(problem, attempts, result.wrongColumnIndexes),
      offerHelp: shouldOfferGuidedMode(attempts),
    })
    timeoutRef.current = window.setTimeout(() => updateSession({ locked: false }), 700)
  }

  const handleDigit = (digit: number) => {
    if (!session || session.locked || !problem) return
    const required = requiredAnswerColumnIndexes(problem)
    const given = [...session.given]
    given[session.activeCol] = digit
    // Lanjut otomatis ke kolom wajib yang masih kosong di sebelah kiri
    const orderedDescending = [...required].sort((a, b) => b - a)
    const currentPos = orderedDescending.indexOf(session.activeCol)
    let nextCol = session.activeCol
    for (let i = currentPos - 1; i >= 0; i--) {
      if (given[orderedDescending[i]] === null) {
        nextCol = orderedDescending[i]
        break
      }
    }
    if (nextCol === session.activeCol) {
      for (const columnIndex of orderedDescending) {
        if (given[columnIndex] === null) {
          nextCol = columnIndex
          break
        }
      }
    }
    updateSession({ given, activeCol: nextCol, feedback: null, hint: null })
  }

  const handleBackspace = () => {
    if (!session || session.locked) return
    const given = [...session.given]
    given[session.activeCol] = null
    updateSession({ given })
  }

  const switchToGuided = () => {
    if (!session || !problem) return
    const remaining = session.problems.slice(session.index)
    const initialStats = {
      correctFirstTry: session.results.filter((r) => r.wrongAttempts === 0).length,
      wrongAttempts:
        session.results.reduce((sum, r) => sum + r.wrongAttempts, 0) + session.wrongInProblem,
      recovered: session.results.filter((r) => r.wrongAttempts > 0).length,
      totalDone: session.results.length,
    }
    navigate({
      name: 'learn',
      levelId: null,
      problems: remaining,
      initialStats,
      title: session.title,
    })
  }

  if (phase === 'setup' || !session || !problem) {
    return (
      <div className="space-y-5">
        <MascotBubble
          text="Mau latihan apa hari ini? Pilih jenis soalnya, atau buat soalmu sendiri!"
          mood="happy"
        />

        <section className="space-y-4 rounded-3xl border-2 border-sky-100 bg-white p-4 shadow-sm md:p-5">
          <h2 className="text-base font-black text-slate-800">Pengaturan Latihan</h2>
          <OptionGroup
            label="Jenis soal"
            value={formOperation}
            onChange={setFormOperation}
            options={[
              { value: 'addition', label: 'Penjumlahan saja' },
              { value: 'subtraction', label: 'Pengurangan saja' },
              { value: 'mixed', label: 'Campuran' },
            ]}
          />
          <OptionGroup
            label="Jumlah digit"
            value={formDigits}
            onChange={setFormDigits}
            options={[
              { value: 2, label: '2 digit' },
              { value: 3, label: '3 digit' },
              { value: 4, label: '4 digit' },
            ]}
          />
          <OptionGroup
            label="Jumlah soal"
            value={formCount}
            onChange={setFormCount}
            options={[
              { value: 5, label: '5 soal' },
              { value: 10, label: '10 soal' },
              { value: 15, label: '15 soal' },
              { value: 20, label: '20 soal' },
            ]}
          />
          <OptionGroup
            label="Kesulitan"
            value={formCarry}
            onChange={setFormCarry}
            options={[
              { value: 'none', label: 'Tanpa menyimpan / meminjam' },
              { value: 'required', label: 'Dengan menyimpan / meminjam' },
              { value: 'any', label: 'Campuran' },
            ]}
          />
          <button
            type="button"
            onClick={startConfigured}
            className="min-h-12 w-full rounded-2xl border-b-4 border-sky-600 bg-sky-500 text-base font-black text-white hover:bg-sky-400 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-300"
          >
            Mulai Latihan
          </button>
        </section>

        <section className="space-y-4 rounded-3xl border-2 border-amber-200 bg-amber-50 p-4 shadow-sm md:p-5">
          <h2 className="text-base font-black text-amber-900">Buat Soal Sendiri ✏️</h2>
          <p className="text-sm font-semibold text-amber-800">
            Ketik dua angka (maksimal 4 digit), lalu kerjakan bersusun di sini!
          </p>
          <div className="flex flex-wrap items-end gap-3">
            <label className="flex flex-col gap-1 text-xs font-bold text-amber-900">
              Angka atas
              <input
                value={customFirst}
                onChange={(event) =>
                  setCustomFirst(event.target.value.replace(/[^0-9]/g, '').slice(0, 4))
                }
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={4}
                placeholder="26"
                aria-label="Angka atas untuk soal buatan sendiri"
                className="h-12 w-24 rounded-xl border-2 border-amber-300 bg-white px-3 text-xl font-extrabold tabular-nums text-slate-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-amber-200"
              />
            </label>
            <label className="flex flex-col gap-1 text-xs font-bold text-amber-900">
              Angka bawah
              <input
                value={customSecond}
                onChange={(event) =>
                  setCustomSecond(event.target.value.replace(/[^0-9]/g, '').slice(0, 4))
                }
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={4}
                placeholder="87"
                aria-label="Angka bawah untuk soal buatan sendiri"
                className="h-12 w-24 rounded-xl border-2 border-amber-300 bg-white px-3 text-xl font-extrabold tabular-nums text-slate-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-amber-200"
              />
            </label>
            <div className="flex gap-2" role="group" aria-label="Pilih operasi">
              {(
                [
                  { value: 'addition', label: '+ Tambah' },
                  { value: 'subtraction', label: '− Kurang' },
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
            onClick={startCustom}
            className="min-h-12 w-full rounded-2xl border-b-4 border-amber-500 bg-amber-400 text-base font-black text-amber-950 hover:bg-amber-300 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-amber-200"
          >
            Kerjakan Soal Ini
          </button>
        </section>
      </div>
    )
  }

  const required = requiredAnswerColumnIndexes(problem)
  const checkDisabled =
    session.locked || required.some((columnIndex) => session.given[columnIndex] === null)

  return (
    <div className="solve-split">
      <section aria-label="Progres latihan" className="solve-progress space-y-1.5">
        <div className="flex items-baseline justify-between">
          <h1 className="text-base font-black text-slate-800 md:text-lg">{session.title}</h1>
          <p className="text-xs font-bold text-slate-500">
            Soal {session.index + 1} dari {session.problems.length}
          </p>
        </div>
        <ProgressBar value={session.index / session.problems.length} label={`Progres latihan`} />
      </section>

      <div className="solve-main flex justify-center rounded-3xl border-2 border-sky-100 bg-white p-3 shadow-sm md:p-5">
        <VerticalMathProblem
          problem={problem}
          answers={session.given}
          activeCell={{ kind: 'answer', columnIndex: session.activeCol }}
          wrongAnswerColumns={session.wrongCols}
          onSelectAnswerCell={(columnIndex) => updateSession({ activeCol: columnIndex })}
        />
      </div>

      <div className="solve-feedback space-y-3">
        <FeedbackMessage feedback={session.feedback} />
        <HintPanel hint={session.hint} />

        {session.offerHelp && (
          <div className="animate-rise rounded-3xl border-2 border-violet-200 bg-violet-50 p-4">
            <p className="text-sm font-bold text-violet-800">
              Mau belajar soal ini langkah demi langkah bersama Asya?
            </p>
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={switchToGuided}
                className="min-h-11 flex-1 rounded-2xl border-b-4 border-violet-600 bg-violet-500 text-sm font-bold text-white hover:bg-violet-400 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-violet-300"
              >
                Ya, ayo belajar!
              </button>
              <button
                type="button"
                onClick={() => updateSession({ offerHelp: false })}
                className="min-h-11 flex-1 rounded-2xl border-2 border-violet-200 bg-white text-sm font-bold text-violet-700 hover:bg-violet-100 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-violet-300"
              >
                Lanjut coba sendiri
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
          checkLabel="Periksa"
        />
        <p className="text-center text-xs font-bold text-slate-400">
          Ketuk kotak jawaban untuk memilih kolom. Isi dari kanan (satuan) dulu ya!
        </p>
      </div>
    </div>
  )
}
