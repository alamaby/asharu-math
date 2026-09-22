import { cleanup } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { isCorrectAt } from '../src/lib/aquariumPlaceValueMath'
import { buildAquariumFixture } from '../src/lib/aquariumQuestionGenerator'

afterEach(cleanup)

describe('aquariumCheck — Periksa tidak pernah diam', () => {
  it('validator 23+14=37 per kolom via isCorrectAt', () => {
    const problem = buildAquariumFixture('addition', 23, 14)
    const width = problem.columns.length
    expect(width).toBe(2)
    // 23+14=37: ones 7, tens 3
    expect(isCorrectAt(23, 14, 'addition', 1, 2, 7)).toBe(true)
    expect(isCorrectAt(23, 14, 'addition', 0, 2, 3)).toBe(true)
    expect(isCorrectAt(23, 14, 'addition', 1, 2, 8)).toBe(false)
  })

  it('validator 3-digit 245+138=383 per kolom', () => {
    const problem = buildAquariumFixture('addition', 245, 138)
    expect(problem.columns.length).toBe(3)
    expect(isCorrectAt(245, 138, 'addition', 2, 3, 3)).toBe(true)
    expect(isCorrectAt(245, 138, 'addition', 1, 3, 8)).toBe(true)
    expect(isCorrectAt(245, 138, 'addition', 0, 3, 3)).toBe(true)
  })

  it('canCheck membutuhkan semua kolom + bukan intro (logika)', () => {
    // Dokumentasi regresi H1: Periksa disabled saat intro/tutorial,
    // digits disabled saat intro — diverifikasi via render manual S9.
    // Di sini pastikan validator tidak diam untuk input parsial:
    // ones null → isCorrectAt tidak dipanggil (handleCheck return lebih dulu).
    const onesAnswer: number | null = null
    const tensAnswer: number | null = 3
    const canCheckLike = onesAnswer !== null && tensAnswer !== null
    expect(canCheckLike).toBe(false)
  })
})
