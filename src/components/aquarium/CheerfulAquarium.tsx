import { useEffect, useRef, useState, useCallback } from 'react'
import type { MathProblem } from '../../types'
import AquariumCanvas from './AquariumCanvas'
import StackedOperationBoard from './StackedOperationBoard'
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
import {
  splitTensOnes,
  needsCarry,
  needsBorrow,
  isCorrectOnesAnswer,
  isCorrectTensAnswer,
} from '../../lib/aquariumPlaceValueMath'
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

type Phase =
  | 'intro'
  | 'tutorial'
  | 'showQuestion'
  | 'exchangeOrGroup'
  | 'enterOnesAnswer'
  | 'enterTensAnswer'
  | 'completed'

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
  const carryNeeded = isAdd && needsCarry(top, bottom)
  const borrowNeeded = !isAdd && needsBorrow(top, bottom)

  const topSplit = splitTensOnes(top)
  const botSplit = splitTensOnes(bottom)

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
  const [phase, setPhase] = useState<Phase>('intro')
  const [tutorialStep, setTutorialStep] = useState(0)
  const [tutorialOpen, setTutorialOpen] = useState(false)
  const [onesAnswer, setOnesAnswer] = useState<number | null>(null)
  const [tensAnswer, setTensAnswer] = useState<number | null>(null)
  const [activeColumn, setActiveColumn] = useState<'ones' | 'tens' | null>('ones')
  const [feedback, setFeedback] = useState<{ kind: 'correct' | 'wrong' | 'info'; text: string } | null>(null)
  const [subtitle, setSubtitle] = useState<string | null>(null)
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

  useEffect(() => {
    const id = window.setTimeout(() => {
      setVisualTens(initialTens)
      setVisualOnes(initialOnes)
      setExchanged(false)
      setOpened(false)
      setPhase('intro')
      setTutorialStep(0)
      setTutorialOpen(false)
      setOnesAnswer(null)
      setTensAnswer(null)
      setActiveColumn('ones')
      setFeedback(null)
      setSubtitle(null)
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
      setSubtitle(text)
      speak(text, soundEnabled)
    },
    [soundEnabled],
  )

  useEffect(() => {
    if (phase !== 'intro') return
    if (currentIndex === 0) {
      const id = window.setTimeout(() => {
        setTutorialOpen(true)
        setTutorialStep(0)
        const text = 'Halo! Selamat datang di Akuarium Ikan Ceria.'
        setSubtitle(text)
        speak(text, soundEnabled)
      }, 0)
      timersRef.current.push(id)
    } else {
      const text = t('aquarium.startUnit')
      const fbId = window.setTimeout(() => setFeedback({ kind: 'info', text }), 0)
      const subId = window.setTimeout(() => {
        setSubtitle(text)
        speak(text, soundEnabled)
      }, 0)
      const id2 = window.setTimeout(() => setPhase('showQuestion'), 600)
      timersRef.current.push(fbId, subId, id2)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, currentIndex])

  const handleTutorialNext = () => {
    if (tutorialStep + 1 < TUTORIAL_STEPS_COUNT) {
      setTutorialStep((s) => s + 1)
      playTap()
    } else {
      setTutorialOpen(false)
      const text = t('aquarium.startUnit')
      narrate(text)
      setFeedback({ kind: 'info', text })
      const id = window.setTimeout(() => setPhase('showQuestion'), 300)
      timersRef.current.push(id)
    }
  }

  const handleTutorialSkip = () => {
    setTutorialOpen(false)
    const text = t('aquarium.startUnit')
    narrate(text)
    setFeedback({ kind: 'info', text })
    const id = window.setTimeout(() => setPhase('showQuestion'), 200)
    timersRef.current.push(id)
  }

  useEffect(() => {
    if (phase !== 'showQuestion') return
    const schedule = (fn: () => void) => {
      const id = window.setTimeout(fn, 0)
      timersRef.current.push(id)
    }
    schedule(() => setHighlight('ones'))
    if (isAdd && carryNeeded) {
      const text = t('aquarium.combineHint')
      schedule(() => setFeedback({ kind: 'info', text }))
      schedule(() => {
        setSubtitle(text)
        speak(text, soundEnabled)
      })
      schedule(() => setPhase('exchangeOrGroup'))
    } else if (!isAdd && borrowNeeded) {
      const text = t('aquarium.notEnough')
      schedule(() => setFeedback({ kind: 'info', text }))
      schedule(() => {
        setSubtitle(text)
        speak(text, soundEnabled)
      })
      schedule(() => setPhase('exchangeOrGroup'))
    } else {
      schedule(() => setPhase('enterOnesAnswer'))
      schedule(() => setHighlight('ones'))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase])

  const doFormGroup = useCallback(() => {
    if (animating || exchanged) return
    setAnimating(true)
    playFormGroup()
    narrate(t('aquarium.tenToGroup'))
    setFeedback({ kind: 'info', text: t('aquarium.tenToGroup') })
    const duration = prefersReducedMotion.current ? 50 : 700
    const id = window.setTimeout(() => {
      setVisualTens(afterTens)
      setVisualOnes(afterOnes)
      setExchanged(true)
      setAnimating(false)
      setPhase('enterOnesAnswer')
      setHighlight('ones')
      setFeedback({ kind: 'info', text: t('aquarium.enterOnes') })
    }, duration)
    timersRef.current.push(id)
  }, [animating, exchanged, afterTens, afterOnes, narrate, t])

  const doSplitGroup = useCallback(() => {
    if (animating || opened) return
    setAnimating(true)
    playSplitGroup()
    narrate(t('aquarium.splitGroup'))
    setFeedback({ kind: 'info', text: t('aquarium.splitGroup') })
    const duration = prefersReducedMotion.current ? 50 : 700
    const id = window.setTimeout(() => {
      setVisualTens(afterTens)
      setVisualOnes(afterOnes)
      setOpened(true)
      setAnimating(false)
      setPhase('enterOnesAnswer')
      setHighlight('ones')
      setFeedback({ kind: 'info', text: t('aquarium.enterOnes') })
    }, duration)
    timersRef.current.push(id)
  }, [animating, opened, afterTens, afterOnes, narrate, t])

  const handleHint = () => {
    playTap()
    if (phase === 'enterOnesAnswer' || phase === 'exchangeOrGroup') {
      const text = t('aquarium.hintOnes')
      setFeedback({ kind: 'info', text })
      narrate(text)
      setHighlight('ones')
    } else if (phase === 'enterTensAnswer') {
      const text = t('aquarium.hintTens')
      setFeedback({ kind: 'info', text })
      narrate(text)
      setHighlight('tens')
    } else if (!isAdd && borrowNeeded && !opened) {
      const text = t('aquarium.notEnough')
      setFeedback({ kind: 'info', text })
      narrate(text)
    } else if (isAdd && carryNeeded && !exchanged) {
      const text = t('aquarium.tenToGroup')
      setFeedback({ kind: 'info', text })
      narrate(text)
    } else {
      setFeedback({ kind: 'info', text: t('aquarium.tryAgain') })
      narrate(t('aquarium.tryAgain'))
    }
  }

  const handleRepeat = () => {
    playTap()
    repeatLastNarration(soundEnabled)
  }

  const handleCheck = () => {
    if (animating) return
    if (onesAnswer === null || tensAnswer === null) {
      const text = onesAnswer === null ? t('aquarium.enterOnes') : t('aquarium.enterTens')
      setFeedback({ kind: 'wrong', text })
      narrate(text)
      setHighlight(onesAnswer === null ? 'ones' : 'tens')
      return
    }
    const onesOk = isCorrectOnesAnswer(top, bottom, problem.operation, onesAnswer)
    const tensOk = isCorrectTensAnswer(top, bottom, problem.operation, tensAnswer)
    if (onesOk && tensOk) {
      if (hasCheckedOnce) return
      setHasCheckedOnce(true)
      setWrongOnes(false)
      setWrongTens(false)
      const successText =
        isAdd && carryNeeded
          ? t('aquarium.successCarry')
          : !isAdd && borrowNeeded
            ? t('aquarium.successBorrow')
            : t('aquarium.correctGeneral')
      setFeedback({ kind: 'correct', text: successText })
      narrate(successText)
      playReward()
      setPhase('completed')
      const id = window.setTimeout(() => {
        onComplete(wrongAttempts === 0, wrongAttempts)
      }, 800)
      timersRef.current.push(id)
    } else {
      setWrongOnes(!onesOk)
      setWrongTens(!tensOk)
      const attempts = wrongAttempts + 1
      setWrongAttempts(attempts)
      playTryAgain()
      const text = !onesOk ? t('aquarium.hintOnes') : t('aquarium.hintTens')
      setFeedback({ kind: 'wrong', text: t('aquarium.tryAgain') + ' ' + text })
      narrate(t('aquarium.tryAgain'))
      setHighlight(!onesOk ? 'ones' : 'tens')
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
    setSubtitle(null)
    setPhase('showQuestion')
  }

  const handleDigit = (digit: number) => {
    playTap()
    if (activeColumn === 'ones') {
      setOnesAnswer(digit)
      setWrongOnes(false)
      setActiveColumn('tens')
      setHighlight('tens')
      if (phase === 'enterOnesAnswer') {
        setPhase('enterTensAnswer')
      }
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
    onesAnswer !== null && tensAnswer !== null && !animating && phase !== 'completed' && phase !== 'intro'
  const isCompleted = phase === 'completed'

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
        <StackedOperationBoard
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

      <PlaceValueZones tens={visualTens} ones={visualOnes} highlight={highlight} />

      <AquariumCanvas
        tens={visualTens}
        ones={visualOnes}
        highlight={highlight}
        animating={animating}
        regroupProgress={exchanged ? 1 : 0}
        splitProgress={opened ? 1 : 0}
      />

      <div className="flex flex-wrap gap-2">
        {isAdd && carryNeeded && !exchanged && phase !== 'intro' && (
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
        {!isAdd && borrowNeeded && !opened && phase !== 'intro' && (
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
      </div>

      {subtitle && <NarrationSubtitle text={subtitle} />}

      <AquariumFeedbackPanel kind={feedback?.kind ?? null} text={feedback?.text ?? null} highlightColumn={highlight} />

      {isCompleted && (
        <RewardDecoration
          visible={isCompleted}
          text={`${t('aquarium.correctGeneral')} — ${top} ${isAdd ? '+' : '−'} ${bottom} = ${problem.expectedResult}`}
        />
      )}

      <div className="rounded-3xl border-2 border-slate-100 bg-white p-3 shadow-sm">
        <p className="mb-2 text-center text-xs font-black uppercase tracking-wide text-slate-500">
          {activeColumn === 'ones' ? t('aquarium.enterOnes') : t('aquarium.enterTens')} · ketuk kotak jawaban
          untuk ganti kolom
        </p>
        <NumericKeypad
          onDigit={handleDigit}
          onBackspace={handleBackspace}
          onCheck={handleCheck}
          checkDisabled={!canCheck}
          checkLabel={t('aquarium.check')}
          digitsDisabled={animating || isCompleted}
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
        {visualTens} kelompok puluhan, {visualOnes} ikan satuan. Pertanyaan {currentIndex + 1} dari {total}.
      </p>
    </div>
  )
}
