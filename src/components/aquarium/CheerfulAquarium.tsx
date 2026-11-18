import { useEffect, useRef, useReducer, useCallback } from 'react'
import type { MathProblem } from '../../types'
import AquariumCanvas from './AquariumCanvas'
import StackedPlaceValueBoard from '../math/StackedPlaceValueBoard'
import PlaceValueZones from './PlaceValueZones'
import AquariumFeedbackPanel from './AquariumFeedbackPanel'
import AquariumControls from './AquariumControls'
import AquariumProgress from './AquariumProgress'
import NarrationSubtitle from './NarrationSubtitle'
import RewardDecoration from './RewardDecoration'
import AquariumTutorial, { TUTORIAL_STEPS_COUNT } from './AquariumTutorial'
import NumericKeypad from '../input/NumericKeypad'
import { useI18n } from '../../i18n/LanguageContext'
import { useProgress } from '../../state/ProgressContext'
import { splitPlaces, isCorrectAt } from '../../lib/aquariumPlaceValueMath'
import { hasBorrow, hasCarry } from '../../lib/arithmetic'
import {
  createInitialPlaceValueWorldState,
  placeValueWorldReducer,
} from '../../lib/placeValueWorldMachine'
import {
  speak,
  repeatLastNarration,
  stopAllAudio,
  playPickFish,
  playFormGroup,
  playSplitGroup,
  playReward,
  playTryAgain,
} from '../../lib/aquariumSound'
import { playTap } from '../../lib/sound'

interface CheerfulAquariumProps {
  problem: MathProblem
  currentIndex: number
  total: number
  onComplete: (correctFirstTry: boolean, wrongAttempts: number) => void
}

