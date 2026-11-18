import { describe, expect, it } from 'vitest'
import {
  advanceActiveCol,
  columnSessionReducer,
  initColumnSessionState,
} from '../src/lib/columnSessionMachine'
import { buildProblem } from '../src/lib/problemGenerator'

describe('columnSessionMachine (Pure Reducer)', () => {
  const problem1 = buildProblem('addition', 24, 35) // 2-digit, 2 columns
  const problem2 = buildProblem('addition', 50, 20)

  it('inisialisasi state dengan kolom aktif di paling kanan (satuan)', () => {
    const state = initColumnSessionState([problem1, problem2], null, 'Latihan')
    expect(state.problems.length).toBe(2)
    expect(state.index).toBe(0)
    expect(state.activeCol).toBe(1) // Satuan di index 1
    expect(state.given).toEqual([null, null])
    expect(state.locked).toBe(false)
    expect(state.finished).toBe(false)
  })

  it('advanceActiveCol berpindah ke kolom kosong di sebelah kiri', () => {
    const given: (number | null)[] = [null, 9] // Satuan terisi
    const nextCol = advanceActiveCol(problem1, given, 1)
    expect(nextCol).toBe(0) // Pindah ke puluhan
  })

  it('aksi digit mengisi angka dan memajukan kolom aktif', () => {
    const state = initColumnSessionState([problem1], null, 'Latihan')
    const next = columnSessionReducer(state, { type: 'digit', digit: 9 })
    expect(next.given).toEqual([null, 9])
    expect(next.activeCol).toBe(0) // Pindah ke puluhan
  })

  it('aksi backspace menghapus angka di kolom aktif', () => {
    let state = initColumnSessionState([problem1], null, 'Latihan')
    state = columnSessionReducer(state, { type: 'digit', digit: 9 })
    const backspaced = columnSessionReducer(state, { type: 'backspace' })
    expect(backspaced.given[state.activeCol]).toBeNull()
  })

  it('aksi select_col mengubah kolom aktif secara manual', () => {
    const state = initColumnSessionState([problem1], null, 'Latihan')
    const next = columnSessionReducer(state, { type: 'select_col', columnIndex: 0 })
    expect(next.activeCol).toBe(0)
  })

  it('aksi check_correct mengunci state dan memberi umpan balik', () => {
    const state = initColumnSessionState([problem1], null, 'Latihan')
    const next = columnSessionReducer(state, { type: 'check_correct', praise: 'Hebat!' })
    expect(next.locked).toBe(true)
    expect(next.feedback?.kind).toBe('correct')
    expect(next.feedback?.text).toBe('Hebat!')
  })

  it('aksi check_wrong mencatat percobaan salah, hint, dan offerHelp', () => {
    const state = initColumnSessionState([problem1], null, 'Latihan')
    const next = columnSessionReducer(state, {
      type: 'check_wrong',
      wrongCols: [1],
      feedbackText: 'Coba lagi!',
      hint: 'Mulai dari satuan',
      offerHelp: true,
    })
    expect(next.locked).toBe(true)
    expect(next.attempts).toBe(1)
    expect(next.wrongInProblem).toBe(1)
    expect(next.wrongCols).toEqual([1])
    expect(next.hint).toBe('Mulai dari satuan')
    expect(next.offerHelp).toBe(true)
  })

  it('aksi unlock membuka kembali kunci interaksi', () => {
    let state = initColumnSessionState([problem1], null, 'Latihan')
    state = columnSessionReducer(state, {
      type: 'check_wrong',
      wrongCols: [1],
      feedbackText: 'Coba lagi!',
      hint: null,
      offerHelp: false,
    })
    expect(state.locked).toBe(true)
    const unlocked = columnSessionReducer(state, { type: 'unlock' })
    expect(unlocked.locked).toBe(false)
  })

  it('aksi advance berpindah ke soal berikutnya bila masih ada soal tersisa', () => {
    let state = initColumnSessionState([problem1, problem2], null, 'Latihan')
    state = columnSessionReducer(state, {
      type: 'advance',
      nextProblemFeedbackText: 'Soal berikutnya!',
    })
    expect(state.index).toBe(1)
    expect(state.results.length).toBe(1)
    expect(state.results[0].problem).toBe(problem1)
    expect(state.finished).toBe(false)
    expect(state.locked).toBe(false)
  })

  it('aksi advance menandai finished=true bila soal terakhir telah selesai', () => {
    let state = initColumnSessionState([problem1], null, 'Latihan')
    state = columnSessionReducer(state, {
      type: 'advance',
      nextProblemFeedbackText: 'Selesai!',
    })
    expect(state.results.length).toBe(1)
    expect(state.finished).toBe(true)
    expect(state.locked).toBe(true)
  })

  it('aksi dismiss_help menutup penawaran bantuan', () => {
    let state = initColumnSessionState([problem1], null, 'Latihan')
    state = columnSessionReducer(state, {
      type: 'check_wrong',
      wrongCols: [],
      feedbackText: 'Salah',
      hint: null,
      offerHelp: true,
    })
    expect(state.offerHelp).toBe(true)
    const next = columnSessionReducer(state, { type: 'dismiss_help' })
    expect(next.offerHelp).toBe(false)
  })
})
