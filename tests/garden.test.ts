import { describe, it, expect } from 'vitest'
import {
  APPLES_PER_BASKET,
  splitTensOnes,
  exchangeTenOnesToBasket,
  openBasketToTenApples,
  needsCarry,
  needsBorrow,
  isCorrectOnesAnswer,
  isCorrectTensAnswer,
} from '../src/lib/placeValueMath'
import { buildProblem } from '../src/lib/problemGenerator'
import {
  generateGardenProblem,
  generateGardenSession,
  buildGardenFixture,
} from '../src/lib/gardenQuestionGenerator'
import { hasCarry, hasBorrow } from '../src/lib/arithmetic'

describe('placeValueMath — invarian kebun', () => {
  it('1 keranjang selalu bernilai 10 apel', () => {
    expect(APPLES_PER_BASKET).toBe(10)
    expect(splitTensOnes(27)).toEqual({ tens: 2, ones: 7 })
    expect(splitTensOnes(42)).toEqual({ tens: 4, ones: 2 })
  })

  it('10 apel → 1 keranjang', () => {
    expect(exchangeTenOnesToBasket(2, 12)).toEqual({ tens: 3, ones: 2 })
    expect(exchangeTenOnesToBasket(0, 10)).toEqual({ tens: 1, ones: 0 })
  })

  it('1 keranjang → 10 apel', () => {
    expect(openBasketToTenApples(4, 2)).toEqual({ tens: 3, ones: 12 })
    expect(openBasketToTenApples(1, 0)).toEqual({ tens: 0, ones: 10 })
  })

  it('pertukaran mempertahankan total nilai', () => {
    const before = 2 * 10 + 12
    const after = exchangeTenOnesToBasket(2, 12)
    expect(after.tens * 10 + after.ones).toBe(before)
    const before2 = 4 * 10 + 2
    const after2 = openBasketToTenApples(4, 2)
    expect(after2.tens * 10 + after2.ones).toBe(before2)
  })

  it('jawaban per kolom divalidasi benar', () => {
    // 27 + 15 = 42
    expect(isCorrectOnesAnswer(27, 15, 'addition', 2)).toBe(true)
    expect(isCorrectTensAnswer(27, 15, 'addition', 4)).toBe(true)
    expect(isCorrectOnesAnswer(27, 15, 'addition', 3)).toBe(false)
    // 42 - 17 = 25
    expect(isCorrectOnesAnswer(42, 17, 'subtraction', 5)).toBe(true)
    expect(isCorrectTensAnswer(42, 17, 'subtraction', 2)).toBe(true)
    expect(isCorrectTensAnswer(42, 17, 'subtraction', 3)).toBe(false)
  })

  it('needsCarry / needsBorrow', () => {
    expect(needsCarry(27, 15)).toBe(true)
    expect(needsCarry(23, 14)).toBe(false)
    expect(needsBorrow(42, 17)).toBe(true)
    expect(needsBorrow(58, 24)).toBe(false)
  })
})

describe('gardenQuestionGenerator — aturan 2-digit', () => {
  it('kebun-1: tambah tanpa menyimpan', () => {
    for (let i = 0; i < 30; i++) {
      const p = generateGardenProblem({ levelId: 'kebun-1' })
      expect(p.operation).toBe('addition')
      expect(p.digitCount).toBe(2)
      expect(hasCarry(p.firstOperand, p.secondOperand)).toBe(false)
      expect(p.expectedResult).toBeGreaterThanOrEqual(0)
    }
  })

  it('kebun-2: tambah dengan menyimpan', () => {
    for (let i = 0; i < 30; i++) {
      const p = generateGardenProblem({ levelId: 'kebun-2' })
      expect(hasCarry(p.firstOperand, p.secondOperand)).toBe(true)
    }
  })

  it('kebun-3: kurang tanpa menukar', () => {
    for (let i = 0; i < 30; i++) {
      const p = generateGardenProblem({ levelId: 'kebun-3' })
      expect(p.operation).toBe('subtraction')
      expect(p.firstOperand).toBeGreaterThanOrEqual(p.secondOperand)
      expect(hasBorrow(p.firstOperand, p.secondOperand)).toBe(false)
    }
  })

  it('kebun-4: kurang dengan menukar', () => {
    for (let i = 0; i < 30; i++) {
      const p = generateGardenProblem({ levelId: 'kebun-4' })
      expect(hasBorrow(p.firstOperand, p.secondOperand)).toBe(true)
      expect(p.firstOperand).toBeGreaterThanOrEqual(p.secondOperand)
    }
  })

  it('hasil pengurangan tidak negatif', () => {
    for (let i = 0; i < 50; i++) {
      const p = generateGardenProblem({ levelId: i % 2 === 0 ? 'kebun-3' : 'kebun-4' })
      expect(p.expectedResult).toBeGreaterThanOrEqual(0)
    }
  })

  it('representasi apel == angka soal', () => {
    const p = buildGardenFixture('addition', 27, 15)
    const tens = Number(p.firstOperandText[0])
    const ones = Number(p.firstOperandText[1])
    expect(tens).toBe(2)
    expect(ones).toBe(7)
    expect(p.firstOperand).toBe(27)
  })

  it('soal tidak berulang berurutan (previous)', () => {
    let prev = generateGardenProblem({ levelId: 'kebun-2' })
    for (let i = 0; i < 20; i++) {
      const next = generateGardenProblem({ levelId: 'kebun-2', previous: prev })
      expect(
        next.firstOperand !== prev.firstOperand ||
          next.secondOperand !== prev.secondOperand ||
          next.operation !== prev.operation,
      ).toBe(true)
      prev = next
    }
  })

  it('generateGardenSession 5 soal', () => {
    const session = generateGardenSession('kebun-1', 5)
    expect(session).toHaveLength(5)
    for (const p of session) expect(hasCarry(p.firstOperand, p.secondOperand)).toBe(false)
  })

  it('E2E fixture 27+15=42 dan 42-17=25 valid', () => {
    const a = buildGardenFixture('addition', 27, 15)
    expect(a.expectedResult).toBe(42)
    expect(hasCarry(27, 15)).toBe(true)
    const b = buildGardenFixture('subtraction', 42, 17)
    expect(b.expectedResult).toBe(25)
    expect(hasBorrow(42, 17)).toBe(true)
    // sinkron kebun: 27+15 → 12 apel → tukar 10 → sisa 2 apel, puluhan 4
    expect((7 + 5) % 10).toBe(2)
    expect(2 + 1 + 1).toBe(4)
    // 42-17 → 2 apel kurang → buka 1 keranjang → 12 apel -7 =5, puluhan 3-1=2
    expect(2 + 10 - 7).toBe(5)
    expect(4 - 1 - 1).toBe(2)
  })
})

describe('buildProblem invarian', () => {
  it('soal negatif ditolak', () => {
    expect(() => buildProblem('subtraction', 10, 20)).toThrow()
  })
})
