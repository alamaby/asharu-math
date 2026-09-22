import { describe, it, expect } from 'vitest'
import {
  FISH_PER_GROUP,
  splitTensOnes,
  splitPlaces,
  totalFromHundreds,
  formGroup,
  splitGroup,
  formHundred,
  splitHundred,
  needsCarry,
  needsBorrow,
  isCorrectOnesAnswer,
  isCorrectTensAnswer,
  isCorrectAt,
  totalInvariant,
  totalFromSplit,
} from '../src/lib/aquariumPlaceValueMath'
import { buildProblem } from '../src/lib/problemGenerator'
import {
  generateAquariumProblem,
  generateAquariumSession,
  buildAquariumFixture,
} from '../src/lib/aquariumQuestionGenerator'
import { hasCarry, hasBorrow } from '../src/lib/arithmetic'

describe('aquariumPlaceValueMath — invarian akuarium', () => {
  it('1 kelompok puluhan selalu bernilai 10 ikan', () => {
    expect(FISH_PER_GROUP).toBe(10)
    expect(splitTensOnes(27)).toEqual({ tens: 2, ones: 7 })
    expect(splitTensOnes(42)).toEqual({ tens: 4, ones: 2 })
  })

  it('10 ikan → 1 kelompok', () => {
    expect(formGroup(2, 12)).toEqual({ tens: 3, ones: 2 })
    expect(formGroup(0, 10)).toEqual({ tens: 1, ones: 0 })
  })

  it('1 kelompok → 10 ikan', () => {
    expect(splitGroup(4, 2)).toEqual({ tens: 3, ones: 12 })
    expect(splitGroup(1, 0)).toEqual({ tens: 0, ones: 10 })
  })

  it('pertukaran mempertahankan total nilai', () => {
    const before = { tens: 2, ones: 12 }
    const after = formGroup(2, 12)
    expect(totalInvariant(before, after)).toBe(true)
    expect(totalFromSplit(after)).toBe(32)
    const before2 = { tens: 4, ones: 2 }
    const after2 = splitGroup(4, 2)
    expect(totalInvariant(before2, after2)).toBe(true)
    expect(totalFromSplit(after2)).toBe(42)
  })

  it('totalInvariant false jika tidak match', () => {
    expect(totalInvariant({ tens: 2, ones: 5 }, { tens: 3, ones: 5 })).toBe(false)
  })

  it('jawaban per kolom divalidasi benar', () => {
    expect(isCorrectOnesAnswer(27, 15, 'addition', 2)).toBe(true)
    expect(isCorrectTensAnswer(27, 15, 'addition', 4)).toBe(true)
    expect(isCorrectOnesAnswer(27, 15, 'addition', 3)).toBe(false)
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

  it('formGroup throw jika kurang dari 10', () => {
    expect(() => formGroup(2, 9)).toThrow()
  })

  it('splitGroup throw jika tidak ada kelompok', () => {
    expect(() => splitGroup(0, 5)).toThrow()
  })
})

describe('aquariumQuestionGenerator — aturan 2-digit', () => {
  it('akuarium-1: tambah tanpa menyimpan', () => {
    for (let i = 0; i < 30; i++) {
      const p = generateAquariumProblem({ levelId: 'akuarium-1' })
      expect(p.operation).toBe('addition')
      expect(p.digitCount).toBe(2)
      expect(hasCarry(p.firstOperand, p.secondOperand)).toBe(false)
    }
  })

  it('akuarium-2: tambah dengan menyimpan', () => {
    for (let i = 0; i < 30; i++) {
      const p = generateAquariumProblem({ levelId: 'akuarium-2' })
      expect(hasCarry(p.firstOperand, p.secondOperand)).toBe(true)
    }
  })

  it('akuarium-3: kurang tanpa menukar', () => {
    for (let i = 0; i < 30; i++) {
      const p = generateAquariumProblem({ levelId: 'akuarium-3' })
      expect(p.operation).toBe('subtraction')
      expect(p.firstOperand).toBeGreaterThanOrEqual(p.secondOperand)
      expect(hasBorrow(p.firstOperand, p.secondOperand)).toBe(false)
    }
  })

  it('akuarium-4: kurang dengan menukar', () => {
    for (let i = 0; i < 30; i++) {
      const p = generateAquariumProblem({ levelId: 'akuarium-4' })
      expect(hasBorrow(p.firstOperand, p.secondOperand)).toBe(true)
      expect(p.firstOperand).toBeGreaterThanOrEqual(p.secondOperand)
      expect(p.firstOperand).toBeGreaterThanOrEqual(10)
    }
  })

  it('hasil pengurangan tidak negatif', () => {
    for (let i = 0; i < 50; i++) {
      const p = generateAquariumProblem({ levelId: i % 2 === 0 ? 'akuarium-3' : 'akuarium-4' })
      expect(p.expectedResult).toBeGreaterThanOrEqual(0)
    }
  })

  it('representasi ikan == angka soal', () => {
    const p = buildAquariumFixture('addition', 27, 15)
    expect(p.firstOperand).toBe(27)
    expect(p.expectedResult).toBe(42)
  })

  it('soal tidak berulang berurutan', () => {
    let prev = generateAquariumProblem({ levelId: 'akuarium-2' })
    for (let i = 0; i < 20; i++) {
      const next = generateAquariumProblem({ levelId: 'akuarium-2', previous: prev })
      expect(
        next.firstOperand !== prev.firstOperand ||
          next.secondOperand !== prev.secondOperand ||
          next.operation !== prev.operation,
      ).toBe(true)
      prev = next
    }
  })

  it('session 5 soal sesuai level', () => {
    const s = generateAquariumSession('akuarium-1', 5)
    expect(s).toHaveLength(5)
    for (const p of s) expect(hasCarry(p.firstOperand, p.secondOperand)).toBe(false)
  })

  it('E2E fixture 27+15=42 dan 42-17=25', () => {
    const a = buildAquariumFixture('addition', 27, 15)
    expect(a.expectedResult).toBe(42)
    expect(hasCarry(27, 15)).toBe(true)
    const b = buildAquariumFixture('subtraction', 42, 17)
    expect(b.expectedResult).toBe(25)
    expect(hasBorrow(42, 17)).toBe(true)
    expect((7 + 5) % 10).toBe(2)
    expect(2 + 1 + 1).toBe(4)
    expect(2 + 10 - 7).toBe(5)
    expect(4 - 1 - 1).toBe(2)
  })

  it('soal negatif ditolak', () => {
    expect(() => buildProblem('subtraction', 10, 20)).toThrow()
  })
})

describe('aquariumPlaceValueMath — ratusan 3-digit', () => {
  it('splitPlaces 0/245/999', () => {
    expect(splitPlaces(0)).toEqual({ hundreds: 0, tens: 0, ones: 0 })
    expect(splitPlaces(245)).toEqual({ hundreds: 2, tens: 4, ones: 5 })
    expect(splitPlaces(999)).toEqual({ hundreds: 9, tens: 9, ones: 9 })
  })

  it('splitPlaces throw di luar 0..999', () => {
    expect(() => splitPlaces(-1)).toThrow()
    expect(() => splitPlaces(1000)).toThrow()
    expect(() => splitPlaces(1.5)).toThrow()
  })

  it('totalFromHundreds konsisten', () => {
    expect(totalFromHundreds({ hundreds: 2, tens: 4, ones: 5 })).toBe(245)
  })

  it('10 kelompok → 1 ratusan', () => {
    expect(formHundred(10, 2)).toEqual({ hundreds: 3, tens: 0 })
    expect(() => formHundred(9, 0)).toThrow()
  })

  it('1 ratusan → 10 kelompok', () => {
    expect(splitHundred(2, 3)).toEqual({ hundreds: 1, tens: 13 })
    expect(() => splitHundred(0, 5)).toThrow()
  })

  it('isCorrectAt 245+138=383 per kolom', () => {
    expect(isCorrectAt(245, 138, 'addition', 2, 3, 3)).toBe(true)
    expect(isCorrectAt(245, 138, 'addition', 1, 3, 8)).toBe(true)
    expect(isCorrectAt(245, 138, 'addition', 0, 3, 3)).toBe(true)
    expect(isCorrectAt(245, 138, 'addition', 0, 3, 4)).toBe(false)
  })

  it('generator akuarium-5/6: 3-digit required', () => {
    for (let i = 0; i < 20; i++) {
      const add = generateAquariumProblem({ levelId: 'akuarium-5' })
      expect(add.operation).toBe('addition')
      expect(add.digitCount).toBe(3)
      expect(hasCarry(add.firstOperand, add.secondOperand)).toBe(true)
      const sub = generateAquariumProblem({ levelId: 'akuarium-6' })
      expect(sub.operation).toBe('subtraction')
      expect(sub.firstOperand).toBeGreaterThanOrEqual(sub.secondOperand)
      expect(hasBorrow(sub.firstOperand, sub.secondOperand)).toBe(true)
    }
  })

  it('fixture 3-digit 245+138=383 dan 432-176=256', () => {
    expect(buildAquariumFixture('addition', 245, 138).expectedResult).toBe(383)
    expect(buildAquariumFixture('subtraction', 432, 176).expectedResult).toBe(256)
  })
})
