import type { CarryMode, GeneratorSettings, MathProblem, OperationType } from '../types'
import { hasBorrow, hasCarry, planAddition, planSubtraction } from './arithmetic'
import { buildColumns } from './placeValue'
import { buildLearningSteps } from './learningSteps'

let idCounter = 0

function nextId(): string {
  idCounter += 1
  return `soal-${idCounter}-${Math.random().toString(36).slice(2, 8)}`
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function digitsToNumber(digitsLeftToRight: number[]): number {
  return Number(digitsLeftToRight.join(''))
}

export function buildProblem(operation: OperationType, first: number, second: number): MathProblem {
  if (first < 0 || second < 0) {
    throw new Error('Operand tidak boleh negatif')
  }
  if (operation === 'subtraction' && first < second) {
    throw new Error(`Hasil negatif tidak diizinkan: ${first} - ${second}`)
  }
  if (operation === 'addition' && first + second > 9999) {
    // Materi kelas 2 SD hanya sampai nilai tempat ribuan
    throw new Error(`Hasil penjumlahan melebihi 9999: ${first} + ${second}`)
  }

  const result = operation === 'addition' ? planAddition(first, second).result : planSubtraction(first, second).result
  const firstText = String(first)
  const secondText = String(second)
  const resultText = String(result)
  const columns = buildColumns(firstText, secondText, resultText)

  return {
    id: nextId(),
    operation,
    firstOperand: first,
    secondOperand: second,
    firstOperandText: firstText,
    secondOperandText: secondText,
    expectedResult: result,
    expectedResultText: resultText,
    digitCount: Math.max(firstText.length, secondText.length),
    requiresCarry: operation === 'addition' && hasCarry(first, second),
    requiresBorrow: operation === 'subtraction' && hasBorrow(first, second),
    columns,
    learningSteps: buildLearningSteps(operation, first, second, columns.length, resultText),
  }
}

function buildAdditionNoCarry(digitCount: number): [number, number] {
  const a: number[] = []
  const b: number[] = []
  for (let i = 0; i < digitCount; i++) {
    const isLeading = i === 0
    // Leading maksimum 8 agar operand kedua masih bisa punya leading >= 1
    const aDigit = randomInt(isLeading ? 1 : 0, isLeading ? 8 : 9)
    a.push(aDigit)
    b.push(randomInt(isLeading ? 1 : 0, 9 - aDigit))
  }
  return [digitsToNumber(a), digitsToNumber(b)]
}

function buildAdditionWithCarry(digitCount: number): [number, number] {
  const a: number[] = []
  const b: number[] = []
  // Hasil dibatasi maksimal 9999 (nilai tempat tertinggi: ribuan)
  const maxLeadingSum = digitCount === 4 ? 8 : 18
  for (let i = 0; i < digitCount; i++) {
    const isLeading = i === 0
    const isUnits = i === digitCount - 1
    if (isUnits) {
      // Pastikan satuan menghasilkan carry: a0 + b0 >= 10
      const aDigit = randomInt(1, 9)
      a.push(aDigit)
      b.push(randomInt(10 - aDigit, 9))
    } else if (isLeading) {
      const aDigit = randomInt(1, Math.min(9, maxLeadingSum - 1))
      a.push(aDigit)
      b.push(randomInt(1, Math.min(9, maxLeadingSum - aDigit)))
    } else {
      a.push(randomInt(0, 9))
      b.push(randomInt(0, 9))
    }
  }
  return [digitsToNumber(a), digitsToNumber(b)]
}

function buildSubtractionNoBorrow(digitCount: number): [number, number] {
  const top: number[] = []
  const bottom: number[] = []
  for (let i = 0; i < digitCount; i++) {
    const isLeading = i === 0
    const topDigit = randomInt(isLeading ? 1 : 0, 9)
    top.push(topDigit)
    bottom.push(randomInt(isLeading ? 1 : 0, topDigit))
  }
  return [digitsToNumber(top), digitsToNumber(bottom)]
}

function buildSubtractionWithBorrow(digitCount: number): [number, number] {
  const top: number[] = []
  const bottom: number[] = []
  for (let i = 0; i < digitCount; i++) {
    const isLeading = i === 0
    const isUnits = i === digitCount - 1
    if (isUnits) {
      // Satuan harus meminjam: top0 < bottom0
      const topDigit = randomInt(0, 8)
      top.push(topDigit)
      bottom.push(randomInt(topDigit + 1, 9))
    } else if (isLeading) {
      // Leading atas strict lebih besar agar hasil tetap positif
      const topDigit = randomInt(2, 9)
      top.push(topDigit)
      bottom.push(randomInt(1, topDigit - 1))
    } else {
      const topDigit = randomInt(0, 9)
      top.push(topDigit)
      bottom.push(randomInt(0, topDigit))
    }
  }
  return [digitsToNumber(top), digitsToNumber(bottom)]
}

function generateAdditionPair(digitCount: number, carryMode: CarryMode): [number, number] {
  const lo = 10 ** (digitCount - 1)
  const hi = 10 ** digitCount - 1
  for (let attempt = 0; attempt < 300; attempt++) {
    const a = randomInt(lo, hi)
    const b = randomInt(lo, hi)
    if (a + b > 9999) continue
    if (carryMode === 'none' && !hasCarry(a, b)) return [a, b]
    if (carryMode === 'required' && hasCarry(a, b)) return [a, b]
    if (carryMode === 'any') return [a, b]
  }
  if (carryMode === 'required') return buildAdditionWithCarry(digitCount)
  return buildAdditionNoCarry(digitCount)
}

function generateSubtractionPair(digitCount: number, carryMode: CarryMode): [number, number] {
  const lo = 10 ** (digitCount - 1)
  const hi = 10 ** digitCount - 1
  if (carryMode === 'none') {
    for (let attempt = 0; attempt < 300; attempt++) {
      const a = randomInt(lo, hi)
      const b = randomInt(lo, hi)
      if (a >= b && !hasBorrow(a, b)) return [a, b]
    }
    return buildSubtractionNoBorrow(digitCount)
  }
  if (carryMode === 'required') {
    for (let attempt = 0; attempt < 300; attempt++) {
      const a = randomInt(lo, hi)
      const b = randomInt(lo, hi)
      if (a >= b && hasBorrow(a, b)) return [a, b]
    }
    return buildSubtractionWithBorrow(digitCount)
  }
  const a = randomInt(lo, hi)
  const b = randomInt(lo, hi)
  return [Math.max(a, b), Math.min(a, b)]
}

function pickOperation(settings: GeneratorSettings): OperationType {
  if (settings.operation === 'mixed') {
    return Math.random() < 0.5 ? 'addition' : 'subtraction'
  }
  return settings.operation
}

function sameAsPrevious(
  previous: MathProblem | null,
  operation: OperationType,
  first: number,
  second: number,
): boolean {
  return (
    previous !== null &&
    previous.operation === operation &&
    previous.firstOperand === first &&
    previous.secondOperand === second
  )
}

export function generateProblem(settings: GeneratorSettings, previous: MathProblem | null = null): MathProblem {
  for (let attempt = 0; attempt < 50; attempt++) {
    const operation = pickOperation(settings)
    const [first, second] =
      operation === 'addition'
        ? generateAdditionPair(settings.digitCount, settings.carryMode)
        : generateSubtractionPair(settings.digitCount, settings.carryMode)
    if (sameAsPrevious(previous, operation, first, second)) continue
    try {
      return buildProblem(operation, first, second)
    } catch {
      continue
    }
  }
  // Fallback terakhir yang pasti valid sesuai konfigurasi
  const operation: OperationType = settings.operation === 'subtraction' ? 'subtraction' : 'addition'
  const [first, second] =
    operation === 'addition'
      ? settings.carryMode === 'none'
        ? buildAdditionNoCarry(settings.digitCount)
        : buildAdditionWithCarry(settings.digitCount)
      : settings.carryMode === 'none'
        ? buildSubtractionNoBorrow(settings.digitCount)
        : buildSubtractionWithBorrow(settings.digitCount)
  return buildProblem(operation, first, second)
}

export function generateSession(settings: GeneratorSettings): MathProblem[] {
  const problems: MathProblem[] = []
  let previous: MathProblem | null = null
  for (let i = 0; i < settings.questionCount; i++) {
    const problem = generateProblem(settings, previous)
    problems.push(problem)
    previous = problem
  }
  return problems
}