export default function CheerfulAquarium({
  problem,
  currentIndex,
  total,
  onComplete,
}: CheerfulAquariumProps) {
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
    throw new Error(`CheerfulAquarium hanya untuk 2-3 digit, got width ${width}`)
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
    subtitle,
    animating,
    wrongAttempts,
    wrongOnes,
    wrongTens,
    wrongHundreds,
    hasCheckedOnce,
    tutorialStep,
    tutorialOpen,
  } = state
  const enterHundredsText = t('aquarium.enterHundreds')
  const hintHundredsText = t('aquarium.hintHundreds')

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

  // Reset saat problem.id berganti
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
      dispatch({ type: 'SET_SUBTITLE', subtitle: text })
      speak(text, soundEnabled)
    },
    [soundEnabled],
  )

  useEffect(() => {
    if (phase !== 'intro') return
    if (currentIndex === 0) {
      const id = window.setTimeout(() => {
        const text = 'Halo! Selamat datang di Akuarium Ikan Ceria.'
        dispatch({
          type: 'TUTORIAL_OPEN',
          step: 0,
          subtitle: text,
        })
        speak(text, soundEnabled)
      }, 0)
      timersRef.current.push(id)
    } else {
      const text = t('aquarium.startUnit')
      const fbId = window.setTimeout(
        () => dispatch({ type: 'SET_FEEDBACK', feedback: { kind: 'info', text } }),
        0,
      )
      const subId = window.setTimeout(() => {
        dispatch({ type: 'SET_SUBTITLE', subtitle: text })
        speak(text, soundEnabled)
      }, 0)
      const id2 = window.setTimeout(
        () => dispatch({ type: 'SET_PHASE', phase: 'showQuestion' }),
        600,
      )
      timersRef.current.push(fbId, subId, id2)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, currentIndex])

  const handleTutorialNext = () => {
    if (tutorialStep + 1 < TUTORIAL_STEPS_COUNT) {
      dispatch({ type: 'TUTORIAL_NEXT_STEP' })
      playTap()
    } else {
      const text = t('aquarium.startUnit')
      narrate(text)
      dispatch({
        type: 'TUTORIAL_CLOSE',
        feedbackText: text,
      })
      const id = window.setTimeout(
        () => dispatch({ type: 'SET_PHASE', phase: 'showQuestion' }),
        300,
      )
      timersRef.current.push(id)
    }
  }

  const handleTutorialSkip = () => {
    const text = t('aquarium.startUnit')
    narrate(text)
    dispatch({
      type: 'TUTORIAL_CLOSE',
      feedbackText: text,
    })
    const id = window.setTimeout(() => dispatch({ type: 'SET_PHASE', phase: 'showQuestion' }), 200)
    timersRef.current.push(id)
  }

  useEffect(() => {
    if (phase !== 'showQuestion') return
    const schedule = (fn: () => void) => {
      const id = window.setTimeout(fn, 0)
      timersRef.current.push(id)
    }
    schedule(() => dispatch({ type: 'SET_HIGHLIGHT', highlight: 'ones' }))
    if (isAdd && carryNeeded) {
      const text = t('aquarium.combineHint')
      schedule(() => dispatch({ type: 'SET_FEEDBACK', feedback: { kind: 'info', text } }))
      schedule(() => {
        dispatch({ type: 'SET_SUBTITLE', subtitle: text })
        speak(text, soundEnabled)
      })
      schedule(() => dispatch({ type: 'SET_PHASE', phase: 'exchangeOrGroup' }))
    } else if (!isAdd && borrowNeeded) {
      const text = t('aquarium.notEnough')
      schedule(() => dispatch({ type: 'SET_FEEDBACK', feedback: { kind: 'info', text } }))
      schedule(() => {
        dispatch({ type: 'SET_SUBTITLE', subtitle: text })
        speak(text, soundEnabled)
      })
      schedule(() => dispatch({ type: 'SET_PHASE', phase: 'exchangeOrGroup' }))
    } else {
      schedule(() => dispatch({ type: 'SET_PHASE', phase: 'enterOnesAnswer' }))
      schedule(() => dispatch({ type: 'SET_HIGHLIGHT', highlight: 'ones' }))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase])

  const doFormGroup = useCallback(() => {
    if (animating || exchanged) return
    playFormGroup()
    narrate(t('aquarium.tenToGroup'))
    dispatch({
      type: 'START_ANIMATION',
      feedback: { kind: 'info', text: t('aquarium.tenToGroup') },
    })
    const duration = prefersReducedMotion.current ? 50 : 700
    const id = window.setTimeout(() => {
      const nextOnes = afterOnes
      const nextTens = isThree ? (exchangedHundred ? afterTens : initialTens + carry1) : afterTens
      const nextHundreds = isThree ? undefined : afterHundreds
      const nextPhase =
        isThree && carry2 > 0 && !exchangedHundred ? 'exchangeOrGroup' : 'enterOnesAnswer'
      const nextHighlight = isThree && carry2 > 0 && !exchangedHundred ? 'hundreds' : 'ones'
      const nextFeedbackText =
        isThree && carry2 > 0 && !exchangedHundred
          ? t('aquarium.tenGroupsToHundred')
          : t('aquarium.enterOnes')

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

  const doFormHundred = useCallback(() => {
    if (animating || exchangedHundred) return
    playFormGroup()
    narrate(t('aquarium.tenGroupsToHundred'))
    dispatch({
      type: 'START_ANIMATION',
      feedback: { kind: 'info', text: t('aquarium.tenGroupsToHundred') },
    })
    const duration = prefersReducedMotion.current ? 50 : 700
    const id = window.setTimeout(() => {
      const nextPhase = carry1 > 0 && !exchanged ? 'exchangeOrGroup' : 'enterOnesAnswer'
      const nextHighlight = 'ones'
      const nextFeedbackText =
        carry1 > 0 && !exchanged ? t('aquarium.tenToGroup') : t('aquarium.enterOnes')

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

  const doSplitGroup = useCallback(() => {
    if (animating || opened) return
    playSplitGroup()
    narrate(t('aquarium.splitGroup'))
    dispatch({
      type: 'START_ANIMATION',
      feedback: { kind: 'info', text: t('aquarium.splitGroup') },
    })
    const duration = prefersReducedMotion.current ? 50 : 700
    const id = window.setTimeout(() => {
      const nextOnes = afterOnes
      const nextTens = isThree ? (openedHundred ? afterTens : initialTens - borrow1) : afterTens
      const nextHundreds = isThree ? undefined : afterHundreds
      const nextPhase =
        isThree && borrow2 > 0 && !openedHundred ? 'exchangeOrGroup' : 'enterOnesAnswer'
      const nextHighlight = isThree && borrow2 > 0 && !openedHundred ? 'hundreds' : 'ones'
      const nextFeedbackText =
        isThree && borrow2 > 0 && !openedHundred
          ? t('aquarium.splitHundredAction')
          : t('aquarium.enterOnes')

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

  const doSplitHundred = useCallback(() => {
    if (animating || openedHundred) return
    playSplitGroup()
    narrate(t('aquarium.splitHundredAction'))
    dispatch({
      type: 'START_ANIMATION',
      feedback: { kind: 'info', text: t('aquarium.splitHundredAction') },
    })
    const duration = prefersReducedMotion.current ? 50 : 700
    const id = window.setTimeout(() => {
      const nextPhase = borrow1 > 0 && !opened ? 'exchangeOrGroup' : 'enterOnesAnswer'
      const nextHighlight = 'ones'
      const nextFeedbackText =
        borrow1 > 0 && !opened ? t('aquarium.splitGroup') : t('aquarium.enterOnes')

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
    if (phase === 'enterOnesAnswer' || phase === 'exchangeOrGroup') {
      const text = t('aquarium.hintOnes')
      dispatch({ type: 'SET_FEEDBACK', feedback: { kind: 'info', text } })
      narrate(text)
      dispatch({ type: 'SET_HIGHLIGHT', highlight: 'ones' })
    } else if (phase === 'enterTensAnswer') {
      const text = t('aquarium.hintTens')
      dispatch({ type: 'SET_FEEDBACK', feedback: { kind: 'info', text } })
      narrate(text)
      dispatch({ type: 'SET_HIGHLIGHT', highlight: 'tens' })
    } else if (phase === 'enterHundredsAnswer') {
      dispatch({ type: 'SET_FEEDBACK', feedback: { kind: 'info', text: hintHundredsText } })
      narrate(hintHundredsText)
      dispatch({ type: 'SET_HIGHLIGHT', highlight: 'hundreds' })
    } else if (!isAdd && borrowNeeded && !opened) {
      const text = t('aquarium.notEnough')
      dispatch({ type: 'SET_FEEDBACK', feedback: { kind: 'info', text } })
      narrate(text)
    } else if (isAdd && carryNeeded && !exchanged) {
      const text = t('aquarium.tenToGroup')
      dispatch({ type: 'SET_FEEDBACK', feedback: { kind: 'info', text } })
      narrate(text)
    } else if (isThree && isAdd && carry2 > 0 && !exchangedHundred) {
      const text = t('aquarium.tenGroupsToHundred')
      dispatch({ type: 'SET_FEEDBACK', feedback: { kind: 'info', text } })
      narrate(text)
    } else if (isThree && !isAdd && borrow2 > 0 && !openedHundred) {
      const text = t('aquarium.splitHundredAction')
      dispatch({ type: 'SET_FEEDBACK', feedback: { kind: 'info', text } })
      narrate(text)
    } else {
      dispatch({ type: 'SET_FEEDBACK', feedback: { kind: 'info', text: t('aquarium.tryAgain') } })
      narrate(t('aquarium.tryAgain'))
    }
  }

  const handleRepeat = () => {
    playTap()
    repeatLastNarration(soundEnabled)
  }

  const handleCheck = () => {
    if (animating) return
    if (phase === 'intro' || tutorialOpen) {
      const text = t('aquarium.startUnit')
      dispatch({ type: 'SET_FEEDBACK', feedback: { kind: 'info', text } })
      narrate(text)
      return
    }
    if (onesAnswer === null || tensAnswer === null || (isThree && hundredsAnswer === null)) {
      const text =
        onesAnswer === null
          ? t('aquarium.enterOnes')
          : tensAnswer === null
            ? t('aquarium.enterTens')
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
      if (hasCheckedOnce) return
      const successText =
        isAdd && carryNeeded
          ? t('aquarium.successCarry')
          : !isAdd && borrowNeeded
            ? t('aquarium.successBorrow')
            : t('aquarium.correctGeneral')
      dispatch({ type: 'CHECK_SUCCESS', feedbackText: successText })
      narrate(successText)
      playReward()
      const id = window.setTimeout(() => {
        onComplete(wrongAttempts === 0, wrongAttempts)
      }, 800)
      timersRef.current.push(id)
    } else {
      playTryAgain()
      const text = !onesOk
        ? t('aquarium.hintOnes')
        : !tensOk
          ? t('aquarium.hintTens')
          : hintHundredsText
      const feedbackText = t('aquarium.tryAgain') + ' ' + text
      const highlightCol = !onesOk ? 'ones' : !tensOk ? 'tens' : 'hundreds'
      dispatch({
        type: 'CHECK_FAILURE',
        wrongOnes: !onesOk,
        wrongTens: !tensOk,
        wrongHundreds: isThree && !hundredsOk,
        feedbackText,
        highlight: highlightCol,
      })
      narrate(t('aquarium.tryAgain'))
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
    phase !== 'intro' &&
    !tutorialOpen
  const isCompleted = phase === 'completed'
  const digitsDisabled = animating || isCompleted || phase === 'intro' || tutorialOpen
  // Aksi bertahap 3-digit: bentuk/pecah satuan dulu, ratusan setelahnya.
  const showOnesFormAction = !isThree || carry1 === 0 || exchanged
  const showHundredFormAction = isThree && isAdd && carry2 > 0 && !exchangedHundred
  const showOnesSplitAction = !isThree || borrow1 === 0 || opened
  const showHundredSplitAction = isThree && !isAdd && borrow2 > 0 && !openedHundred

  return (
    <div className="space-y-4">
      <AquariumProgress current={currentIndex + 1} total={total} />

      <div className="rounded-3xl border-2 border-sky-100 bg-white p-3 text-center shadow-sm">
        <h2 className="text-base font-black text-sky-800">{t('aquarium.title')}</h2>
        <p className="text-xs font-bold text-slate-500">{t('aquarium.subtitle')}</p>
      </div>

      <AquariumTutorial
        open={tutorialOpen}
        step={tutorialStep}
        totalSteps={TUTORIAL_STEPS_COUNT}
        onNext={handleTutorialNext}
        onSkip={handleTutorialSkip}
      />

      <div className="flex justify-center">
        <StackedPlaceValueBoard
          problem={problem}
          answers={isThree ? [hundredsAnswer, tensAnswer, onesAnswer] : [tensAnswer, onesAnswer]}
          activeColumn={activeColumn}
          carryValues={carryValues}
          borrowValues={borrowValues}
          highlightColumn={highlight}
          wrongColumns={isThree ? [wrongHundreds, wrongTens, wrongOnes] : [wrongTens, wrongOnes]}
          tone="sky"
          onSelectColumn={(c) => {
            dispatch({ type: 'SELECT_COLUMN', column: c })
            playTap()
          }}
        />
      </div>

      <PlaceValueZones
        tens={visualTens}
        ones={visualOnes}
        hundreds={visualHundreds}
        showHundreds={isThree}
        hundredsUnitLabel={t('aquarium.tankLabel')}
        highlight={highlight}
      />

      <AquariumCanvas
        tens={visualTens}
        ones={visualOnes}
        hundreds={visualHundreds}
        highlight={highlight}
        animating={animating}
        // S1: selalu 1 agar puluhan terlihat; animasi via animating guard
        regroupProgress={1}
        splitProgress={1}
      />
      {isThree && (
        <div
          data-testid="aquarium-hundreds-overlay"
          className="mx-auto w-fit rounded-2xl border-2 border-violet-200 bg-violet-50 px-3 py-1 text-xs font-black text-violet-700"
        >
          {visualHundreds} {t('aquarium.tankLabel')} · {visualHundreds * 100}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {isAdd && carryNeeded && !exchanged && showOnesFormAction && phase !== 'intro' && (
          <button
            type="button"
            onClick={() => {
              playPickFish()
              doFormGroup()
            }}
            disabled={animating}
            className="min-h-11 rounded-2xl border-b-4 border-amber-500 bg-amber-400 px-4 text-sm font-black text-white hover:bg-amber-300 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-amber-200 disabled:opacity-40"
            aria-label={t('aquarium.formGroupAction')}
          >
            {t('aquarium.formGroupAction')} (10 → 1)
          </button>
        )}
        {showHundredFormAction && phase !== 'intro' && (
          <button
            type="button"
            onClick={() => {
              playPickFish()
              doFormHundred()
            }}
            disabled={animating}
            className="min-h-11 rounded-2xl border-b-4 border-violet-600 bg-violet-500 px-4 text-sm font-black text-white hover:bg-violet-400 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-violet-300 disabled:opacity-40"
            aria-label={t('aquarium.formHundredAction')}
          >
            {t('aquarium.formHundredAction')} (10 → 1)
          </button>
        )}
        {!isAdd && borrowNeeded && !opened && showOnesSplitAction && phase !== 'intro' && (
          <button
            type="button"
            onClick={() => {
              playPickFish()
              doSplitGroup()
            }}
            disabled={animating}
            className="min-h-11 rounded-2xl border-b-4 border-sky-600 bg-sky-500 px-4 text-sm font-black text-white hover:bg-sky-400 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-300 disabled:opacity-40"
            aria-label={t('aquarium.splitGroupAction')}
          >
            {t('aquarium.splitGroupAction')} (1 → 10)
          </button>
        )}
        {showHundredSplitAction && phase !== 'intro' && (
          <button
            type="button"
            onClick={() => {
              playPickFish()
              doSplitHundred()
            }}
            disabled={animating}
            className="min-h-11 rounded-2xl border-b-4 border-violet-600 bg-violet-500 px-4 text-sm font-black text-white hover:bg-violet-400 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-violet-300 disabled:opacity-40"
            aria-label={t('aquarium.splitHundredAction')}
          >
            {t('aquarium.splitHundredAction')} (1 → 10)
          </button>
        )}
      </div>

      {subtitle && <NarrationSubtitle text={subtitle} />}

      <AquariumFeedbackPanel
        kind={feedback?.kind ?? null}
        text={feedback?.text ?? null}
        highlightColumn={highlight}
      />

      {isCompleted && (
        <RewardDecoration
          visible={isCompleted}
          text={`${t('aquarium.correctGeneral')} — ${top} ${isAdd ? '+' : '−'} ${bottom} = ${problem.expectedResult}`}
        />
      )}

      <div className="rounded-3xl border-2 border-slate-100 bg-white p-3 shadow-sm">
        <p className="mb-2 text-center text-xs font-black uppercase tracking-wide text-slate-500">
          {activeColumn === 'hundreds'
            ? enterHundredsText
            : activeColumn === 'ones'
              ? t('aquarium.enterOnes')
              : t('aquarium.enterTens')}{' '}
          · ketuk kotak jawaban untuk ganti kolom
        </p>
        <NumericKeypad
          onDigit={handleDigit}
          onBackspace={handleBackspace}
          onCheck={handleCheck}
          checkDisabled={!canCheck}
          checkLabel={t('aquarium.check')}
          digitsDisabled={digitsDisabled}
        />
        <p className="mt-2 text-center text-[0.65rem] font-bold text-slate-400">
          Alternatif drag: ketuk ikan/kelompok juga bisa — tidak wajib menyeret.
        </p>
      </div>

      <AquariumControls
        onHint={handleHint}
        onRepeat={handleRepeat}
        onCheck={handleCheck}
        onReset={handleReset}
        canCheck={canCheck}
        animating={animating}
        soundEnabled={soundEnabled}
        onToggleSound={() => {
          playTap()
          window.dispatchEvent(new CustomEvent('aquarium:toggle-sound'))
        }}
      />

      <p className="sr-only" aria-live="polite">
        {isThree ? `${visualHundreds} ${t('aquarium.tankLabel')} ratusan, ` : ''}
        {visualTens} kelompok puluhan, {visualOnes} ikan satuan. Pertanyaan {currentIndex + 1} dari{' '}
        {total}.
      </p>
    </div>
  )
}
