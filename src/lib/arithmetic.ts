import type { PlaceValue } from '../types'
import { PLACES_LEFT_TO_RIGHT } from './placeValue'

/**
 * Seluruh perhitungan pada berkas ini berjalan dari KANAN ke KIRI
 * (mulai satuan) menggunakan indeks string. Urutan visual kiri-ke-kanan
 * ditangani terpisah oleh lib/placeValue.ts sehingga tampilan tidak
 * pernah membalik urutan digit.
 */

function digitFromRight(text: string, indexFromRight: number): number {
  const charIndex = text.length - 1 - indexFromRight
  if (charIndex < 0) return 0
  return text.charCodeAt(charIndex) - 48
}

export function placeForIndexFromRight(indexFromRight: number): PlaceValue {
  if (indexFromRight < 0 || indexFromRight >= PLACES_LEFT_TO_RIGHT.length) {
    throw new Error(`Index kolom tidak valid: ${indexFromRight}`)
  }
  return PLACES_LEFT_TO_RIGHT[PLACES_LEFT_TO_RIGHT.length - 1 - indexFromRight]
}

export interface AdditionColumnPlan {
  indexFromRight: number
  place: PlaceValue
  a: number
  b: number
  carryIn: number
  rawSum: number
  resultDigit: number
  carryOut: number
}

export interface AdditionPlan {
  /** Terurut dari satuan (indexFromRight 0) ke kiri */
  columns: AdditionColumnPlan[]
  result: number
  carryCount: number
}

export function planAddition(first: number, second: number): AdditionPlan {
  const aText = String(first)
  const bText = String(second)
  const columnCount = Math.max(aText.length, bText.length)
  const columns: AdditionColumnPlan[] = []
  let carry = 0
  let carryCount = 0

  for (let i = 0; i < columnCount; i++) {
    const a = digitFromRight(aText, i)
    const b = digitFromRight(bText, i)
    const carryIn = carry
    const rawSum = a + b + carryIn
    const carryOut = Math.floor(rawSum / 10)
    columns.push({
      indexFromRight: i,
      place: placeForIndexFromRight(i),
      a,
      b,
      carryIn,
      rawSum,
      resultDigit: rawSum % 10,
      carryOut,
    })
    carry = carryOut
    if (carryOut > 0) carryCount++
  }

  // Carry terakhir keluar dari kolom tertinggi (mis. 999 + 1 → 1000)
  if (carry > 0) {
    columns.push({
      indexFromRight: columnCount,
      place: placeForIndexFromRight(columnCount),
      a: 0,
      b: 0,
      carryIn: carry,
      rawSum: carry,
      resultDigit: carry,
      carryOut: 0,
    })
  }

  return { columns, result: first + second, carryCount }
}

export interface SubtractionColumnPlan {
  indexFromRight: number
  place: PlaceValue
  topOriginal: number
  bottom: number
  /** Kolom ini meminjam 10 dari kolom di sebelah kirinya */
  borrowedFromLeft: boolean
  /** Kolom ini dipinjam 1 oleh kolom di sebelah kanannya */
  lentToRight: boolean
  /** Nilai atas setelah meminjam/meminjamkan, mis. 2 → 12, 5 → 4 */
  topAfter: number
  resultDigit: number
}

export interface SubtractionPlan {
  columns: SubtractionColumnPlan[]
  result: number
  borrowCount: number
}

/**
 * Menghitung pengurangan first − second kolom per kolom.
 * Syarat: first >= second (hasil tidak boleh negatif).
 */
export function planSubtraction(first: number, second: number): SubtractionPlan {
  if (first < second) {
    throw new Error(`Hasil negatif tidak diizinkan: ${first} - ${second}`)
  }
  const topText = String(first)
  const bottomText = String(second)
  const columnCount = topText.length
  const columns: SubtractionColumnPlan[] = []
  let borrow = 0
  let borrowCount = 0

  for (let i = 0; i < columnCount; i++) {
    const topOriginal = digitFromRight(topText, i)
    const bottom = digitFromRight(bottomText, i)
    const lentToRight = borrow === 1
    const effective = topOriginal - (lentToRight ? 1 : 0)
    const borrowedFromLeft = effective < bottom
    const topAfter = effective + (borrowedFromLeft ? 10 : 0)

    columns.push({
      indexFromRight: i,
      place: placeForIndexFromRight(i),
      topOriginal,
      bottom,
      borrowedFromLeft,
      lentToRight,
      topAfter,
      resultDigit: topAfter - bottom,
    })
    borrow = borrowedFromLeft ? 1 : 0
    if (borrowedFromLeft) borrowCount++
  }

  return { columns, result: first - second, borrowCount }
}

export function hasCarry(first: number, second: number): boolean {
  return planAddition(first, second).carryCount > 0
}

export function hasBorrow(first: number, second: number): boolean {
  if (first < second) return false
  return planSubtraction(first, second).borrowCount > 0
}
