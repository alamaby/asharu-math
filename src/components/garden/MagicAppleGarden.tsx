import { useEffect, useRef, useState, useCallback } from 'react'
import type { MathProblem } from '../../types'
import GardenScene from './GardenScene'
import StackedOperation from './StackedOperation'
import GardenFeedbackPanel from './GardenFeedbackPanel'
import GardenControls from './GardenControls'
import GardenProgress from './GardenProgress'
import PlaceValueBoard from './PlaceValueBoard'
import NumericKeypad from '../input/NumericKeypad'
import { useI18n } from '../../i18n/LanguageContext'
import { useProgress } from '../../state/ProgressContext'
import {
  splitTensOnes,
  needsCarry,
  needsBorrow,
  isCorrectOnesAnswer,
  isCorrectTensAnswer,
} from '../../lib/placeValueMath'
import {
  speak,
  repeatLastNarration,
  stopAllAudio,
  playPickApple,
  playPutToBasket,
  playOpenBasket,
  playReward,
  playTryAgain,
} from '../../lib/gardenSound'
import { playTap } from '../../lib/sound'

type GardenPhase =
  | 'intro'
  | 'showQuestion'
  | 'countOnes'
  | 'exchangeOrRegroup'
  | 'enterOnesAnswer'
  | 'countTens'
  | 'enterTensAnswer'
  | 'checkAnswer'
  | 'feedback'
  | 'completed'

interface MagicAppleGardenProps {
  problem: MathProblem
  currentIndex: number
  total: number
  onComplete: (correctFirstTry: boolean, wrongAttempts: number) => void
  onNextProblem?: () => void
}

