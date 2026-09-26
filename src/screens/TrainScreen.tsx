import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import TrainCanvas from '../components/train/TrainCanvas'
import type { TrainCameraMode, TrainScene } from '../components/train/TrainScene'
import TrainCelebration from '../components/train/TrainCelebration'
import TrainMenu from '../components/train/TrainMenu'
import TrainHUD from '../components/train/TrainHUD'
import QuestionDialog from '../components/train/QuestionDialog'
import ConfirmDialog from '../components/common/ConfirmDialog'
import Mascot from '../components/layout/Mascot'
import { useI18n } from '../i18n/LanguageContext'
import { useNavigation } from '../state/NavigationContext'
import { useProgress } from '../state/ProgressContext'
import { setSoundEnabled } from '../lib/sound'
import {
  generateTrainSession,
  type TrainGrade,
  type TrainQuestion,
} from '../lib/trainQuestionGenerator'
import { starsForTrainAttempt, sumTrainStars } from '../lib/trainStars'
import { resumeTrain, type TrainState } from '../lib/trainStateMachine'
import {
  clearTrainSession,
  defaultTrainProgress,
  loadTrainProgress,
  loadTrainSession,
  recordTrainSession,
  saveTrainProgress,
  saveTrainSession,
  type TrainSessionSnapshot,
} from '../lib/trainStorage'
import {
  playTrainCelebrate,
  playTrainClick,
  playTrainHint,
  playTrainStar,
  playTrainSwitch,
  playTrainWhistle,
  playTrainWrong,
  repeatTrainNarration,
  speakTrain,
  stopTrainAudio,
  stopTrainSpeech,
} from '../lib/trainSound'
import {
  setChugRate,
  setMusicDucked,
  setMusicIntensity,
  startChug,
  startTrainMusic,
  stopAllTrainAudio,
  stopChug,
  stopTrainMusic,
} from '../lib/trainMusic'
import { speakablePrompt } from '../lib/trainNarration'
import { pickTrainVariant, type TrainVariant } from '../lib/trainVariants'
import type { SessionSummary } from '../types'

const TOTAL_QUESTIONS = 5

