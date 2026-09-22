import { useEffect, useRef, useState, useCallback } from 'react'
import type { MathProblem } from '../../types'
import GardenScene from './GardenScene'
import StackedPlaceValueBoard from '../math/StackedPlaceValueBoard'
import GardenFeedbackPanel from './GardenFeedbackPanel'
import GardenControls from './GardenControls'
import GardenProgress from './GardenProgress'
import PlaceValueBoard from './PlaceValueBoard'
import NumericKeypad from '../input/NumericKeypad'
import { useI18n } from '../../i18n/LanguageContext'
import { useProgress } from '../../state/ProgressContext'
import { splitPlaces, isCorrectAt } from '../../lib/placeValueMath'
import { hasBorrow, hasCarry } from '../../lib/arithmetic'
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
  | 'enterHundredsAnswer'
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
  const carryNeeded = isAdd && hasCarry(top, bottom)
  const borrowNeeded = !isAdd && hasBorrow(top, bottom)

  const width = problem.columns.length
  if (width !== 2 && width !== 3) {
    throw new Error(`MagicAppleGarden hanya untuk 2-3 digit, got width ${width}`)
  }
  const isThree = width === 3

  const topPlaces = splitPlaces(Math.min(top, 999))
  const botPlaces = splitPlaces(Math.min(bottom, 999))

  // Carry/borrow berantai untuk ratusan (S→P→R)
  const onesSum = topPlaces.ones + botPlaces.ones
  const carry1 = isAdd && onesSum >= 10 ? 1 : 0
  const tensSum = topPlaces.tens + botPlaces.tens + carry1
  const carry2 = isAdd && tensSum >= 10 ? 1 : 0
  const borrow1 = !isAdd && topPlaces.ones < botPlaces.ones ? 1 : 0
  const tensEffective = topPlaces.tens - borrow1
  const borrow2 = !isAdd && tensEffective < botPlaces.tens ? 1 : 0

  // Visual state
  const initialTens = isAdd ? topPlaces.tens + botPlaces.tens : topPlaces.tens
  const initialOnes = isAdd ? topPlaces.ones + botPlaces.ones : topPlaces.ones
  // 2-digit: pertahankan perilaku lama (puluhan boleh >9 karena tak ada kartu R).
  // 3-digit: normalisasi penuh S→P→R.
  const afterTens = isThree
    ? isAdd
      ? initialTens + carry1 - (carry2 ? 10 : 0)
      : initialTens - borrow1 + (borrow2 ? 10 : 0)
    : isAdd && carryNeeded
      ? initialTens + 1
      : !isAdd && borrowNeeded
        ? initialTens - 1
        : initialTens
  const afterOnes = isThree
    ? isAdd
      ? initialOnes - (carry1 ? 10 : 0)
      : initialOnes + (borrow1 ? 10 : 0)
    : isAdd && carryNeeded
      ? initialOnes - 10
      : !isAdd && borrowNeeded
        ? initialOnes + 10
        : initialOnes
  const initialHundreds = isAdd ? topPlaces.hundreds + botPlaces.hundreds : topPlaces.hundreds
  const afterHundreds = isAdd
    ? topPlaces.hundreds + botPlaces.hundreds + carry2
    : topPlaces.hundreds - borrow2

  const [visualTens, setVisualTens] = useState(initialTens)
  const [visualOnes, setVisualOnes] = useState(initialOnes)
  const [visualHundreds, setVisualHundreds] = useState(initialHundreds)
  const [exchanged, setExchanged] = useState(false)
  const [exchangedHundred, setExchangedHundred] = useState(false)
  const [opened, setOpened] = useState(false)
  const [openedHundred, setOpenedHundred] = useState(false)
  const [phase, setPhase] = useState<GardenPhase>('intro')
  const [onesAnswer, setOnesAnswer] = useState<number | null>(null)
  const [tensAnswer, setTensAnswer] = useState<number | null>(null)
  const [hundredsAnswer, setHundredsAnswer] = useState<number | null>(null)
  const [activeColumn, setActiveColumn] = useState<'ones' | 'tens' | 'hundreds' | null>('ones')
  const [feedback, setFeedback] = useState<{
    kind: 'correct' | 'wrong' | 'info'
    text: string
  } | null>(null)
  const [highlight, setHighlight] = useState<'tens' | 'ones' | 'hundreds' | null>('ones')
  const [animating, setAnimating] = useState(false)
  const [wrongAttempts, setWrongAttempts] = useState(0)
  const [wrongOnes, setWrongOnes] = useState(false)
  const [wrongTens, setWrongTens] = useState(false)
  const [wrongHundreds, setWrongHundreds] = useState(false)
  const [hasCheckedOnce, setHasCheckedOnce] = useState(false)
  const enterHundredsText = t('garden.enterHundreds')
  const hintHundredsText = t('garden.hintHundreds')

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

  // Reset when problem changes — keyed by problem.id, also handles normal phase flow.
  // Reset sinkron (tanpa setTimeout): timer soal lama dibersihkan DULU,
  // lalu state di-reset. Timer soal baru dijadwalkan oleh effect intro/
  // showQuestion SETELAH effect ini, sehingga tidak ikut terhapus.
  // (Versi async sebelumnya menghapus timer intro 600ms yang baru
  // dijadwalkan pada mount yang sama → fase macet di 'intro' selamanya.)
  // Reset sinkron disengaja + aman (deps hanya problem.id); cascading render
  // tidak terjadi karena effect hanya fire saat soal berganti.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    clearTimers()
    stopAllAudio()
    setVisualTens(initialTens)
    setVisualOnes(initialOnes)
    setVisualHundreds(initialHundreds)
    setExchanged(false)
    setExchangedHundred(false)
    setOpened(false)
    setOpenedHundred(false)
    setPhase('intro')
    setOnesAnswer(null)
    setTensAnswer(null)
    setHundredsAnswer(null)
    setActiveColumn('ones')
    setFeedback(null)
    setHighlight('ones')
    setAnimating(false)
    setWrongAttempts(0)
    setWrongOnes(false)
    setWrongTens(false)
    setWrongHundreds(false)
    setHasCheckedOnce(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [problem.id])
  /* eslint-enable react-hooks/set-state-in-effect */

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
      if (isThree) {
        setVisualOnes(afterOnes)
        setVisualTens(exchangedHundred ? afterTens : initialTens + carry1)
      } else {
        setVisualTens(afterTens)
        setVisualOnes(afterOnes)
        setVisualHundreds(afterHundreds)
      }
      setExchanged(true)
      setAnimating(false)
      if (isThree && carry2 > 0 && !exchangedHundred) {
        setPhase('exchangeOrRegroup')
        setHighlight('hundreds')
        setFeedback({ kind: 'info', text: t('garden.tenTensToHundred') })
      } else {
        setPhase('enterOnesAnswer')
        setHighlight('ones')
        setFeedback({ kind: 'info', text: t('garden.enterOnes') })
      }
    }, duration)
    timersRef.current.push(id)
  }, [
    animating,
    exchanged,
    exchangedHundred,
    isThree,
    afterTens,
    afterOnes,
    afterHundreds,
    initialTens,
    carry1,
    carry2,
    narrate,
    t,
  ])

  const doOpen = useCallback(() => {
    if (animating || opened) return
    setAnimating(true)
    playOpenBasket()
    narrate(t('garden.openBasket'))
    setFeedback({ kind: 'info', text: t('garden.openBasket') })
    const duration = prefersReducedMotion.current ? 50 : 700
    const id = window.setTimeout(() => {
      if (isThree) {
        setVisualOnes(afterOnes)
        setVisualTens(openedHundred ? afterTens : initialTens - borrow1)
      } else {
        setVisualTens(afterTens)
        setVisualOnes(afterOnes)
        setVisualHundreds(afterHundreds)
      }
      setOpened(true)
      setAnimating(false)
      if (isThree && borrow2 > 0 && !openedHundred) {
        setPhase('exchangeOrRegroup')
        setHighlight('hundreds')
        setFeedback({ kind: 'info', text: t('garden.openHundredAction') })
      } else {
        setPhase('enterOnesAnswer')
        setHighlight('ones')
        setFeedback({ kind: 'info', text: t('garden.enterOnes') })
      }
    }, duration)
    timersRef.current.push(id)
  }, [
    animating,
    opened,
    openedHundred,
    isThree,
    afterTens,
    afterOnes,
    afterHundreds,
    initialTens,
    borrow1,
    borrow2,
    narrate,
    t,
  ])

  const doExchangeHundred = useCallback(() => {
    if (animating || exchangedHundred) return
    setAnimating(true)
    playPutToBasket()
    narrate(t('garden.tenTensToHundred'))
    setFeedback({ kind: 'info', text: t('garden.tenTensToHundred') })
    const duration = prefersReducedMotion.current ? 50 : 700
    const id = window.setTimeout(() => {
      setVisualTens(afterTens)
      setVisualHundreds(afterHundreds)
      setExchangedHundred(true)
      setAnimating(false)
      if (carry1 > 0 && !exchanged) {
        setPhase('exchangeOrRegroup')
        setHighlight('ones')
        setFeedback({ kind: 'info', text: t('garden.tenToBasket') })
      } else {
        setPhase('enterOnesAnswer')
        setHighlight('ones')
        setFeedback({ kind: 'info', text: t('garden.enterOnes') })
      }
    }, duration)
    timersRef.current.push(id)
  }, [animating, exchanged, exchangedHundred, afterTens, afterHundreds, carry1, narrate, t])

  const doOpenHundred = useCallback(() => {
    if (animating || openedHundred) return
    setAnimating(true)
    playOpenBasket()
    narrate(t('garden.openHundredAction'))
    setFeedback({ kind: 'info', text: t('garden.openHundredAction') })
    const duration = prefersReducedMotion.current ? 50 : 700
    const id = window.setTimeout(() => {
      setVisualTens(afterTens)
      setVisualHundreds(afterHundreds)
      setOpenedHundred(true)
      setAnimating(false)
      if (borrow1 > 0 && !opened) {
        setPhase('exchangeOrRegroup')
        setHighlight('ones')
        setFeedback({ kind: 'info', text: t('garden.openBasket') })
      } else {
        setPhase('enterOnesAnswer')
        setHighlight('ones')
        setFeedback({ kind: 'info', text: t('garden.enterOnes') })
      }
    }, duration)
    timersRef.current.push(id)
  }, [animating, opened, openedHundred, afterTens, afterHundreds, borrow1, narrate, t])

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
    } else if (phase === 'enterHundredsAnswer') {
      setFeedback({ kind: 'info', text: hintHundredsText })
      narrate(hintHundredsText)
      setHighlight('hundreds')
    } else if (!isAdd && borrowNeeded && !opened) {
      const text = t('garden.notEnough')
      setFeedback({ kind: 'info', text })
      narrate(text)
    } else if (isAdd && carryNeeded && !exchanged) {
      const text = t('garden.tenToBasket')
      setFeedback({ kind: 'info', text })
      narrate(text)
    } else if (isThree && isAdd && carry2 > 0 && !exchangedHundred) {
      const text = t('garden.tenTensToHundred')
      setFeedback({ kind: 'info', text })
      narrate(text)
    } else if (isThree && !isAdd && borrow2 > 0 && !openedHundred) {
      const text = t('garden.openHundredAction')
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
    if (phase === 'intro') {
      const text = t('garden.startUnit')
      setFeedback({ kind: 'info', text })
      narrate(text)
      return
    }
    if (onesAnswer === null || tensAnswer === null || (isThree && hundredsAnswer === null)) {
      const text =
        onesAnswer === null
          ? t('garden.enterOnes')
          : tensAnswer === null
            ? t('garden.enterTens')
            : enterHundredsText
      setFeedback({ kind: 'wrong', text })
      narrate(text)
      setHighlight(onesAnswer === null ? 'ones' : tensAnswer === null ? 'tens' : 'hundreds')
      return
    }
    const onesIdx = width - 1
    const tensIdx = width - 2
    const hundredsIdx = width - 3
    const onesOk = isCorrectAt(top, bottom, problem.operation, onesIdx, width, onesAnswer)
    const tensOk = isCorrectAt(top, bottom, problem.operation, tensIdx, width, tensAnswer)
    const hundredsOk =
      !isThree || hundredsAnswer === null
        ? true
        : isCorrectAt(top, bottom, problem.operation, hundredsIdx, width, hundredsAnswer)
    if (onesOk && tensOk && hundredsOk) {
      if (hasCheckedOnce) return // idempoten: jangan gandakan reward
      setHasCheckedOnce(true)
      setWrongOnes(false)
      setWrongTens(false)
      setWrongHundreds(false)
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
      setWrongHundreds(isThree && !hundredsOk)
      const attempts = wrongAttempts + 1
      setWrongAttempts(attempts)
      playTryAgain()
      const text = !onesOk
        ? t('garden.hintOnes')
        : !tensOk
          ? t('garden.hintTens')
          : hintHundredsText
      setFeedback({ kind: 'wrong', text: t('garden.tryAgain') + ' ' + text })
      narrate(t('garden.tryAgain'))
      setHighlight(!onesOk ? 'ones' : !tensOk ? 'tens' : 'hundreds')
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
    setVisualHundreds(initialHundreds)
    setExchanged(false)
    setExchangedHundred(false)
    setOpened(false)
    setOpenedHundred(false)
    setOnesAnswer(null)
    setTensAnswer(null)
    setHundredsAnswer(null)
    setActiveColumn('ones')
    setFeedback(null)
    setHighlight('ones')
    setAnimating(false)
    setWrongAttempts(0)
    setWrongOnes(false)
    setWrongTens(false)
    setWrongHundreds(false)
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
      if (phase === 'enterOnesAnswer') {
        setPhase('enterTensAnswer')
      }
    } else if (activeColumn === 'tens') {
      setTensAnswer(digit)
      setWrongTens(false)
      if (isThree) {
        setActiveColumn('hundreds')
        setHighlight('hundreds')
        if (phase === 'enterTensAnswer') {
          setPhase('enterHundredsAnswer')
        }
      }
    } else if (activeColumn === 'hundreds') {
      setHundredsAnswer(digit)
      setWrongHundreds(false)
    }
  }

  const handleBackspace = () => {
    playTap()
    if (activeColumn === 'hundreds' && hundredsAnswer !== null) {
      setHundredsAnswer(null)
    } else if (activeColumn === 'hundreds' && hundredsAnswer === null) {
      setActiveColumn('tens')
    } else if (activeColumn === 'tens' && tensAnswer !== null) {
      setTensAnswer(null)
    } else if (activeColumn === 'ones' && onesAnswer !== null) {
      setOnesAnswer(null)
    } else if (activeColumn === 'tens' && tensAnswer === null) {
      setActiveColumn('ones')
      setOnesAnswer(null)
    }
  }

  const carryShown = isAdd && carryNeeded && (isThree ? exchangedHundred || exchanged : exchanged)
  const borrowShown = !isAdd && borrowNeeded && (isThree ? openedHundred || opened : opened)
  // Aksi bertahap 3-digit: tukar/buka satuan dulu, ratusan setelahnya.
  const showOnesAction = !isThree || carry1 === 0 || exchanged
  const showHundredAddAction = isThree && isAdd && carry2 > 0 && !exchangedHundred
  const showOnesBorrowAction = !isThree || borrow1 === 0 || opened
  const showHundredSubAction = isThree && !isAdd && borrow2 > 0 && !openedHundred

  const carryValues = isThree
    ? [carry2 > 0 && exchangedHundred ? 1 : null, carry1 > 0 && exchanged ? 1 : null, null]
    : [carryShown ? 1 : null, null]
  const borrowValues = borrowShown
    ? isThree
      ? [afterHundreds, afterTens, afterOnes]
      : [afterTens, afterOnes]
    : isThree
      ? [null, null, null]
      : [null, null]

  const canCheck =
    onesAnswer !== null &&
    tensAnswer !== null &&
    (!isThree || hundredsAnswer !== null) &&
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
        <StackedPlaceValueBoard
          problem={problem}
          answers={isThree ? [hundredsAnswer, tensAnswer, onesAnswer] : [tensAnswer, onesAnswer]}
          activeColumn={activeColumn}
          carryValues={carryValues}
          borrowValues={borrowValues}
          highlightColumn={highlight}
          wrongColumns={isThree ? [wrongHundreds, wrongTens, wrongOnes] : [wrongTens, wrongOnes]}
          tone="emerald"
          onSelectColumn={(c) => {
            setActiveColumn(c)
            setHighlight(c)
            playTap()
          }}
        />
      </div>

      <PlaceValueBoard
        tens={visualTens}
        ones={visualOnes}
        hundreds={visualHundreds}
        showHundreds={isThree}
        highlight={highlight}
      />

      <GardenScene
        tens={visualTens}
        ones={visualOnes}
        hundreds={visualHundreds}
        showHundreds={isThree}
        highlight={highlight}
        disabled={animating || isCompleted}
        animating={animating}
        onBasketClick={() => {
          playPickApple()
          if (!isAdd && borrowNeeded && !opened) doOpen()
        }}
        onAppleClick={() => playPickApple()}
        onCrateClick={() => playPickApple()}
      />

      {/* Aksi pertukaran — sinkron dengan angka bersusun */}
      <div className="flex flex-wrap gap-2">
        {isAdd && carryNeeded && !exchanged && showOnesAction && phase !== 'intro' && (
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
        {showHundredAddAction && phase !== 'intro' && (
          <button
            type="button"
            onClick={doExchangeHundred}
            disabled={animating}
            className="min-h-11 rounded-2xl border-b-4 border-violet-600 bg-violet-500 px-4 text-sm font-black text-white hover:bg-violet-400 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-violet-300 disabled:opacity-40"
            aria-label={t('garden.exchangeHundredAction')}
          >
            {t('garden.exchangeHundredAction')} (10 → 1)
          </button>
        )}
        {!isAdd && borrowNeeded && !opened && showOnesBorrowAction && (
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
        {showHundredSubAction && phase !== 'intro' && (
          <button
            type="button"
            onClick={doOpenHundred}
            disabled={animating}
            className="min-h-11 rounded-2xl border-b-4 border-violet-600 bg-violet-500 px-4 text-sm font-black text-white hover:bg-violet-400 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-violet-300 disabled:opacity-40"
            aria-label={t('garden.openHundredAction')}
          >
            {t('garden.openHundredAction')} (1 → 10)
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
          {activeColumn === 'hundreds'
            ? enterHundredsText
            : activeColumn === 'ones'
              ? t('garden.enterOnes')
              : t('garden.enterTens')}{' '}
          · ketuk kotak jawaban untuk ganti kolom
        </p>
        <NumericKeypad
          onDigit={handleDigit}
          onBackspace={handleBackspace}
          onCheck={handleCheck}
          checkDisabled={!canCheck}
          checkLabel={t('garden.check')}
          digitsDisabled={animating || isCompleted || phase === 'intro'}
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
        {isThree ? `${visualHundreds} peti ratusan, ` : ''}
        {visualTens} keranjang puluhan, {visualOnes} apel satuan. Pertanyaan {currentIndex + 1} dari{' '}
        {total}.
      </p>
    </div>
  )
}
