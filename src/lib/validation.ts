import type { MathProblem } from '../types'
import { PLACE_LABELS } from './placeValue'

export interface AnswerCheckResult {
  allCorrect: boolean
  wrongColumnIndexes: number[]
}

/**
 * Memeriksa jawaban per kolom berdasarkan nilai tempat.
 * `given` diindeks dari kiri (0) sesuai grid tampilan.
 */
export function checkAnswerDigits(
  problem: MathProblem,
  given: readonly (number | null)[],
): AnswerCheckResult {
  const wrongColumnIndexes: number[] = []
  problem.columns.forEach((column) => {
    if (column.resultDigit === null) return
    const expected = Number(column.resultDigit)
    if (given[column.index] !== expected) {
      wrongColumnIndexes.push(column.index)
    }
  })
  return { allCorrect: wrongColumnIndexes.length === 0, wrongColumnIndexes }
}

const GENERIC_HINTS = [
  'Ingat, mulai dari sebelah kanan.',
  'Coba periksa kolom satuan dulu.',
  'Hitung pelan-pelan satu kolom ya.',
]

/**
 * Petunjuk bertahap: umum → tunjuk kolom → penjelasan detail → tawarkan
 * mode belajar langkah demi langkah.
 */
export function getHint(
  problem: MathProblem,
  attempt: number,
  wrongColumnIndexes: readonly number[],
): string {
  if (attempt <= 1) {
    return GENERIC_HINTS[(attempt - 1 + GENERIC_HINTS.length) % GENERIC_HINTS.length]
  }
  if (attempt === 2) {
    const places = wrongColumnIndexes
      .map((index) => problem.columns[index])
      .filter((column) => column !== undefined)
      .map((column) => PLACE_LABELS[column.place])
    const placeText = places.length > 0 ? places.join(' dan ') : 'satuan'
    return `Hampir benar! Periksa lagi kolom ${placeText}.`
  }
  if (attempt === 3) {
    if (problem.requiresCarry) {
      return 'Apakah ada angka yang perlu disimpan? Coba hitung ulang dari satuan.'
    }
    if (problem.requiresBorrow) {
      return 'Coba lihat kotak pinjamnya. Jika angka atas tidak cukup, pinjam 10 dari kolom sebelah kiri.'
    }
    return 'Jumlahkan tiap kolom dari kanan, lalu cocokkan satu per satu.'
  }
  return 'Ayo belajar bersama langkah demi langkah supaya lebih mudah!'
}

export function shouldOfferGuidedMode(attempt: number): boolean {
  return attempt >= 3
}

/** Kolom grid yang harus diisi anak (kolom dengan digit hasil). */
export function requiredAnswerColumnIndexes(problem: MathProblem): number[] {
  return problem.columns
    .filter((column) => column.resultDigit !== null)
    .map((column) => column.index)
}