export default function TrainScreen() {
  const { navigate, setLeaveGuard, confirmPendingNavigation, cancelPendingNavigation } =
    useNavigation()
  const { progress, setPreferences } = useProgress()
  const { lang, t } = useI18n()

  const [phase, setPhase] = useState<TrainState>('LOADING')
  const [grade, setGrade] = useState<TrainGrade | null>(null)
  const [questions, setQuestions] = useState<TrainQuestion[]>([])
  const [round, setRound] = useState(0)
  const [attempts, setAttempts] = useState(0)
  const [attemptsLog, setAttemptsLog] = useState<number[]>([])
  const [feedback, setFeedback] = useState<{
    kind: 'correct' | 'wrong' | 'info'
    text: string
  } | null>(null)
  const [showHint, setShowHint] = useState(false)
  const [pausedFrom, setPausedFrom] = useState<TrainState | null>(null)
  const [muted, setMuted] = useState(() => !loadTrainProgress().soundEnabled)
  const [musicOn, setMusicOn] = useState(() => loadTrainProgress().musicEnabled ?? true)
  const [voiceOn, setVoiceOn] = useState(() => loadTrainProgress().voiceEnabled ?? true)
  const [resumable, setResumable] = useState<TrainSessionSnapshot | null>(() => loadTrainSession())
  const [variant, setVariant] = useState<TrainVariant | null>(null)
  const [celebrate, setCelebrate] = useState(false)
  const [cameraMode, setCameraMode] = useState<TrainCameraMode>('fixed')
  const [best, setBest] = useState<Record<string, number>>(
    () => loadTrainProgress().bestStarsByGrade,
  )
  const [exitOpen, setExitOpen] = useState(false)

  // Flag efektif: preferensi layar kereta AND saklar suara global (header).
  // Tanpa ini, mute dari header tidak menghentikan musik/narasi kereta.
  const sfxOn = !muted && progress.soundEnabled
  const musicActive = musicOn && progress.soundEnabled
  const voiceActive = voiceOn && progress.soundEnabled

  const sceneRef = useRef<TrainScene | null>(null)
  const timersRef = useRef<number[]>([])
  const finishedRef = useRef(false)
  const phaseRef = useRef<TrainState>('LOADING')
  // Kunci sinkron anti-jawaban-ganda: menutup race antara commit React dan
  // flush passive effect (phaseRef masih basi) pada tap cepat beruntun.
  const answeringRef = useRef(false)

  useEffect(() => {
    phaseRef.current = phase
  }, [phase])

  const reducedMotion = useMemo(() => {
    if (!progress.animationsEnabled) return true
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches
    }
    return false
  }, [progress.animationsEnabled])

  const clearTimers = useCallback(() => {
    for (const id of timersRef.current) window.clearTimeout(id)
    timersRef.current = []
  }, [])

  const later = useCallback(
    (ms: number, fn: () => void) => {
      const id = window.setTimeout(fn, reducedMotion ? Math.min(ms, 150) : ms)
      timersRef.current.push(id)
    },
    [reducedMotion],
  )

  const narrate = useCallback(
    (text: string) => {
      speakTrain(text, voiceActive)
    },
    [voiceActive],
  )

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setPhase('MENU')
    return () => {
      clearTimers()
      stopTrainAudio()
      stopAllTrainAudio()
      stopTrainSpeech()
    }
  }, [clearTimers])
  /* eslint-enable react-hooks/set-state-in-effect */

  const question = questions[round] ?? null
  const starsSoFar = useMemo(() => sumTrainStars(attemptsLog), [attemptsLog])
  useEffect(() => {
    if (grade !== null && phase !== 'MENU') {
      sceneRef.current?.setStationBoard(t('train.stationShort'), `★ ${starsSoFar}`)
    }
  }, [starsSoFar, grade, phase, t])
  const announceText = useMemo(() => {
    if (phase === 'MENU') return t('train.subtitle')
    if (!question) return ''
    const base = `${t('train.questionOf', { n: round + 1, total: TOTAL_QUESTIONS })}: ${question.prompt}.`
    if (feedback) return `${base} ${feedback.text}`
    return base
  }, [phase, question, round, feedback, t])

  const openExit = useCallback(() => setExitOpen(true), [])
  // Sinkron saklar global (header): saat dimatikan, hentikan musik/chug/narasi
  // seketika; saat dinyalakan lagi, mulai ulang musik bila sesi berjalan.
  useEffect(() => {
    if (!progress.soundEnabled) {
      stopTrainMusic()
      stopChug()
      stopTrainSpeech()
      setMusicDucked(false)
      return
    }
    if (musicOn && grade !== null && !finishedRef.current && phaseRef.current !== 'PAUSED') {
      startTrainMusic()
      const ph = phaseRef.current
      if (ph === 'TRAIN_MOVING' || ph === 'TRAVELLING_TO_STATION') startChug()
    }
  }, [progress.soundEnabled, musicOn, grade])
  useEffect(() => {
    if (finishedRef.current || phase === 'MENU' || phase === 'SESSION_COMPLETE') {
      setLeaveGuard(null)
      return
    }
    setLeaveGuard(openExit)
    return () => setLeaveGuard(null)
  }, [setLeaveGuard, openExit, phase, round])

  const handleStart = useCallback(
    (g: TrainGrade) => {
      if (sfxOn) playTrainClick()
      clearTimers()
      finishedRef.current = false
      answeringRef.current = false
      setGrade(g)
      const qs = generateTrainSession(g, TOTAL_QUESTIONS)
      setQuestions(qs)
      setRound(0)
      setAttempts(0)
      setAttemptsLog([])
      setFeedback(null)
      setShowHint(false)
      setPausedFrom(null)
      setCelebrate(false)
      sceneRef.current?.reset()
      setCameraMode('follow')
      setPhase('INTRO')
      if (sfxOn) playTrainWhistle()
      if (musicActive) {
        startTrainMusic()
        startChug()
        setChugRate(reducedMotion ? 180 : 300)
      }
      setMusicIntensity(1)
      const v = pickTrainVariant()
      setVariant(v)
      saveTrainSession(
        {
          version: 1,
          grade: g,
          questions: qs,
          round: 0,
          attemptsLog: [],
          savedAt: Date.now(),
          variant: v,
        },
        undefined,
      )
      setResumable(null)
      later(800, () => {
        if (phaseRef.current === 'INTRO') setPhase('TRAIN_MOVING')
      })
    },
    [clearTimers, later, sfxOn, musicActive, reducedMotion],
  )

  const handleResumeSession = useCallback(() => {
    if (!resumable) return
    if (sfxOn) playTrainClick()
    clearTimers()
    finishedRef.current = false
    answeringRef.current = false
    setGrade(resumable.grade)
    setQuestions(resumable.questions)
    setRound(resumable.round)
    setAttempts(0)
    setAttemptsLog(resumable.attemptsLog)
    setFeedback(null)
    setShowHint(false)
    setPausedFrom(null)
    setCelebrate(false)
    sceneRef.current?.reset()
    setCameraMode('follow')
    setPhase('INTRO')
    if (sfxOn) playTrainWhistle()
    if (musicActive) {
      startTrainMusic()
      startChug()
      setChugRate(reducedMotion ? 180 : 300)
    }
    setMusicIntensity(resumable.round < 2 ? 1 : resumable.round < 4 ? 2 : 3)
    setVariant(resumable.variant ?? pickTrainVariant())
    setResumable(null)
    later(800, () => {
      if (phaseRef.current === 'INTRO') setPhase('TRAIN_MOVING')
    })
  }, [clearTimers, later, sfxOn, musicActive, reducedMotion, resumable])

  const finishSession = useCallback(
    (log: number[], g: TrainGrade) => {
      finishedRef.current = true
      const stars = sumTrainStars(log)
      const displayStars = stars >= 13 ? 3 : stars >= 9 ? 2 : 1
      if (sfxOn) playTrainCelebrate()
      answeringRef.current = false
      stopAllTrainAudio()
      setMusicDucked(false)
      clearTrainSession(undefined)
      const prev = loadTrainProgress()
      const next = recordTrainSession(prev, g, stars)
      saveTrainProgress(next, undefined)
      setBest(next.bestStarsByGrade)
      const summary: SessionSummary = {
        title: t('train.title'),
        totalQuestions: TOTAL_QUESTIONS,
        correctFirstTry: log.filter((a) => a === 1).length,
        wrongAttempts: log.reduce((s, a) => s + (a - 1), 0),
        recovered: log.filter((a) => a > 1).length,
        stars: displayStars,
        levelId: null,
        settings: null,
        nextLevelId: null,
        newAchievementIds: [],
      }
      setLeaveGuard(null)
      navigate({ name: 'result', summary })
    },
    [sfxOn, navigate, setLeaveGuard, t],
  )

  const handleReachJunction = useCallback(() => {
    if (phaseRef.current !== 'TRAIN_MOVING') return
    setPhase('APPROACHING_JUNCTION')
    setCameraMode('junction')
    later(400, () => {
      if (phaseRef.current === 'APPROACHING_JUNCTION') setPhase('WAITING_FOR_ANSWER')
      const q = questions[round]
      if (q) {
        narrate(
          `${t('train.questionOf', { n: round + 1, total: TOTAL_QUESTIONS })}. ${speakablePrompt(q, lang)}.`,
        )
      }
    })
  }, [lang, later, narrate, questions, round, t])

  const handleReachStation = useCallback(() => {
    if (phaseRef.current !== 'TRAVELLING_TO_STATION') return
    setPhase('ROUND_COMPLETE')
    setCameraMode('station')
    sceneRef.current?.celebrateAtStation()
    if (sfxOn) playTrainWhistle()
    later(600, () => {
      const g = grade
      const log = attemptsLog
      if (!g) return
      if (round + 1 < TOTAL_QUESTIONS) {
        setRound((r) => r + 1)
        setAttempts(0)
        answeringRef.current = false
        setFeedback(null)
        setShowHint(false)
        sceneRef.current?.reset()
        setCameraMode('follow')
        setMusicIntensity(round + 1 < 2 ? 1 : round + 1 < 4 ? 2 : 3)
        if (grade) {
          saveTrainSession(
            {
              version: 1,
              grade,
              questions,
              round: round + 1,
              attemptsLog: log,
              savedAt: Date.now(),
              variant: variant ?? undefined,
            },
            undefined,
          )
        }
        setPhase('TRAIN_MOVING')
      } else {
        setPhase('SESSION_COMPLETE')
        finishSession(log, g)
      }
    })
  }, [attemptsLog, finishSession, grade, later, sfxOn, questions, round, variant])

  const handleAnswer = useCallback(
    (choiceIndex: 0 | 1 | 2) => {
      const q = questions[round]
      if (!q) {
        setPhase('ERROR')
        return
      }
      if (phaseRef.current !== 'WAITING_FOR_ANSWER' && phaseRef.current !== 'SHOWING_HINT') return
      if (answeringRef.current) return
      answeringRef.current = true
      setPhase('CHECKING_ANSWER')
      if (choiceIndex === q.correctIndex) {
        if (sfxOn) playTrainStar(starsForTrainAttempt(attempts + 1))
        const attemptCount = attempts + 1
        const nextLog = [...attemptsLog, attemptCount]
        setAttemptsLog(nextLog)
        setFeedback({ kind: 'correct', text: t('train.correct') })
        setPhase('SWITCHING_TRACK')
        sceneRef.current?.setBranch(choiceIndex)
        sceneRef.current?.setSelectedGlow(choiceIndex)
        sceneRef.current?.setSignal(choiceIndex, true)
        sceneRef.current?.waveDriver()
        if (sfxOn) playTrainSwitch()
        setCameraMode('follow')
        setMusicDucked(true)
        setCelebrate(true)
        later(300, () => narrate(t('train.correct')))
        later(600, () => setMusicDucked(false))
        later(1200, () => setCelebrate(false))
        later(900, () => {
          if (phaseRef.current === 'SWITCHING_TRACK') setPhase('TRAVELLING_TO_STATION')
        })
      } else {
        if (sfxOn) playTrainWrong()
        const nextAttempts = attempts + 1
        setAttempts(nextAttempts)
        setFeedback({ kind: 'wrong', text: t('train.retry') })
        sceneRef.current?.setSignal(choiceIndex, false)
        later(300, () => narrate(t('train.retry')))
        if (nextAttempts >= 2) {
          if (sfxOn) playTrainHint()
          setShowHint(true)
          later(900, () => {
            const q = questions[round]
            if (q) narrate(`${t('train.hintTitle')}. ${q.hintText}`)
          })
          setPhase('SHOWING_HINT')
          later(800, () => {
            if (phaseRef.current === 'SHOWING_HINT') {
              answeringRef.current = false
              setPhase('WAITING_FOR_ANSWER')
            }
          })
        } else {
          later(400, () => {
            if (phaseRef.current === 'CHECKING_ANSWER') {
              answeringRef.current = false
              setPhase('WAITING_FOR_ANSWER')
            }
          })
        }
      }
    },
    [attempts, attemptsLog, later, sfxOn, narrate, questions, round, t],
  )

  const handlePause = useCallback(() => {
    const current = phaseRef.current
    if (
      current === 'TRAIN_MOVING' ||
      current === 'WAITING_FOR_ANSWER' ||
      current === 'APPROACHING_JUNCTION'
    ) {
      setPausedFrom(current)
      setPhase('PAUSED')
      sceneRef.current?.setPaused(true)
      stopChug()
      stopTrainSpeech()
    }
  }, [])

  const handleResume = useCallback(() => {
    if (!pausedFrom) return
    try {
      const back = resumeTrain(pausedFrom)
      setPhase(back)
      sceneRef.current?.setPaused(false)
      setPausedFrom(null)
      if (sfxOn) playTrainClick()
      if (musicActive) startChug()
    } catch {
      setPhase('MENU')
      setPausedFrom(null)
    }
  }, [sfxOn, musicActive, pausedFrom])

  const handleToggleMute = useCallback(() => {
    // Toggle state EFEKTIF: bila sedang bisu (dari HUD maupun header),
    // klik berarti menyalakan semua; bila berbunyi berarti membisukan semua.
    const nextMuted = !muted && progress.soundEnabled
    setMuted(nextMuted)
    const nextEnabled = !nextMuted
    saveTrainProgress({ ...loadTrainProgress(), soundEnabled: nextEnabled }, undefined)
    setPreferences({ soundEnabled: nextEnabled })
    setSoundEnabled(nextEnabled)
    if (nextEnabled) playTrainClick()
  }, [muted, progress.soundEnabled, setPreferences])

  const handleToggleMusic = useCallback(() => {
    const next = !musicOn
    setMusicOn(next)
    saveTrainProgress({ ...loadTrainProgress(), musicEnabled: next }, undefined)
    if (next && progress.soundEnabled) {
      startTrainMusic()
      if (phaseRef.current === 'TRAIN_MOVING' || phaseRef.current === 'TRAVELLING_TO_STATION') {
        startChug()
      }
    } else {
      stopTrainMusic()
      stopChug()
    }
  }, [musicOn, progress.soundEnabled])

  const handleToggleVoice = useCallback(() => {
    const next = !voiceOn
    setVoiceOn(next)
    saveTrainProgress({ ...loadTrainProgress(), voiceEnabled: next }, undefined)
    if (!next) stopTrainSpeech()
  }, [voiceOn])

  const handleRepeatNarration = useCallback(() => {
    repeatTrainNarration(voiceOn)
  }, [voiceOn])

  const handleQuit = useCallback(() => {
    setExitOpen(true)
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (exitOpen) return
      if (e.key === 'Escape' && phaseRef.current !== 'MENU' && phaseRef.current !== 'PAUSED') {
        handlePause()
        return
      }
      if (e.key === 'm' || e.key === 'M') {
        handleToggleMute()
        return
      }
      if (e.key === 'n' || e.key === 'N') {
        handleToggleMusic()
        return
      }
      if (e.key === 'r' || e.key === 'R') {
        handleRepeatNarration()
        return
      }
      if (phaseRef.current === 'PAUSED' || phaseRef.current === 'MENU') return
      if (e.key === '1' || e.key === '2' || e.key === '3') {
        const idx = (Number(e.key) - 1) as 0 | 1 | 2
        handleAnswer(idx)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [
    exitOpen,
    handleAnswer,
    handlePause,
    handleRepeatNarration,
    handleToggleMute,
    handleToggleMusic,
  ])

  if (phase === 'LOADING') {
    return (
      <div className="py-10 text-center">
        <Mascot mood="cheer" size={96} />
        <p className="mt-4 text-sm font-bold text-slate-500">Menyiapkan kereta…</p>
      </div>
    )
  }

  if (phase === 'MENU' || grade === null) {
    return (
      <div className="space-y-4">
        <TrainMenu
          onStart={handleStart}
          bestStarsByGrade={best}
          resumeInfo={
            resumable
              ? { grade: resumable.grade, round: resumable.round, total: TOTAL_QUESTIONS }
              : null
          }
          onResume={handleResumeSession}
        />
        <p className="sr-only" aria-live="polite">
          {announceText}
        </p>
      </div>
    )
  }

  if (!question) {
    return (
      <div className="py-10 text-center">
        <p role="alert" className="text-sm font-bold text-amber-800">
          {t('train.fallbackMsg')}
        </p>
      </div>
    )
  }

  const paused = phase === 'PAUSED'
  const dialogDisabled = phase !== 'WAITING_FOR_ANSWER' && phase !== 'SHOWING_HINT'

  return (
    <div className="space-y-4">
      <TrainHUD
        round={round}
        total={TOTAL_QUESTIONS}
        stars={starsSoFar}
        muted={muted || !progress.soundEnabled}
        paused={paused}
        musicOn={musicOn && progress.soundEnabled}
        voiceOn={voiceOn && progress.soundEnabled}
        onToggleMute={handleToggleMute}
        onToggleMusic={handleToggleMusic}
        onToggleVoice={handleToggleVoice}
        onRepeatNarration={handleRepeatNarration}
        onPause={handlePause}
        onQuit={handleQuit}
      />
      <TrainCanvas
        paused={paused}
        reducedMotion={reducedMotion}
        onReachJunction={handleReachJunction}
        onReachStation={handleReachStation}
        sceneRef={sceneRef}
        themeGrade={grade}
        cameraMode={cameraMode}
        boardAnswers={question ? question.choices : null}
        stationLabel={t('train.stationShort')}
        trainVariant={variant}
      />
      <TrainCelebration
        show={celebrate}
        tone={grade === 2 ? 'farm' : grade === 3 ? 'dusk' : 'flowers'}
      />
      {(phase === 'WAITING_FOR_ANSWER' ||
        phase === 'SHOWING_HINT' ||
        phase === 'CHECKING_ANSWER' ||
        phase === 'SWITCHING_TRACK' ||
        phase === 'APPROACHING_JUNCTION') && (
        <QuestionDialog
          question={question}
          round={round}
          total={TOTAL_QUESTIONS}
          attempts={attempts}
          showHint={showHint}
          feedback={feedback}
          disabled={dialogDisabled}
          onAnswer={handleAnswer}
        />
      )}
      {phase === 'INTRO' || phase === 'TRAIN_MOVING' ? (
        <p className="text-center text-sm font-bold text-slate-500" aria-live="polite">
          🚂 {t('train.subtitle')}
        </p>
      ) : null}
      {paused && (
        <div className="rounded-3xl border-2 border-slate-200 bg-white p-4 text-center shadow-sm">
          <p className="text-base font-black text-slate-700">{t('train.paused')}</p>
          <div className="mt-2 flex flex-wrap justify-center gap-2">
            <button
              type="button"
              onClick={handleResume}
              className="min-h-11 rounded-2xl border-b-4 border-emerald-600 bg-emerald-500 px-4 text-sm font-black text-white hover:bg-emerald-400 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-300"
            >
              {t('train.resume')}
            </button>
            <button
              type="button"
              onClick={() => grade && handleStart(grade)}
              className="min-h-11 rounded-2xl border-2 border-slate-200 bg-white px-4 text-sm font-bold text-slate-600 hover:bg-sky-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-300"
            >
              {t('train.restart')}
            </button>
          </div>
        </div>
      )}
      <p className="sr-only" aria-live="polite">
        {announceText}
      </p>
      <ConfirmDialog
        open={exitOpen}
        title={t('train.quit')}
        description={t('learn.exitDesc')}
        confirmLabel={t('learn.exitConfirm')}
        cancelLabel={t('learn.exitCancel')}
        danger
        onConfirm={() => {
          setExitOpen(false)
          clearTimers()
          finishedRef.current = true
          answeringRef.current = false
          setLeaveGuard(null)
          stopAllTrainAudio()
          stopTrainSpeech()
          setMusicDucked(false)
          clearTrainSession(undefined)
          void defaultTrainProgress
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
