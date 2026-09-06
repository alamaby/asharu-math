/** Logika nilai tempat murni untuk Kebun Apel Ajaib — tanpa UI, mudah diuji. */

export const APPLES_PER_BASKET = 10

export interface PlaceSplit {
  tens: number
  ones: number
}

export function splitTensOnes(value: number): PlaceSplit {
  if (!Number.isInteger(value) || value < 0 || value > 99) {
    throw new Error(`Nilai harus 0..99, got ${value}`)
  }
  return { tens: Math.floor(value / 10), ones: value % 10 }
}

export function totalFromSplit(split: PlaceSplit): number {
  return split.tens * APPLES_PER_BASKET + split.ones
}

export function basketsFor(value: number): number {
  return splitTensOnes(value).tens
}

export function applesFor(value: number): number {
  return splitTensOnes(value).ones
}

/** Validasi invariant kebun */
export function isValidGardenState(tens: number, ones: number): boolean {
  return Number.isInteger(tens) && Number.isInteger(ones) && tens >= 0 && ones >= 0
}

/** 10 apel satuan → 1 keranjang puluhan */
export function exchangeTenOnesToBasket(tens: number, ones: number): PlaceSplit {
  if (ones < APPLES_PER_BASKET) {
    throw new Error(`Butuh minimal 10 apel untuk ditukar, got ${ones}`)
  }
  return { tens: tens + 1, ones: ones - APPLES_PER_BASKET }
}

/** 1 keranjang puluhan → 10 apel satuan */
export function openBasketToTenApples(tens: number, ones: number): PlaceSplit {
  if (tens < 1) {
    throw new Error(`Butuh minimal 1 keranjang untuk dibuka, got ${tens}`)
  }
  return { tens: tens - 1, ones: ones + APPLES_PER_BASKET }
}

/** Hitung gabungan apel/keranjang untuk penjumlahan */
export function combinedForAddition(first: number, second: number): PlaceSplit {
  const a = splitTensOnes(first)
  const b = splitTensOnes(second)
  return { tens: a.tens + b.tens, ones: a.ones + b.ones }
}

/** Apakah penjumlahan satuan perlu menyimpan? */
export function needsCarry(first: number, second: number): boolean {
  return applesFor(first) + applesFor(second) >= APPLES_PER_BASKET
}

/** Apakah pengurangan satuan perlu menukar? */
export function needsBorrow(top: number, bottom: number): boolean {
  return applesFor(top) < applesFor(bottom)
}

/** Validasi jawaban kolom satuan/puluhan */
export function isCorrectOnesAnswer(
  top: number,
  bottom: number,
  operation: 'addition' | 'subtraction',
  givenOnes: number,
): boolean {
  const expected =
    operation === 'addition'
      ? (applesFor(top) + applesFor(bottom)) % APPLES_PER_BASKET
      : needsBorrow(top, bottom)
        ? applesFor(top) + APPLES_PER_BASKET - applesFor(bottom)
        : applesFor(top) - applesFor(bottom)
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
