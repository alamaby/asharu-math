import { useEffect, useRef, useReducer, useCallback } from 'react'
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
  createInitialPlaceValueWorldState,
  placeValueWorldReducer,
} from '../../lib/placeValueWorldMachine'
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

  const [state, dispatch] = useReducer(
    placeValueWorldReducer,
    {
      initialTens,
      initialOnes,
      initialHundreds,
    },
    createInitialPlaceValueWorldState,
  )

  const {
    phase,
    visualTens,
    visualOnes,
    visualHundreds,
    exchanged,
    exchangedHundred,
    opened,
    openedHundred,
    onesAnswer,
    tensAnswer,
    hundredsAnswer,
    activeColumn,
    highlight,
    feedback,
    animating,
    wrongAttempts,
    wrongOnes,
    wrongTens,
    wrongHundreds,
    hasCheckedOnce,
  } = state
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

  // Reset saat soal berganti: timer dibersihkan lalu state di-reset secara atomik
  useEffect(() => {
    clearTimers()
    stopAllAudio()
    dispatch({
      type: 'RESET',
      initialTens,
      initialOnes,
      initialHundreds,
      phase: 'intro',
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [problem.id])

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
    const fbId = window.setTimeout(
      () => dispatch({ type: 'SET_FEEDBACK', feedback: { kind: 'info', text } }),
      0,
    )
    const id = window.setTimeout(() => dispatch({ type: 'SET_PHASE', phase: 'showQuestion' }), 600)
    timersRef.current.push(fbId, id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase])

  useEffect(() => {
    if (phase !== 'showQuestion') return
    const schedule = (fn: () => void) => {
      const id = window.setTimeout(fn, 0)
      timersRef.current.push(id)
    }
    schedule(() => dispatch({ type: 'SET_HIGHLIGHT', highlight: 'ones' }))
    if (isAdd && carryNeeded) {
      const text = t('garden.combineHint')
      schedule(() => dispatch({ type: 'SET_FEEDBACK', feedback: { kind: 'info', text } }))
      narrate(text)
      schedule(() => dispatch({ type: 'SET_PHASE', phase: 'countOnes' }))
    } else if (!isAdd && borrowNeeded) {
      const text = t('garden.notEnough')
      schedule(() => dispatch({ type: 'SET_FEEDBACK', feedback: { kind: 'info', text } }))
      narrate(text)
      schedule(() => dispatch({ type: 'SET_PHASE', phase: 'exchangeOrRegroup' }))
    } else {
      schedule(() => dispatch({ type: 'SET_PHASE', phase: 'enterOnesAnswer' }))
      schedule(() => dispatch({ type: 'SET_HIGHLIGHT', highlight: 'ones' }))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase])

  const doExchange = useCallback(() => {
    if (animating || exchanged) return
    playPutToBasket()
    narrate(t('garden.tenToBasket'))
    dispatch({
      type: 'START_ANIMATION',
      feedback: { kind: 'info', text: t('garden.tenToBasket') },
    })
    const duration = prefersReducedMotion.current ? 50 : 700
    const id = window.setTimeout(() => {
      const nextOnes = afterOnes
      const nextTens = isThree ? (exchangedHundred ? afterTens : initialTens + carry1) : afterTens
      const nextHundreds = isThree ? undefined : afterHundreds
      const nextPhase =
        isThree && carry2 > 0 && !exchangedHundred ? 'exchangeOrRegroup' : 'enterOnesAnswer'
      const nextHighlight = isThree && carry2 > 0 && !exchangedHundred ? 'hundreds' : 'ones'
      const nextFeedbackText =
        isThree && carry2 > 0 && !exchangedHundred
          ? t('garden.tenTensToHundred')
          : t('garden.enterOnes')

      dispatch({
        type: 'FINISH_EXCHANGE_ONES',
        visualOnes: nextOnes,
        visualTens: nextTens,
        visualHundreds: nextHundreds,
        nextPhase,
        highlight: nextHighlight,
        feedback: { kind: 'info', text: nextFeedbackText },
      })
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
    playOpenBasket()
    narrate(t('garden.openBasket'))
    dispatch({
      type: 'START_ANIMATION',
      feedback: { kind: 'info', text: t('garden.openBasket') },
    })
    const duration = prefersReducedMotion.current ? 50 : 700
    const id = window.setTimeout(() => {
      const nextOnes = afterOnes
      const nextTens = isThree ? (openedHundred ? afterTens : initialTens - borrow1) : afterTens
      const nextHundreds = isThree ? undefined : afterHundreds
      const nextPhase =
        isThree && borrow2 > 0 && !openedHundred ? 'exchangeOrRegroup' : 'enterOnesAnswer'
      const nextHighlight = isThree && borrow2 > 0 && !openedHundred ? 'hundreds' : 'ones'
      const nextFeedbackText =
        isThree && borrow2 > 0 && !openedHundred
          ? t('garden.openHundredAction')
          : t('garden.enterOnes')

      dispatch({
        type: 'FINISH_OPEN_ONES',
        visualOnes: nextOnes,
        visualTens: nextTens,
        visualHundreds: nextHundreds,
        nextPhase,
        highlight: nextHighlight,
        feedback: { kind: 'info', text: nextFeedbackText },
      })
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
    playPutToBasket()
    narrate(t('garden.tenTensToHundred'))
    dispatch({
      type: 'START_ANIMATION',
      feedback: { kind: 'info', text: t('garden.tenTensToHundred') },
    })
    const duration = prefersReducedMotion.current ? 50 : 700
    const id = window.setTimeout(() => {
      const nextPhase = carry1 > 0 && !exchanged ? 'exchangeOrRegroup' : 'enterOnesAnswer'
      const nextHighlight = 'ones'
      const nextFeedbackText =
        carry1 > 0 && !exchanged ? t('garden.tenToBasket') : t('garden.enterOnes')

      dispatch({
        type: 'FINISH_EXCHANGE_HUNDRED',
        visualTens: afterTens,
        visualHundreds: afterHundreds,
        nextPhase,
        highlight: nextHighlight,
        feedback: { kind: 'info', text: nextFeedbackText },
      })
    }, duration)
    timersRef.current.push(id)
  }, [animating, exchanged, exchangedHundred, afterTens, afterHundreds, carry1, narrate, t])

  const doOpenHundred = useCallback(() => {
    if (animating || openedHundred) return
    playOpenBasket()
    narrate(t('garden.openHundredAction'))
    dispatch({
      type: 'START_ANIMATION',
      feedback: { kind: 'info', text: t('garden.openHundredAction') },
    })
    const duration = prefersReducedMotion.current ? 50 : 700
    const id = window.setTimeout(() => {
      const nextPhase = borrow1 > 0 && !opened ? 'exchangeOrRegroup' : 'enterOnesAnswer'
      const nextHighlight = 'ones'
      const nextFeedbackText =
        borrow1 > 0 && !opened ? t('garden.openBasket') : t('garden.enterOnes')

      dispatch({
        type: 'FINISH_OPEN_HUNDRED',
        visualTens: afterTens,
        visualHundreds: afterHundreds,
        nextPhase,
        highlight: nextHighlight,
        feedback: { kind: 'info', text: nextFeedbackText },
      })
    }, duration)
    timersRef.current.push(id)
  }, [animating, opened, openedHundred, afterTens, afterHundreds, borrow1, narrate, t])

  const handleHint = () => {
    playTap()
    if (phase === 'enterOnesAnswer' || phase === 'countOnes') {
      const text = t('garden.hintOnes')
      dispatch({ type: 'SET_FEEDBACK', feedback: { kind: 'info', text } })
      narrate(text)
      dispatch({ type: 'SET_HIGHLIGHT', highlight: 'ones' })
    } else if (phase === 'enterTensAnswer' || phase === 'countTens') {
      const text = t('garden.hintTens')
      dispatch({ type: 'SET_FEEDBACK', feedback: { kind: 'info', text } })
      narrate(text)
      dispatch({ type: 'SET_HIGHLIGHT', highlight: 'tens' })
    } else if (phase === 'enterHundredsAnswer') {
      dispatch({ type: 'SET_FEEDBACK', feedback: { kind: 'info', text: hintHundredsText } })
      narrate(hintHundredsText)
      dispatch({ type: 'SET_HIGHLIGHT', highlight: 'hundreds' })
    } else if (!isAdd && borrowNeeded && !opened) {
      const text = t('garden.notEnough')
      dispatch({ type: 'SET_FEEDBACK', feedback: { kind: 'info', text } })
      narrate(text)
    } else if (isAdd && carryNeeded && !exchanged) {
      const text = t('garden.tenToBasket')
      dispatch({ type: 'SET_FEEDBACK', feedback: { kind: 'info', text } })
      narrate(text)
    } else if (isThree && isAdd && carry2 > 0 && !exchangedHundred) {
      const text = t('garden.tenTensToHundred')
      dispatch({ type: 'SET_FEEDBACK', feedback: { kind: 'info', text } })
      narrate(text)
    } else if (isThree && !isAdd && borrow2 > 0 && !openedHundred) {
      const text = t('garden.openHundredAction')
      dispatch({ type: 'SET_FEEDBACK', feedback: { kind: 'info', text } })
      narrate(text)
    } else {
      dispatch({ type: 'SET_FEEDBACK', feedback: { kind: 'info', text: t('garden.tryAgain') } })
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
      dispatch({ type: 'SET_FEEDBACK', feedback: { kind: 'info', text } })
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
      dispatch({ type: 'SET_FEEDBACK', feedback: { kind: 'wrong', text } })
      narrate(text)
      dispatch({
        type: 'SET_HIGHLIGHT',
        highlight: onesAnswer === null ? 'ones' : tensAnswer === null ? 'tens' : 'hundreds',
      })
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
      const successText =
        isAdd && carryNeeded
          ? t('garden.successCarry')
          : !isAdd && borrowNeeded
            ? t('garden.successBorrow')
            : t('garden.correctGeneral')
      dispatch({ type: 'CHECK_SUCCESS', feedbackText: successText })
      narrate(successText)
      playReward()
      // beri jeda lalu notify parent
      const id = window.setTimeout(() => {
        onComplete(wrongAttempts === 0, wrongAttempts)
      }, 800)
      timersRef.current.push(id)
    } else {
      // belum tepat — jangan tampilkan silang besar, hanya sorot kolom
      playTryAgain()
      const text = !onesOk
        ? t('garden.hintOnes')
        : !tensOk
          ? t('garden.hintTens')
          : hintHundredsText
      const feedbackText = t('garden.tryAgain') + ' ' + text
      const highlightCol = !onesOk ? 'ones' : !tensOk ? 'tens' : 'hundreds'
      dispatch({
        type: 'CHECK_FAILURE',
        wrongOnes: !onesOk,
        wrongTens: !tensOk,
        wrongHundreds: isThree && !hundredsOk,
        feedbackText,
        highlight: highlightCol,
      })
      narrate(t('garden.tryAgain'))
    }
  }

  const handleReset = () => {
    playTap()
    clearTimers()
    stopAllAudio()
    dispatch({
      type: 'RESET',
      initialTens,
      initialOnes,
      initialHundreds,
      phase: 'showQuestion',
    })
  }

  const handleDigit = (digit: number) => {
    playTap()
    dispatch({ type: 'INPUT_DIGIT', digit, isThree })
  }

  const handleBackspace = () => {
    playTap()
    dispatch({ type: 'BACKSPACE' })
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
            dispatch({ type: 'SELECT_COLUMN', column: c })
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
