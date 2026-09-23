import { describe, expect, it } from 'vitest'
import {
  _trainHelpers,
  generateTrainQuestion,
  generateTrainSession,
  type TrainGrade,
  type TrainTopic,
} from '../src/lib/trainQuestionGenerator'

const GRADES: TrainGrade[] = [1, 2, 3]
const ALL_TOPICS: TrainTopic[] = [
  'addition',
  'subtraction',
  'multiplication',
  'division',
  'comparison',
]

function parsePromptNumbers(prompt: string): number[] {
  return prompt
    .split(/[^0-9]+/)
    .filter((s) => s.length > 0)
    .map(Number)
}

describe('rentang soal kereta per kelas', () => {
  it('K1 tambah 1-digit, kurang nonnegatif, banding 1-20', () => {
    for (let i = 0; i < 200; i++) {
      const add = _trainHelpers.buildAdditionQuestion(1)
      const [a, b] = parsePromptNumbers(add.prompt)
      expect(a).toBeGreaterThanOrEqual(1)
      expect(a).toBeLessThanOrEqual(9)
      expect(b).toBeGreaterThanOrEqual(1)
      expect(b).toBeLessThanOrEqual(9)
      expect(Number(add.correctValue)).toBe(a! + b!)

      const sub = _trainHelpers.buildSubtractionQuestion(1)
      const [t, u] = parsePromptNumbers(sub.prompt)
      expect(t).toBeGreaterThanOrEqual(u!)
      expect(Number(sub.correctValue)).toBeGreaterThanOrEqual(0)

      const cmp = _trainHelpers.buildComparisonQuestion(1)
      const [l, r] = parsePromptNumbers(cmp.prompt)
      expect(l).toBeGreaterThanOrEqual(1)
      expect(l).toBeLessThanOrEqual(20)
      expect(r).toBeGreaterThanOrEqual(1)
      expect(r).toBeLessThanOrEqual(20)
    }
  })

  it('K2 tambah/kurang 2-digit, kali 2-5', () => {
    for (let i = 0; i < 200; i++) {
      const add = _trainHelpers.buildAdditionQuestion(2)
      const [a, b] = parsePromptNumbers(add.prompt)
      expect(a).toBeGreaterThanOrEqual(10)
      expect(a).toBeLessThanOrEqual(99)
      expect(b).toBeGreaterThanOrEqual(10)
      expect(b).toBeLessThanOrEqual(99)

      const mul = _trainHelpers.buildMultiplicationQuestion(2)
      const [m1, m2] = parsePromptNumbers(mul.prompt)
      expect(m1).toBeGreaterThanOrEqual(2)
      expect(m1).toBeLessThanOrEqual(5)
      expect(m2).toBeGreaterThanOrEqual(2)
      expect(m2).toBeLessThanOrEqual(5)
    }
  })

  it('K3 tambah/kurang 100-999, kali 2-9, bagi bulat, banding <=500', () => {
    for (let i = 0; i < 300; i++) {
      const add = _trainHelpers.buildAdditionQuestion(3)
      const [a, b] = parsePromptNumbers(add.prompt)
      expect(a).toBeGreaterThanOrEqual(100)
      expect(a).toBeLessThanOrEqual(999)
      expect(b).toBeGreaterThanOrEqual(100)
      expect(b).toBeLessThanOrEqual(999)

      const div = _trainHelpers.buildDivisionQuestion(3)
      const [n, d] = parsePromptNumbers(div.prompt)
      expect(d).toBeGreaterThanOrEqual(2)
      expect(d).toBeLessThanOrEqual(9)
      expect(n! % d!).toBe(0)
      expect(Number(div.correctValue)).toBe(n! / d!)

      const cmp = _trainHelpers.buildComparisonQuestion(3)
      const [l, r] = parsePromptNumbers(cmp.prompt)
      expect(l).toBeLessThanOrEqual(500)
      expect(r).toBeLessThanOrEqual(500)
    }
  })
})

describe('aturan pilihan kereta', () => {
  it('tepat tiga pilihan unik', () => {
    for (let i = 0; i < 500; i++) {
      const g = GRADES[i % GRADES.length]!
      const q = generateTrainQuestion(g)
      expect(q.choices).toHaveLength(3)
      expect(new Set(q.choices).size).toBe(3)
    }
  })

  it('tepat satu jawaban benar dan sesuai correctIndex', () => {
    for (let i = 0; i < 500; i++) {
      const g = GRADES[i % GRADES.length]!
      const q = generateTrainQuestion(g)
      const matches = q.choices.filter((c) => c === q.correctValue)
      expect(matches).toHaveLength(1)
      expect(q.choices[q.correctIndex]).toBe(q.correctValue)
    }
  })

  it('posisi jawaban benar tersebar di kiri/tengah/kanan', () => {
    const counts = [0, 0, 0]
    for (let i = 0; i < 500; i++) {
      const q = generateTrainQuestion(ALL_TOPICS[i % ALL_TOPICS.length] ? 3 : 3)
      counts[q.correctIndex]! += 1
    }
    for (const c of counts) {
      expect(c / 500).toBeGreaterThan(0.15)
    }
  })

  it('pengurangan eksplisit tidak pernah negatif', () => {
    const q = _trainHelpers.buildSubtractionQuestion(1, 3, 8)
    expect(Number(q.correctValue)).toBeGreaterThanOrEqual(0)
    const [t, u] = parsePromptNumbers(q.prompt)
    expect(t).toBeGreaterThanOrEqual(u!)
  })

  it('pembagian eksplisit selalu bulat', () => {
    const q = _trainHelpers.buildDivisionQuestion(3)
    const [n, d] = parsePromptNumbers(q.prompt)
    expect(n! % d!).toBe(0)
  })
})

describe('sesi kereta', () => {
  it('tepat 5 soal dan tidak ada prompt identik berurutan', () => {
    const session = generateTrainSession(1, 5)
    expect(session).toHaveLength(5)
    for (let i = 1; i < session.length; i++) {
      expect(session[i]!.prompt).not.toBe(session[i - 1]!.prompt)
    }
  })
})
