import type { TFunction } from '../i18n/core'
import type { MathProblem } from '../types'

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

const GENERIC_HINT_KEYS = ['hint.genericRight', 'hint.genericUnits', 'hint.genericSlow'] as const

function placeLabel(t: TFunction, place: MathProblem['columns'][number]['place']): string {
  switch (place) {
    case 'units':
      return t('place.units')
    case 'tens':
      return t('place.tens')
    case 'hundreds':
      return t('place.hundreds')
    case 'thousands':
      return t('place.thousands')
  }
}

/**
 * Petunjuk bertahap: umum → tunjuk kolom → penjelasan detail → tawarkan
 * mode belajar langkah demi langkah. Hint bersifat transient (tidak
 * disimpan), jadi diterjemahkan dengan bahasa aktif saat dibuat.
 */
export function getHint(
  problem: MathProblem,
  attempt: number,
  wrongColumnIndexes: readonly number[],
  t: TFunction,
): string {
  if (attempt <= 1) {
    const key =
      GENERIC_HINT_KEYS[(attempt - 1 + GENERIC_HINT_KEYS.length) % GENERIC_HINT_KEYS.length]
    return t(key)
  }
  if (attempt === 2) {
    const places = wrongColumnIndexes
      .map((index) => problem.columns[index])
      .filter((column) => column !== undefined)
      .map((column) => placeLabel(t, column.place))
    const placeText = places.length > 0 ? places.join(t('join.and')) : t('place.units')
    return t('hint.places', { places: placeText })
  }
  if (attempt === 3) {
    if (problem.requiresCarry) {
      return t('hint.carry')
    }
    if (problem.requiresBorrow) {
      return t('hint.borrow')
    }
    return t('hint.columnwise')
  }
  return t('hint.guided')
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
