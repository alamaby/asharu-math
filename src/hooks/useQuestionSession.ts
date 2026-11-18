import { useCallback, useEffect, useReducer, useRef } from 'react'
import type { Feedback } from '../components/guide/FeedbackMessage'
import { playCorrect, playWrong } from '../lib/sound'
import {
  initQuestionSessionState,
  questionSessionReducer,
  type QuestionResult,
} from '../lib/questionSessionMachine'

export interface UseQuestionSessionOptions<TItem> {
  items: TItem[]
  onComplete: (results: QuestionResult<TItem>[]) => void
  advanceDelayMs?: number
  revealDelayMs?: number
  unlockDelayMs?: number
}

/**
 * Hook terpadu untuk mengelola siklus hidup sesi kuis (Concept & Story).
 * Menjamin:
 * 1. Tidak ada race condition / double-tap karena state diatur oleh explicit machine.
 * 2. Timer penundaan otomatis dibersihkan saat unmount atau transisi fase.
 * 3. Efek suara terpicu secara konsisten sesuai jenis feedback.
 */
export function useQuestionSession<TItem>({
  items,
  onComplete,
  advanceDelayMs = 700,
  revealDelayMs = 1200,
  unlockDelayMs = 600,
}: UseQuestionSessionOptions<TItem>) {
  const [state, dispatch] = useReducer(
    questionSessionReducer<TItem>,
    items,
    initQuestionSessionState,
  )

  const onCompleteRef = useRef(onComplete)
  useEffect(() => {
    onCompleteRef.current = onComplete
  }, [onComplete])

  const completedReportedRef = useRef(false)

  // Timer scheduling berbasis status eksplisit
  useEffect(() => {
    if (state.phase === 'showing_correct') {
      const timer = window.setTimeout(() => dispatch({ type: 'advance' }), advanceDelayMs)
      return () => window.clearTimeout(timer)
    }
    if (state.phase === 'showing_reveal') {
      const timer = window.setTimeout(() => dispatch({ type: 'advance' }), revealDelayMs)
      return () => window.clearTimeout(timer)
    }
    if (state.phase === 'showing_wrong') {
      const timer = window.setTimeout(() => dispatch({ type: 'unlock' }), unlockDelayMs)
      return () => window.clearTimeout(timer)
    }
    if (state.phase === 'completed' && !completedReportedRef.current) {
      completedReportedRef.current = true
      onCompleteRef.current(state.results)
    }
  }, [state.phase, state.results, advanceDelayMs, revealDelayMs, unlockDelayMs])

  // Efek suara sinkron dengan umpan balik
  useEffect(() => {
    if (!state.feedback) return
    if (state.feedback.kind === 'correct') playCorrect()
    else if (state.feedback.kind === 'wrong') playWrong()
  }, [state.feedback])

  const handleDigit = useCallback((digit: number, maxLen?: number) => {
    dispatch({ type: 'digit', digit, maxLen })
  }, [])

  const handleBackspace = useCallback(() => {
    dispatch({ type: 'backspace' })
  }, [])

  const setInterim = useCallback((value: string) => {
    dispatch({ type: 'set_interim', value })
  }, [])

  const submitAnswer = useCallback(
    (isCorrect: boolean, feedback: Feedback, revealedInput?: string) => {
      dispatch({ type: 'submit', isCorrect, feedback, revealedInput })
    },
    [],
  )

  return {
    state,
    currentItem: state.items[state.index] as TItem | undefined,
    isLocked: state.phase !== 'answering',
    isCompleted: state.phase === 'completed',
    interim: state.interim,
    attempts: state.attempts,
    wrongInCurrent: state.wrongInCurrent,
    feedback: state.feedback,
    index: state.index,
    totalItems: state.items.length,
    results: state.results,
    handleDigit,
    handleBackspace,
    setInterim,
    submitAnswer,
    dispatch,
  }
}
