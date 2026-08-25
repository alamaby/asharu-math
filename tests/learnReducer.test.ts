import { describe, expect, it } from 'vitest'
import { buildProblem } from '../src/lib/problemGenerator'
import {
  initState,
  learnReducer,
  type LearnAction,
  type LearnState,
} from '../src/screens/LearnScreen'
import type { MathProblem } from '../src/types'

const digit = (d: number): LearnAction => ({ type: 'digit', digit: d })

function ketik(state: LearnState, teks: string): LearnState {
  let s = state
  for (const ch of teks) s = learnReducer(s, digit(Number(ch)))
  return s
}

/** Menjalankan seluruh langkah satu soal dengan jawaban benar. */
function kerjakan(state: LearnState, problem: MathProblem): LearnState {
  let s = state
  for (const step of problem.learningSteps) {
    if (step.kind === 'interim-sum') {
      s = ketik(s, String(step.expected))
      s = learnReducer(s, { type: 'check-interim' })
      s = learnReducer(s, { type: 'next' })
    } else if (step.kind === 'answer-digit' || step.kind === 'carry-digit') {
      s = learnReducer(s, digit(step.expectedDigit))
      s = learnReducer(s, { type: 'next' })
    } else if (step.kind === 'borrow-question') {
      s = learnReducer(s, { type: 'choose', answer: 'tidak-bisa' })
      s = learnReducer(s, { type: 'next' })
    } else {
      // intro, borrow-explain, review: langsung lanjut
      s = learnReducer(s, { type: 'next' })
    }
  }
  return s
}

describe('reducer mode belajar — alur ketik-sekali', () => {
  it('jawaban digit benar melengkapi langkah dan menjadwalkan auto-lanjut', () => {
    const problem = buildProblem('addition', 23, 14) // tanpa carry
    let s = initState([problem])
    s = learnReducer(s, { type: 'next' }) // intro → interim satuan
    s = ketik(s, '7') // 3 + 4 = 7
    s = learnReducer(s, { type: 'check-interim' })
    expect(s.stepComplete).toBe(true)
    expect(s.autoAdvanceToken).not.toBeNull()
    s = learnReducer(s, { type: 'next' }) // → jawaban satuan
    expect(s.autoAdvanceToken).toBeNull()
    s = learnReducer(s, digit(7))
    expect(s.stepComplete).toBe(true)
    expect(s.answers[1]).toBe(7)
    expect(s.autoAdvanceToken).not.toBeNull()
  })

  it('interim salah dikosongkan untuk dicoba ulang, benar lalu auto-lanjut', () => {
    const problem = buildProblem('addition', 26, 87) // satuan 6 + 7 = 13
    let s = initState([problem])
    s = learnReducer(s, { type: 'next' })
    s = ketik(s, '99')
    s = learnReducer(s, { type: 'check-interim' })
    expect(s.stepComplete).toBe(false)
    expect(s.interim).toBe('')
    expect(s.attempts).toBe(1)
    expect(s.autoAdvanceToken).toBeNull()

    s = ketik(s, '13')
    s = learnReducer(s, { type: 'check-interim' })
    expect(s.stepComplete).toBe(true)
    expect(s.autoAdvanceToken).not.toBeNull()
  })

  it('setelah 3 kali salah, jawaban diungkap TANPA auto-lanjut agar anak membacanya', () => {
    const problem = buildProblem('addition', 23, 14)
    let s = initState([problem])
    s = learnReducer(s, { type: 'next' })
    s = learnReducer(s, { type: 'check-interim' }) // salah ke-1 (kosong)
    s = learnReducer(s, { type: 'check-interim' }) // salah ke-2
    s = learnReducer(s, { type: 'check-interim' }) // salah ke-3 → ungkap
    expect(s.stepComplete).toBe(true)
    expect(s.interim).toBe('7')
    expect(s.feedback?.kind).toBe('info')
    expect(s.autoAdvanceToken).toBeNull()
  })

  it('pilihan pinjam benar auto-lanjut ke penjelasan (tanpa token baru)', () => {
    const problem = buildProblem('subtraction', 52, 28)
    let s = initState([problem])
    s = learnReducer(s, { type: 'next' }) // intro → pertanyaan pinjam
    s = learnReducer(s, { type: 'choose', answer: 'tidak-bisa' })
    expect(s.stepComplete).toBe(true)
    expect(s.autoAdvanceToken).not.toBeNull()
    s = learnReducer(s, { type: 'next' }) // → penjelasan pinjam
    expect(s.problems[0].learningSteps[s.stepIndex].kind).toBe('borrow-explain')
    expect(s.autoAdvanceToken).toBeNull()
  })

  it('satuan soal selesai dengan benar sampai review mengisi jawaban lengkap', () => {
    const problem = buildProblem('addition', 26, 87)
    const s = kerjakan(initState([problem]), problem)
    expect(s.finished).toBe(true)
    expect(s.answers.join('')).toBe('113')
    expect(s.carries.join('')).toBe('11')
    expect(s.results[0].wrongAttempts).toBe(0)
  })

  it('pengurangan berantai 1000 - 1 selesai sampai hasil 999', () => {
    const problem = buildProblem('subtraction', 1000, 1)
    const s = kerjakan(initState([problem]), problem)
    expect(s.finished).toBe(true)
    expect(s.answers.join('')).toBe('999') // kolom ribuan tetap kosong/null
  })
})