export default function MagicAppleGarden({
  problem,
  currentIndex,
  total,
  onComplete,
}: MagicAppleGardenProps) {
  const { t } = useI18n()
  const { progress } = useProgress()
  const soundEnabled = progress.soundEnabled

  const isAdd = problem.operation === 'addition'
  const top = problem.firstOperand
  const bottom = problem.secondOperand
  const carryNeeded = isAdd && needsCarry(top, bottom)
  const borrowNeeded = !isAdd && needsBorrow(top, bottom)

  const topSplit = splitTensOnes(top)
  const botSplit = splitTensOnes(bottom)

  // Visual state
  const initialTens = isAdd ? topSplit.tens + botSplit.tens : topSplit.tens
  const initialOnes = isAdd ? topSplit.ones + botSplit.ones : topSplit.ones
  const afterTens =
    isAdd && carryNeeded ? initialTens + 1 : !isAdd && borrowNeeded ? initialTens - 1 : initialTens
  const afterOnes =
    isAdd && carryNeeded
      ? initialOnes - 10
      : !isAdd && borrowNeeded
        ? initialOnes + 10
        : initialOnes

  const [visualTens, setVisualTens] = useState(initialTens)
  const [visualOnes, setVisualOnes] = useState(initialOnes)
  const [exchanged, setExchanged] = useState(false)
  const [opened, setOpened] = useState(false)
  const [phase, setPhase] = useState<GardenPhase>('intro')
  const [onesAnswer, setOnesAnswer] = useState<number | null>(null)
  const [tensAnswer, setTensAnswer] = useState<number | null>(null)
  const [activeColumn, setActiveColumn] = useState<'ones' | 'tens' | null>('ones')
  const [feedback, setFeedback] = useState<{
    kind: 'correct' | 'wrong' | 'info'
    text: string
  } | null>(null)
  const [highlight, setHighlight] = useState<'tens' | 'ones' | null>('ones')
  const [animating, setAnimating] = useState(false)
  const [wrongAttempts, setWrongAttempts] = useState(0)
  const [wrongOnes, setWrongOnes] = useState(false)
  const [wrongTens, setWrongTens] = useState(false)
  const [hasCheckedOnce, setHasCheckedOnce] = useState(false)

  const timersRef = useRef<number[]>([])
  const prefersReducedMotion = useRef(false)

  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      prefersReducedMotion.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    }
  }, [])

  const clearTimers = useCallback(() => {
    for (const id of timersRef.current) window.clearTimeout(id)
    timersRef.current = []
  }, [])

  useEffect(() => {
    return () => {
      clearTimers()
      stopAllAudio()
    }
  }, [clearTimers])

  // Reset when problem changes — keyed by problem.id, also handles normal phase flow
  useEffect(() => {
    const id = window.setTimeout(() => {
      setVisualTens(initialTens)
      setVisualOnes(initialOnes)
      setExchanged(false)
      setOpened(false)
      setPhase('intro')
      setOnesAnswer(null)
      setTensAnswer(null)
      setActiveColumn('ones')
      setFeedback(null)
      setHighlight('ones')
      setAnimating(false)
      setWrongAttempts(0)
      setWrongOnes(false)
      setWrongTens(false)
      setHasCheckedOnce(false)
      clearTimers()
      stopAllAudio()
    }, 0)
    timersRef.current.push(id)
  }, [problem.id, initialTens, initialOnes, clearTimers])

  const narrate = useCallback(
    (text: string) => {
      speak(text, soundEnabled)
    },
    [soundEnabled],
  )

  // Intro narration
  useEffect(() => {
    if (phase !== 'intro') return
    const text = t('garden.startUnit')
    narrate(text)
    // feedback & phase transition scheduled async to avoid sync setState in effect
    const fbId = window.setTimeout(() => setFeedback({ kind: 'info', text }), 0)
    const id = window.setTimeout(() => setPhase('showQuestion'), 600)
    timersRef.current.push(fbId, id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase])

  useEffect(() => {
    if (phase !== 'showQuestion') return
    const schedule = (fn: () => void) => {
      const id = window.setTimeout(fn, 0)
      timersRef.current.push(id)
    }
    schedule(() => setHighlight('ones'))
    if (isAdd && carryNeeded) {
      const text = t('garden.combineHint')
      schedule(() => setFeedback({ kind: 'info', text }))
      narrate(text)
      schedule(() => setPhase('countOnes'))
    } else if (!isAdd && borrowNeeded) {
      const text = t('garden.notEnough')
      schedule(() => setFeedback({ kind: 'info', text }))
      narrate(text)
      schedule(() => setPhase('exchangeOrRegroup'))
    } else {
      schedule(() => setPhase('enterOnesAnswer'))
      schedule(() => setHighlight('ones'))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase])

  const doExchange = useCallback(() => {
    if (animating || exchanged) return
    setAnimating(true)
    playPutToBasket()
    narrate(t('garden.tenToBasket'))
    setFeedback({ kind: 'info', text: t('garden.tenToBasket') })
    const duration = prefersReducedMotion.current ? 50 : 700
    const id = window.setTimeout(() => {
      setVisualTens(afterTens)
      setVisualOnes(afterOnes)
      setExchanged(true)
      setAnimating(false)
      setPhase('enterOnesAnswer')
      setHighlight('ones')
      setFeedback({ kind: 'info', text: t('garden.enterOnes') })
    }, duration)
    timersRef.current.push(id)
  }, [animating, exchanged, afterTens, afterOnes, narrate, t])

  const doOpen = useCallback(() => {
    if (animating || opened) return
    setAnimating(true)
    playOpenBasket()
    narrate(t('garden.openBasket'))
    setFeedback({ kind: 'info', text: t('garden.openBasket') })
    const duration = prefersReducedMotion.current ? 50 : 700
    const id = window.setTimeout(() => {
      setVisualTens(afterTens)
      setVisualOnes(afterOnes)
      setOpened(true)
      setAnimating(false)
      setPhase('enterOnesAnswer')
      setHighlight('ones')
      setFeedback({ kind: 'info', text: t('garden.enterOnes') })
    }, duration)
    timersRef.current.push(id)
  }, [animating, opened, afterTens, afterOnes, narrate, t])

  const handleHint = () => {
    playTap()
    if (phase === 'enterOnesAnswer' || phase === 'countOnes') {
      const text = t('garden.hintOnes')
      setFeedback({ kind: 'info', text })
      narrate(text)
      setHighlight('ones')
    } else if (phase === 'enterTensAnswer' || phase === 'countTens') {
      const text = t('garden.hintTens')
      setFeedback({ kind: 'info', text })
      narrate(text)
      setHighlight('tens')
    } else if (!isAdd && borrowNeeded && !opened) {
      const text = t('garden.notEnough')
      setFeedback({ kind: 'info', text })
      narrate(text)
    } else if (isAdd && carryNeeded && !exchanged) {
      const text = t('garden.tenToBasket')
      setFeedback({ kind: 'info', text })
      narrate(text)
    } else {
      setFeedback({ kind: 'info', text: t('garden.tryAgain') })
      narrate(t('garden.tryAgain'))
    }
  }

  const handleRepeat = () => {
    playTap()
    repeatLastNarration(soundEnabled)
  }

  const handleCheck = () => {
    if (animating) return
    if (onesAnswer === null || tensAnswer === null) {
      const text = onesAnswer === null ? t('garden.enterOnes') : t('garden.enterTens')
      setFeedback({ kind: 'wrong', text })
      narrate(text)
      setHighlight(onesAnswer === null ? 'ones' : 'tens')
      return
    }
    const onesOk = isCorrectOnesAnswer(top, bottom, problem.operation, onesAnswer)
    const tensOk = isCorrectTensAnswer(top, bottom, problem.operation, tensAnswer)
    if (onesOk && tensOk) {
      if (hasCheckedOnce) return // idempoten: jangan gandakan reward
      setHasCheckedOnce(true)
      setWrongOnes(false)
      setWrongTens(false)
      const successText =
        isAdd && carryNeeded
          ? t('garden.successCarry')
          : !isAdd && borrowNeeded
            ? t('garden.successBorrow')
            : t('garden.correctGeneral')
      setFeedback({ kind: 'correct', text: successText })
      narrate(successText)
      playReward()
      setPhase('completed')
      // beri jeda lalu notify parent
      const id = window.setTimeout(() => {
        onComplete(wrongAttempts === 0, wrongAttempts)
      }, 800)
      timersRef.current.push(id)
    } else {
      // belum tepat — jangan tampilkan silang besar, hanya sorot kolom
      setWrongOnes(!onesOk)
      setWrongTens(!tensOk)
      const attempts = wrongAttempts + 1
      setWrongAttempts(attempts)
      playTryAgain()
      const text = !onesOk ? t('garden.hintOnes') : t('garden.hintTens')
      setFeedback({ kind: 'wrong', text: t('garden.tryAgain') + ' ' + text })
      narrate(t('garden.tryAgain'))
      setHighlight(!onesOk ? 'ones' : 'tens')
      // jangan reset visual — biarkan anak hitung kembali
      // batasi hint satu langkah
    }
  }

  const handleReset = () => {
    playTap()
    clearTimers()
    stopAllAudio()
    setVisualTens(initialTens)
    setVisualOnes(initialOnes)
    setExchanged(false)
    setOpened(false)
    setOnesAnswer(null)
    setTensAnswer(null)
    setActiveColumn('ones')
    setFeedback(null)
    setHighlight('ones')
    setAnimating(false)
    setWrongAttempts(0)
    setWrongOnes(false)
    setWrongTens(false)
    setHasCheckedOnce(false)
    setPhase('showQuestion')
  }

  const handleDigit = (digit: number) => {
    playTap()
    if (activeColumn === 'ones') {
      setOnesAnswer(digit)
      setWrongOnes(false)
      // auto pindah ke puluhan setelah isi satuan
      setActiveColumn('tens')
      setHighlight('tens')
    } else if (activeColumn === 'tens') {
      setTensAnswer(digit)
      setWrongTens(false)
    }
  }

  const handleBackspace = () => {
    playTap()
    if (activeColumn === 'tens' && tensAnswer !== null) {
      setTensAnswer(null)
    } else if (activeColumn === 'ones' && onesAnswer !== null) {
      setOnesAnswer(null)
    } else if (activeColumn === 'tens' && tensAnswer === null) {
      setActiveColumn('ones')
      setOnesAnswer(null)
    }
  }

  const carryShown = isAdd && carryNeeded && exchanged
  const borrowShown = !isAdd && borrowNeeded && opened

  const canCheck =
    onesAnswer !== null &&
    tensAnswer !== null &&
    !animating &&
    phase !== 'completed' &&
    phase !== 'intro'
  const isCompleted = phase === 'completed'

  return (
    <div className="space-y-4">
      <GardenProgress current={currentIndex + 1} total={total} />
      {/* Subtitle + SOAL bersusun: papan harus tetap terlihat di layar kecil */}
      <div className="rounded-3xl border-2 border-emerald-100 bg-white p-3 text-center shadow-sm">
        <h2 className="text-base font-black text-emerald-800">{t('garden.title')}</h2>
        <p className="text-xs font-bold text-slate-500">{t('garden.subtitle')}</p>
      </div>

      <div className="flex justify-center">
        <StackedOperation
          problem={problem}
          onesAnswer={onesAnswer}
          tensAnswer={tensAnswer}
          activeColumn={activeColumn}
          carryShown={carryShown}
          borrowShown={borrowShown}
          highlightColumn={highlight}
          onSelectOnes={() => {
            setActiveColumn('ones')
            setHighlight('ones')
            playTap()
          }}
          onSelectTens={() => {
            setActiveColumn('tens')
            setHighlight('tens')
            playTap()
          }}
          wrongOnes={wrongOnes}
          wrongTens={wrongTens}
        />
      </div>

      <PlaceValueBoard tens={visualTens} ones={visualOnes} highlight={highlight} />

      <GardenScene
        tens={visualTens}
        ones={visualOnes}
        highlight={highlight}
        disabled={animating || isCompleted}
        animating={animating}
        onBasketClick={() => {
          playPickApple()
          if (!isAdd && borrowNeeded && !opened) doOpen()
        }}
        onAppleClick={() => playPickApple()}
      />

      {/* Aksi pertukaran — sinkron dengan angka bersusun */}
      <div className="flex flex-wrap gap-2">
        {isAdd && carryNeeded && !exchanged && phase !== 'intro' && (
          <button
            type="button"
            onClick={doExchange}
            disabled={animating}
            className="min-h-11 rounded-2xl border-b-4 border-amber-500 bg-amber-400 px-4 text-sm font-black text-white hover:bg-amber-300 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-amber-200 disabled:opacity-40"
            aria-label={t('garden.exchangeAction')}
          >
            {t('garden.exchangeAction')} (10 → 1)
          </button>
        )}
        {!isAdd && borrowNeeded && !opened && (
          <button
            type="button"
            onClick={doOpen}
            disabled={animating}
            className="min-h-11 rounded-2xl border-b-4 border-emerald-600 bg-emerald-500 px-4 text-sm font-black text-white hover:bg-emerald-400 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-300 disabled:opacity-40"
            aria-label={t('garden.openAction')}
          >
            {t('garden.openAction')} (1 → 10)
          </button>
        )}
      </div>

      <GardenFeedbackPanel
        kind={feedback?.kind ?? null}
        text={feedback?.text ?? null}
        highlightColumn={highlight}
      />

      {isCompleted && (
        <div className="animate-pop-in rounded-3xl border-2 border-emerald-200 bg-emerald-50 p-4 text-center shadow-sm">
          <p className="text-lg font-black text-emerald-800">
            {t('garden.correctGeneral')} — {top} {isAdd ? '+' : '−'} {bottom} ={' '}
            {problem.expectedResult}
          </p>
          <p className="mt-1 text-sm font-bold text-emerald-700">
            {isAdd && carryNeeded
              ? t('garden.successCarry')
              : !isAdd && borrowNeeded
                ? t('garden.successBorrow')
                : ''}
          </p>
          <p aria-hidden="true" className="mt-2 text-2xl">
            🌸 ⭐ 🌿 ⭐ 🌸
          </p>
        </div>
      )}

      {/* Keypad: besar untuk touch, keyboard & click alternatif untuk drag */}
      <div className="rounded-3xl border-2 border-slate-100 bg-white p-3 shadow-sm">
        <p className="mb-2 text-center text-xs font-black uppercase tracking-wide text-slate-500">
          {activeColumn === 'ones' ? t('garden.enterOnes') : t('garden.enterTens')} · ketuk kotak
          jawaban untuk ganti kolom
        </p>
        <NumericKeypad
          onDigit={handleDigit}
          onBackspace={handleBackspace}
          onCheck={handleCheck}
          checkDisabled={!canCheck}
          checkLabel={t('garden.check')}
          digitsDisabled={animating || isCompleted}
        />
        <p className="mt-2 text-center text-[0.65rem] font-bold text-slate-400">
          Alternatif drag: ketuk keranjang/apel juga bisa — tidak wajib menyeret.
        </p>
      </div>

      <GardenControls
        onHint={handleHint}
        onRepeat={handleRepeat}
        onCheck={handleCheck}
        onReset={handleReset}
        onNext={() => {}}
        canCheck={canCheck}
        canNext={false}
        animating={animating}
        soundEnabled={soundEnabled}
        onToggleSound={() => {
          // toggle via ProgressContext — gunakan hook di parent? fallback lokal
          playTap()
          // ProgressContext toggle disediakan di GardenScreen; di sini trigger via custom event
          window.dispatchEvent(new CustomEvent('garden:toggle-sound'))
        }}
      />

      {/* Live region untuk jumlah keranjang/apel — aksesibel tanpa mengandalkan warna */}
      <p className="sr-only" aria-live="polite">
        {visualTens} keranjang puluhan, {visualOnes} apel satuan. Pertanyaan {currentIndex + 1} dari{' '}
        {total}.
      </p>
    </div>
  )
}
