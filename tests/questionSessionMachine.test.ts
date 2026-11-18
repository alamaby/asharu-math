import { describe, expect, it } from 'vitest'
import {
  initQuestionSessionState,
  questionSessionReducer,
} from '../src/lib/questionSessionMachine'

describe('questionSessionMachine (Pure Reducer)', () => {
  const sampleItems = ['soal-1', 'soal-2', 'soal-3']

  it('inisialisasi state dengan nilai awal yang benar', () => {
    const state = initQuestionSessionState(sampleItems)
    expect(state.items).toEqual(sampleItems)
    expect(state.index).toBe(0)
    expect(state.interim).toBe('')
    expect(state.attempts).toBe(0)
    expect(state.wrongInCurrent).toBe(0)
    expect(state.feedback).toBeNull()
    expect(state.phase).toBe('answering')
    expect(state.results).toEqual([])
  })

  it('inisialisasi daftar kosong langsung completed', () => {
    const state = initQuestionSessionState([])
    expect(state.phase).toBe('completed')
  })

  it('menangani input digit dan backspace saat fase answering', () => {
    let state = initQuestionSessionState(sampleItems)
    state = questionSessionReducer(state, { type: 'digit', digit: 4, maxLen: 3 })
    expect(state.interim).toBe('4')

    state = questionSessionReducer(state, { type: 'digit', digit: 2, maxLen: 3 })
    expect(state.interim).toBe('42')

    // Batas maxLen dipatuhi
    state = questionSessionReducer(state, { type: 'digit', digit: 9, maxLen: 3 })
    state = questionSessionReducer(state, { type: 'digit', digit: 7, maxLen: 3 })
    expect(state.interim).toBe('429')

    state = questionSessionReducer(state, { type: 'backspace' })
    expect(state.interim).toBe('42')
  })

  it('mengabaikan input digit dan backspace saat fase tidak answering (terkunci)', () => {
    let state = initQuestionSessionState(sampleItems)
    state = { ...state, phase: 'showing_correct' }

    const afterDigit = questionSessionReducer(state, { type: 'digit', digit: 5 })
    expect(afterDigit.interim).toBe('')

    const afterBackspace = questionSessionReducer(state, { type: 'backspace' })
    expect(afterBackspace.interim).toBe('')
  })

  it('transisi jawaban benar: beralih ke showing_correct', () => {
    let state = initQuestionSessionState(sampleItems)
    state = questionSessionReducer(state, {
      type: 'submit',
      isCorrect: true,
      feedback: { kind: 'correct', text: 'Bagus!' },
    })

    expect(state.phase).toBe('showing_correct')
    expect(state.feedback?.kind).toBe('correct')
    expect(state.wrongInCurrent).toBe(0)
  })

  it('transisi jawaban salah (< 3): beralih ke showing_wrong', () => {
    let state = initQuestionSessionState(sampleItems)
    state = questionSessionReducer(state, {
      type: 'submit',
      isCorrect: false,
      feedback: { kind: 'wrong', text: 'Coba lagi!' },
    })

    expect(state.phase).toBe('showing_wrong')
    expect(state.feedback?.kind).toBe('wrong')
    expect(state.attempts).toBe(1)
    expect(state.wrongInCurrent).toBe(1)

    // Unlock kembali ke answering
    state = questionSessionReducer(state, { type: 'unlock' })
    expect(state.phase).toBe('answering')
  })

  it('ambang batas 3 kali salah: beralih ke showing_reveal', () => {
    let state = initQuestionSessionState(sampleItems)

    // Salah ke-1
    state = questionSessionReducer(state, {
      type: 'submit',
      isCorrect: false,
      feedback: { kind: 'wrong', text: 'Salah 1' },
    })
    state = questionSessionReducer(state, { type: 'unlock' })

    // Salah ke-2
    state = questionSessionReducer(state, {
      type: 'submit',
      isCorrect: false,
      feedback: { kind: 'wrong', text: 'Salah 2' },
    })
    state = questionSessionReducer(state, { type: 'unlock' })

    // Salah ke-3 -> Terungkap
    state = questionSessionReducer(state, {
      type: 'submit',
      isCorrect: false,
      feedback: { kind: 'info', text: 'Jawaban benar adalah 42' },
      revealedInput: '42',
    })

    expect(state.phase).toBe('showing_reveal')
    expect(state.feedback?.kind).toBe('info')
    expect(state.interim).toBe('42')
    expect(state.attempts).toBe(0) // reset untuk soal berikutnya
    expect(state.wrongInCurrent).toBe(3)
  })

  it('advance mencatat hasil dan berpindah ke soal berikutnya', () => {
    let state = initQuestionSessionState(sampleItems)
    state = questionSessionReducer(state, {
      type: 'submit',
      isCorrect: true,
      feedback: { kind: 'correct', text: 'Benar!' },
    })

    state = questionSessionReducer(state, { type: 'advance' })
    expect(state.index).toBe(1)
    expect(state.phase).toBe('answering')
    expect(state.results).toHaveLength(1)
    expect(state.results[0]).toEqual({ item: 'soal-1', wrongAttempts: 0 })
    expect(state.feedback).toBeNull()
  })

  it('advance di soal terakhir mengubah fase ke completed', () => {
    let state = initQuestionSessionState(['soal-tunggal'])
    state = questionSessionReducer(state, {
      type: 'submit',
      isCorrect: true,
      feedback: { kind: 'correct', text: 'Benar!' },
    })

    state = questionSessionReducer(state, { type: 'advance' })
    expect(state.phase).toBe('completed')
    expect(state.results).toHaveLength(1)
    expect(state.results[0]).toEqual({ item: 'soal-tunggal', wrongAttempts: 0 })
  })

  it('advance diabaikan jika tidak sedang dalam fase showing_correct atau showing_reveal', () => {
    let state = initQuestionSessionState(sampleItems)
    const sameState = questionSessionReducer(state, { type: 'advance' })
    expect(sameState).toBe(state)
  })
})
