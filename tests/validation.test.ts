import { describe, expect, it } from 'vitest'
import { createT } from '../src/i18n/core'
import { buildProblem } from '../src/lib/problemGenerator'
import {
  checkAnswerDigits,
  getHint,
  requiredAnswerColumnIndexes,
  shouldOfferGuidedMode,
} from '../src/lib/validation'

const t = createT('id')

const problem2687 = buildProblem('addition', 26, 87)
const problem5228 = buildProblem('subtraction', 52, 28)

describe('checkAnswerDigits', () => {
  it('menerima jawaban benar 26 + 87 = 113', () => {
    const result = checkAnswerDigits(problem2687, [1, 1, 3])
    expect(result.allCorrect).toBe(true)
    expect(result.wrongColumnIndexes).toEqual([])
  })

  it('menyorot kolom yang salah saja, bukan seluruh jawaban', () => {
    const result = checkAnswerDigits(problem2687, [1, 1, 4])
    expect(result.allCorrect).toBe(false)
    expect(result.wrongColumnIndexes).toEqual([2])
  })

  it('jawaban kosong dihitung salah pada kolom wajib', () => {
    const result = checkAnswerDigits(problem2687, [null, 1, 3])
    expect(result.wrongColumnIndexes).toEqual([0])
  })

  it('1000 - 1: kolom ribuan tidak wajib diisi (tanpa leading zero)', () => {
    const problem = buildProblem('subtraction', 1000, 1)
    expect(requiredAnswerColumnIndexes(problem)).toEqual([1, 2, 3])
    const result = checkAnswerDigits(problem, [null, 9, 9, 9])
    expect(result.allCorrect).toBe(true)
  })
})

describe('getHint — bantuan bertahap', () => {
  it('percobaan pertama: petunjuk umum', () => {
    const hint = getHint(problem5228, 1, [1], t)
    expect(hint).toMatch(/mulai dari sebelah kanan|kolom satuan|pelan-pelan/)
  })

  it('percobaan kedua: menyebut kolom yang salah', () => {
    const hint = getHint(problem5228, 2, [0], t)
    expect(hint).toContain('puluhan')
  })

  it('percobaan ketiga: penjelasan detail sesuai jenis soal', () => {
    expect(getHint(problem5228, 3, [1], t)).toContain('pinjam')
    expect(getHint(problem2687, 3, [1], t)).toContain('simpan')
  })

  it('percobaan berikutnya: menawarkan mode panduan', () => {
    expect(shouldOfferGuidedMode(3)).toBe(true)
    expect(shouldOfferGuidedMode(2)).toBe(false)
    expect(getHint(problem5228, 5, [1], t)).toContain('langkah demi langkah')
  })
})
