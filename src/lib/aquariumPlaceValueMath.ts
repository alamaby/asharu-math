/** Logika nilai tempat murni untuk Akuarium Ikan Ceria — tanpa UI. 1 ikan=1 satuan, 10 ikan=1 puluhan. */

export const FISH_PER_GROUP = 10

export interface AquariumSplit {
  tens: number
  ones: number
}

export function splitTensOnes(value: number): AquariumSplit {
  if (!Number.isInteger(value) || value < 0 || value > 99) {
    throw new Error(`Nilai harus 0..99, got ${value}`)
  }
  return { tens: Math.floor(value / 10), ones: value % 10 }
}

export function totalFromSplit(split: AquariumSplit): number {
  return split.tens * FISH_PER_GROUP + split.ones
}

export function fishesFor(value: number): number {
  return splitTensOnes(value).ones
}

export function groupsFor(value: number): number {
  return splitTensOnes(value).tens
}

export function isValidAquariumState(tens: number, ones: number): boolean {
  return Number.isInteger(tens) && Number.isInteger(ones) && tens >= 0 && ones >= 0
}

/** 10 ikan satuan → 1 kelompok puluhan */
export function formGroup(tens: number, ones: number): AquariumSplit {
  if (ones < FISH_PER_GROUP) {
    throw new Error(`Butuh minimal 10 ikan untuk membentuk kelompok, got ${ones}`)
  }
  return { tens: tens + 1, ones: ones - FISH_PER_GROUP }
}

/** 1 kelompok puluhan → 10 ikan satuan */
export function splitGroup(tens: number, ones: number): AquariumSplit {
  if (tens < 1) {
    throw new Error(`Butuh minimal 1 kelompok untuk dipecah, got ${tens}`)
  }
  return { tens: tens - 1, ones: ones + FISH_PER_GROUP }
}

export function combinedForAddition(first: number, second: number): AquariumSplit {
  const a = splitTensOnes(first)
  const b = splitTensOnes(second)
  return { tens: a.tens + b.tens, ones: a.ones + b.ones }
}

export function needsCarry(first: number, second: number): boolean {
  return fishesFor(first) + fishesFor(second) >= FISH_PER_GROUP
}

export function needsBorrow(top: number, bottom: number): boolean {
  return fishesFor(top) < fishesFor(bottom)
}

export function isCorrectOnesAnswer(
  top: number,
  bottom: number,
  operation: 'addition' | 'subtraction',
  givenOnes: number,
): boolean {
  const expected =
    operation === 'addition'
      ? (fishesFor(top) + fishesFor(bottom)) % FISH_PER_GROUP
      : needsBorrow(top, bottom)
        ? fishesFor(top) + FISH_PER_GROUP - fishesFor(bottom)
        : fishesFor(top) - fishesFor(bottom)
  return givenOnes === expected
}

export function isCorrectTensAnswer(
  top: number,
  bottom: number,
  operation: 'addition' | 'subtraction',
  givenTens: number,
): boolean {
  const topSplit = splitTensOnes(top)
  const botSplit = splitTensOnes(bottom)
  let expectedTens: number
  if (operation === 'addition') {
    const carry = needsCarry(top, bottom) ? 1 : 0
    expectedTens = topSplit.tens + botSplit.tens + carry
  } else {
    const borrow = needsBorrow(top, bottom) ? 1 : 0
    expectedTens = topSplit.tens - borrow - botSplit.tens
  }
  return givenTens === expectedTens
}

/** Total nilai tetap sama sebelum/sesudah pertukaran — invariant untuk test */
export function totalInvariant(
  before: AquariumSplit,
  after: AquariumSplit,
): boolean {
  return totalFromSplit(before) === totalFromSplit(after)
}
