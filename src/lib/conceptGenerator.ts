/**
 * Generator untuk 3 topik konsep Kelas 1:
 * - membilang 1..20 (counting)
 * - banding bilangan (compare)
 * - nilai tempat satuan/puluhan (place-value)
 *
 * Dirancang terpisah dari `problemGenerator.ts` yang khusus kolom bersusun.
 * Hasilnya adalah `ConceptProblem` dengan `choices` siap render (pilihan ganda).
 */
import type { ConceptKind, ConceptProblem, ConceptQuestion } from '../types'

let conceptId = 0

function nextConceptId(kind: ConceptKind): string {
  conceptId += 1
  return `konsep-${kind}-${conceptId}-${Math.random().toString(36).slice(2, 6)}`
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function shuffle<T>(items: readonly T[]): T[] {
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const tmp = copy[i]
    copy[i] = copy[j]
    copy[j] = tmp
  }
  return copy
}

function buildCountingProblem(target?: number): ConceptProblem {
  const count = target ?? randomInt(1, 20)
  const iconRoll = Math.random()
  const icon: ConceptQuestion & { kind: 'counting' } = {
    kind: 'counting',
    target: count,
    icon: iconRoll < 0.5 ? 'apple' : iconRoll < 0.8 ? 'star' : 'dot',
  } as ConceptQuestion & { kind: 'counting' }
  // Distraktor dari pool 1..20 tanpa target — ambil 3 lalu shuffle; aman di tepi (1 atau 20)
  const pool = Array.from({ length: 20 }, (_, i) => i + 1).filter((v) => v !== count)
  const distractors = shuffle(pool).slice(0, 3)
  const candidates = [count, ...distractors]
  const choices = shuffle(candidates).map(String)
  return {
    id: nextConceptId('counting'),
    kind: 'counting',
    question: icon,
    expectedAnswer: String(count),
    choices,
  }
}

function buildCompareProblem(left?: number, right?: number): ConceptProblem {
  const explicit = left !== undefined && right !== undefined
  const a = left ?? randomInt(1, 20)
  const b = right ?? randomInt(1, 20)
  // Hindari terlalu banyak 'equal' agar menarik: 20% equal — hanya untuk jalur acak,
  // bukan saat caller memberikan kedua angka eksplisit (helper deterministik di test).
  let l = a
  let r = b
  if (!explicit && Math.random() < 0.2) {
    const v = randomInt(1, 20)
    l = v
    r = v
  }
  const expected = l > r ? 'greater' : l < r ? 'less' : ('equal' as const)
  return {
    id: nextConceptId('compare'),
    kind: 'compare',
    question: { kind: 'compare', left: l, right: r, expected } as ConceptQuestion,
    expectedAnswer: expected,
    choices: ['greater', 'less', 'equal'],
  }
}

function buildPlaceValueProblem(value?: number, asked?: 'tens' | 'units'): ConceptProblem {
  const number = value ?? randomInt(10, 99)
  const tens = Math.floor(number / 10)
  const units = number % 10
  const askedPlace = asked ?? (Math.random() < 0.5 ? 'tens' : 'units')
  const expectedDigit = askedPlace === 'tens' ? tens : units
  // Distraktor digit lain 0..9
  const distractors = new Set<number>([expectedDigit])
  while (distractors.size < 4) {
    const v = randomInt(0, 9)
    if (v !== expectedDigit) distractors.add(v)
  }
  return {
    id: nextConceptId('place-value'),
    kind: 'place-value',
    question: {
      kind: 'place-value',
      number,
      askedPlace,
      expectedDigit,
    } as ConceptQuestion,
    expectedAnswer: String(expectedDigit),
    choices: shuffle([...distractors]).map(String),
  }
}

export function buildConceptProblem(kind: ConceptKind): ConceptProblem {
  switch (kind) {
    case 'counting':
      return buildCountingProblem()
    case 'compare':
      return buildCompareProblem()
    case 'place-value':
      return buildPlaceValueProblem()
  }
}

export function generateConceptSession(kind: ConceptKind, count: number): ConceptProblem[] {
  const safeCount = Math.max(1, Math.min(20, count))
  const problems: ConceptProblem[] = []
  let prev: string | null = null
  for (let i = 0; i < safeCount; i++) {
    for (let attempt = 0; attempt < 20; attempt++) {
      const p = buildConceptProblem(kind)
      const key = `${p.kind}:${p.expectedAnswer}:${JSON.stringify(p.question)}`
      if (key !== prev) {
        problems.push(p)
        prev = key
        break
      }
      if (attempt === 19) {
        problems.push(p)
        prev = key
      }
    }
  }
  return problems
}

/** Helper ter-ekspor untuk test deterministik */
export const _helpers = {
  buildCountingProblem,
  buildCompareProblem,
  buildPlaceValueProblem,
  shuffle,
}
