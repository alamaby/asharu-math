import { describe, expect, it } from 'vitest'
import { hasBorrow, hasCarry } from '../src/lib/arithmetic'
import { buildProblem, generateProblem, generateSession } from '../src/lib/problemGenerator'
import type { GeneratorSettings } from '../src/types'

const RUNS = 300

describe('generator penjumlahan', () => {
  it('mode tanpa menyimpan tidak pernah menghasilkan carry', () => {
    const settings: GeneratorSettings = {
      operation: 'addition',
      digitCount: 2,
      carryMode: 'none',
      questionCount: 10,
    }
    for (let i = 0; i < RUNS; i++) {
      const problem = generateProblem(settings)
      expect(hasCarry(problem.firstOperand, problem.secondOperand)).toBe(false)
      expect(problem.requiresCarry).toBe(false)
    }
  })

  it('mode dengan menyimpan selalu menghasilkan minimal satu carry', () => {
    const settings: GeneratorSettings = {
      operation: 'addition',
      digitCount: 2,
      carryMode: 'required',
      questionCount: 10,
    }
    for (let i = 0; i < RUNS; i++) {
      const problem = generateProblem(settings)
      expect(hasCarry(problem.firstOperand, problem.secondOperand)).toBe(true)
    }
  })

  it('digit sesuai pilihan dan tanpa leading zero', () => {
    for (const digitCount of [2, 3, 4] as const) {
      const settings: GeneratorSettings = {
        operation: 'addition',
        digitCount,
        carryMode: 'any',
        questionCount: 10,
      }
      for (let i = 0; i < 60; i++) {
        const problem = generateProblem(settings)
        expect(problem.firstOperandText).toHaveLength(digitCount)
        expect(problem.secondOperandText).toHaveLength(digitCount)
        expect(problem.firstOperandText[0]).not.toBe('0')
        expect(problem.secondOperandText[0]).not.toBe('0')
      }
    }
  })
})

describe('generator pengurangan', () => {
  it('tidak pernah menghasilkan hasil negatif', () => {
    const settings: GeneratorSettings = {
      operation: 'subtraction',
      digitCount: 3,
      carryMode: 'any',
      questionCount: 10,
    }
    for (let i = 0; i < RUNS; i++) {
      const problem = generateProblem(settings)
      expect(problem.firstOperand).toBeGreaterThanOrEqual(problem.secondOperand)
      expect(problem.expectedResult).toBeGreaterThanOrEqual(0)
    }
  })

  it('mode tanpa meminjam tidak pernah menghasilkan borrow', () => {
    const settings: GeneratorSettings = {
      operation: 'subtraction',
      digitCount: 2,
      carryMode: 'none',
      questionCount: 10,
    }
    for (let i = 0; i < RUNS; i++) {
      const problem = generateProblem(settings)
      expect(hasBorrow(problem.firstOperand, problem.secondOperand)).toBe(false)
      expect(problem.requiresBorrow).toBe(false)
    }
  })

  it('mode dengan meminjam selalu menghasilkan minimal satu borrow', () => {
    const settings: GeneratorSettings = {
      operation: 'subtraction',
      digitCount: 2,
      carryMode: 'required',
      questionCount: 10,
    }
    for (let i = 0; i < RUNS; i++) {
      const problem = generateProblem(settings)
      expect(hasBorrow(problem.firstOperand, problem.secondOperand)).toBe(true)
    }
  })
})

describe('aturan umum generator', () => {
  it('tidak menghasilkan soal identik berturut-turut', () => {
    const settings: GeneratorSettings = {
      operation: 'mixed',
      digitCount: 2,
      carryMode: 'any',
      questionCount: 30,
    }
    const session = generateSession(settings)
    for (let i = 1; i < session.length; i++) {
      const prev = session[i - 1]
      const current = session[i]
      const identical =
        prev.operation === current.operation &&
        prev.firstOperand === current.firstOperand &&
        prev.secondOperand === current.secondOperand
      expect(identical).toBe(false)
    }
  })

  it('jumlah soal sesuai konfigurasi', () => {
    const settings: GeneratorSettings = {
      operation: 'mixed',
      digitCount: 3,
      carryMode: 'any',
      questionCount: 7,
    }
    expect(generateSession(settings)).toHaveLength(7)
  })

  it('kolom soal selalu konsisten dengan operand (operand tidak pernah dibalik)', () => {
    const problem = buildProblem('addition', 26, 87)
    expect(problem.firstOperandText).toBe('26')
    expect(problem.secondOperandText).toBe('87')
    expect(problem.columns.map((c) => c.firstDigit).join('')).toBe('26')
    expect(problem.columns.map((c) => c.secondDigit).join('')).toBe('87')
  })

  it('buildProblem menolak pengurangan bila angka pertama lebih kecil', () => {
    expect(() => buildProblem('subtraction', 28, 52)).toThrow()
  })
})
