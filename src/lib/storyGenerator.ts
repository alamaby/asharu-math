/**
 * Generator soal cerita Kelas 2 — 6 famili variasi (F0-F5).
 * Setiap stem berisi satu narasi + N part soal yang dinilai terpisah.
 */
import type {
  CarryMode,
  DigitCount,
  OperationChoice,
  OperationType,
  StoryFamily,
  StoryItem,
  StoryPart,
  StoryProblem,
  StorySettings,
} from '../types'
import { buildProblem } from './problemGenerator'
import { hasBorrow, hasCarry } from './arithmetic'

const NAMES = ['Budi', 'Siti', 'Andi', 'Dewi'] as const
const ITEMS: readonly StoryItem[] = [
  'marbles',
  'apples',
  'books',
  'fish',
  'cakes',
  'pencils',
  'candies',
  'balls',
  'flowers',
  'birds',
]

let storyId = 0

function nextStoryId(prefix: string): string {
  storyId += 1
  return `cerita-${prefix}-${storyId}-${Math.random().toString(36).slice(2, 6)}`
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
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

function capFor(digitCount: DigitCount): number {
  return 10 ** digitCount - 1
}

function pickName(exclude?: string): string {
  const available = NAMES.filter((n) => n !== exclude)
  return pick(available.length > 0 ? available : NAMES)
}

function pickItem(exclude?: StoryItem): StoryItem {
  const available = ITEMS.filter((it) => it !== exclude)
  return pick(available.length > 0 ? available : ITEMS)
}

function buildPart(
  family: StoryFamily,
  operation: OperationType,
  a: number,
  b: number,
  partIndex: number,
  totalParts: number,
  stemParams: Record<string, string | number>,
): StoryPart {
  const math = buildProblem(operation, a, b)
  return {
    id: nextStoryId(family),
    family,
    operation,
    a,
    b,
    expectedAnswer: math.expectedResult,
    partIndex,
    totalParts,
    math,
    stemParams,
  }
}

// ─── F0: add/sub langkah tunggal ──────────────────────────────────────────────

export function buildF0AddStory(args: {
  a?: number
  b?: number
  item?: StoryItem
  name?: string
  name2?: string
  digitCount?: DigitCount
  carryMode?: CarryMode
}): StoryProblem {
  const digitCount = args.digitCount ?? 2
  const cap = capFor(digitCount)
  const lo = 10 ** (digitCount - 1)
  const carryMode = args.carryMode ?? 'any'

  let a = args.a
  let b = args.b
  if (a === undefined || b === undefined) {
    for (let attempt = 0; attempt < 300; attempt++) {
      const ra = randomInt(lo, cap)
      const rb = randomInt(lo, cap)
      if (ra + rb > cap) continue
      if (carryMode === 'none' && hasCarry(ra, rb)) continue
      if (carryMode === 'required' && !hasCarry(ra, rb)) continue
      a = ra
      b = rb
      break
    }
    if (a === undefined || b === undefined) {
      a = lo
      b = lo
    }
  }

  const stemParams = {
    name: args.name ?? pickName(),
    name2: args.name2 ?? pickName(args.name),
    item: args.item ?? pickItem(),
    a,
    b,
  }

  return {
    id: nextStoryId('f0-add'),
    family: 'f0-add',
    operation: 'addition',
    stemParams,
    parts: [buildPart('f0-add', 'addition', a, b, 0, 1, stemParams)],
  }
}

export function buildF0SubStory(args: {
  a?: number
  b?: number
  item?: StoryItem
  name?: string
  digitCount?: DigitCount
  carryMode?: CarryMode
}): StoryProblem {
  const digitCount = args.digitCount ?? 2
  const cap = capFor(digitCount)
  const lo = 10 ** (digitCount - 1)
  const carryMode = args.carryMode ?? 'any'

  let a = args.a
  let b = args.b
  if (a === undefined || b === undefined) {
    for (let attempt = 0; attempt < 300; attempt++) {
      const ra = randomInt(lo, cap)
      const rb = randomInt(lo, ra)
      if (carryMode === 'none' && hasBorrow(ra, rb)) continue
      if (carryMode === 'required' && !hasBorrow(ra, rb)) continue
      a = ra
      b = rb
      break
    }
    if (a === undefined || b === undefined) {
      a = cap
      b = lo
    }
  }

  const stemParams = {
    name: args.name ?? pickName(),
    item: args.item ?? pickItem(),
    a,
    b,
  }

  return {
    id: nextStoryId('f0-sub'),
    family: 'f0-sub',
    operation: 'subtraction',
    stemParams,
    parts: [buildPart('f0-sub', 'subtraction', a, b, 0, 1, stemParams)],
  }
}

// ─── F1: selisih-2-tokoh ─────────────────────────────────────────────────────

export function buildF1DiffStory(args: {
  x?: number
  y?: number
  item?: StoryItem
  nameA?: string
  nameB?: string
  variant?: 'full' | 'b-only' | 'total-only'
}): StoryProblem {
  const x = args.x ?? randomInt(30, 99)
  const y = args.y ?? randomInt(10, x - 10)
  const nameA = args.nameA ?? pickName()
  const nameB = args.nameB ?? pickName(nameA)
  const item = args.item ?? pickItem()
  const variant = args.variant ?? 'full'

  const stemParams = { nameA, nameB, item, x, y }

  if (variant === 'b-only') {
    return {
      id: nextStoryId('f1-diff'),
      family: 'f1-diff',
      operation: 'subtraction',
      stemParams,
      parts: [buildPart('f1-diff', 'subtraction', x, y, 0, 1, stemParams)],
    }
  }

  if (variant === 'total-only') {
    const bVal = x - y
    return {
      id: nextStoryId('f1-diff'),
      family: 'f1-diff',
      operation: 'addition',
      stemParams,
      parts: [buildPart('f1-diff', 'addition', x, bVal, 0, 1, stemParams)],
    }
  }

  // full: [B = x-y (sub), total = x+B (add)]
  const bVal = x - y
  return {
    id: nextStoryId('f1-diff'),
    family: 'f1-diff',
    operation: 'mixed' as OperationChoice,
    stemParams,
    parts: [
      buildPart('f1-diff', 'subtraction', x, y, 0, 2, stemParams),
      buildPart('f1-diff', 'addition', x, bVal, 1, 2, stemParams),
    ],
  }
}

// ─── F2: split-transfer simpel ────────────────────────────────────────────────

export function buildF2TransferStory(args: {
  x?: number
  p?: number
  q?: number
  r?: number
  s?: number
  item?: StoryItem
  nameA?: string
  nameB?: string
  variant?: 'full' | 'remainder-only'
}): StoryProblem {
  const nameA = args.nameA ?? pickName()
  const nameB = args.nameB ?? pickName(nameA)
  const item = args.item ?? pickItem()
  const variant = args.variant ?? 'full'

  let x = args.x
  let p = args.p
  let r = args.r
  let s = args.s

  if (args.q !== undefined && p !== undefined && x === undefined) {
    x = p + args.q
  }

  if (p !== undefined && args.q !== undefined && x !== undefined) {
    if (p + args.q !== x) {
      throw new Error('p+q harus sama dengan x')
    }
  }

  if (x === undefined) {
    x = randomInt(30, 99)
  }
  if (p === undefined) {
    p = randomInt(15, Math.min(x - 15, 99))
  }
  if (r === undefined) {
    r = randomInt(5, Math.max(4, p - 10))
  }
  const q = x - p
  if (s === undefined) {
    s = randomInt(10, 99 - r)
  }

  const stemParams = { nameA, nameB, item, x, p, q, r, s }

  if (variant === 'remainder-only') {
    return {
      id: nextStoryId('f2-transfer'),
      family: 'f2-transfer',
      operation: 'subtraction',
      stemParams,
      parts: [buildPart('f2-transfer', 'subtraction', x, r, 0, 1, stemParams)],
    }
  }

  // full: [p-r (sub), x-r (sub), s+r (add)]
  return {
    id: nextStoryId('f2-transfer'),
    family: 'f2-transfer',
    operation: 'mixed' as OperationChoice,
    stemParams,
    parts: [
      buildPart('f2-transfer', 'subtraction', p, r, 0, 3, stemParams),
      buildPart('f2-transfer', 'subtraction', x, r, 1, 3, stemParams),
      buildPart('f2-transfer', 'addition', s, r, 2, 3, stemParams),
    ],
  }
}

// ─── F3: rantai-3-tokoh ──────────────────────────────────────────────────────

export function buildF3ChainStory(args: {
  c?: number
  n?: number
  m?: number
  item?: StoryItem
  nameA?: string
  nameB?: string
  nameC?: string
  variant?: 'full' | 'total-only'
}): StoryProblem {
  const nameA = args.nameA ?? pickName()
  const nameB = args.nameB ?? pickName(nameA)
  const nameC = args.nameC ?? pickName(nameA)
  const item = args.item ?? pickItem()
  const variant = args.variant ?? 'full'

  let c = args.c ?? randomInt(10, 50)
  let n = args.n ?? randomInt(10, 50)
  let m = args.m ?? randomInt(10, 40)

  let B = c + n
  let A = B - m

  if (A < 10 || B > 999) {
    c = 20
    n = 15
    m = 8
    B = c + n
    A = B - m
  }

  const stemParams = { nameA, nameB, nameC, item, m, n }

  if (variant === 'total-only') {
    return {
      id: nextStoryId('f3-chain'),
      family: 'f3-chain',
      operation: 'addition',
      stemParams,
      parts: [buildPart('f3-chain', 'addition', A + B, c, 0, 1, stemParams)],
    }
  }

  // full: [B (add,c,n), A (sub,B,m), total (add,A+B,C)]
  return {
    id: nextStoryId('f3-chain'),
    family: 'f3-chain',
    operation: 'mixed' as OperationChoice,
    stemParams,
    parts: [
      buildPart('f3-chain', 'addition', c, n, 0, 3, stemParams),
      buildPart('f3-chain', 'subtraction', B, m, 1, 3, stemParams),
      buildPart('f3-chain', 'addition', A + B, c, 2, 3, stemParams),
    ],
  }
}

// ─── F4: gabung-3-tokoh ──────────────────────────────────────────────────────

export function buildF4Join3Story(args: {
  x?: number
  y?: number
  z?: number
  item?: StoryItem
  nameA?: string
  nameB?: string
  nameC?: string
}): StoryProblem {
  const nameA = args.nameA ?? pickName()
  const nameB = args.nameB ?? pickName(nameA)
  const nameC = args.nameC ?? pickName(nameA)
  const item = args.item ?? pickItem()

  let x = args.x ?? randomInt(10, 50)
  let y = args.y ?? randomInt(10, 50)
  let z = args.z ?? randomInt(10, 50)

  const cap = 999
  if (x + y + z > cap) {
    x = 10
    y = 10
    z = 10
  }

  const stemParams = { nameA, nameB, nameC, item, x, y, z }

  // Two single-part variants: total3 or totalAC
  const useTotal3 = Math.random() < 0.5
  if (useTotal3) {
    return {
      id: nextStoryId('f4-join3'),
      family: 'f4-join3',
      operation: 'addition',
      stemParams,
      parts: [buildPart('f4-join3', 'addition', x + y, z, 0, 1, stemParams)],
    }
  }
  return {
    id: nextStoryId('f4-join3'),
    family: 'f4-join3',
    operation: 'addition',
    stemParams,
    parts: [buildPart('f4-join3', 'addition', x, z, 0, 1, stemParams)],
  }
}

// ─── F5: sisa-bertingkat ─────────────────────────────────────────────────────

export function buildF5TieredStory(args: {
  x?: number
  y?: number
  z?: number
  item?: StoryItem
  nameA?: string
  nameB?: string
}): StoryProblem {
  const nameA = args.nameA ?? pickName()
  const nameB = args.nameB ?? pickName(nameA)
  const item = args.item ?? pickItem()

  let x = args.x ?? randomInt(30, 99)
  let y = args.y ?? randomInt(10, x - 10)
  let z = args.z ?? randomInt(10, 99 - (x - y))

  const rest = x - y

  if (rest < 10) {
    x = 45
    y = 12
    z = 20
  }

  const final_ = (x - y) + z
  void final_

  const stemParams = { nameA, nameB, item, x, y, z }

  // Always full: [rest (sub,x,y), final (add,rest,z)]
  return {
    id: nextStoryId('f5-tiered'),
    family: 'f5-tiered',
    operation: 'mixed' as OperationChoice,
    stemParams,
    parts: [
      buildPart('f5-tiered', 'subtraction', x, y, 0, 2, stemParams),
      buildPart('f5-tiered', 'addition', rest, z, 1, 2, stemParams),
    ],
  }
}

// ─── Session ──────────────────────────────────────────────────────────────────

function pickFamily(
  operation: OperationChoice,
  families: readonly StoryFamily[],
  remaining: number,
): StoryFamily {
  if (operation === 'addition') return 'f0-add'
  if (operation === 'subtraction') return 'f0-sub'
  // mixed: pilih dari families
  if (remaining === 1) {
    const singlePartFamilies: StoryFamily[] = ['f0-add', 'f0-sub', 'f1-diff', 'f3-chain', 'f4-join3']
    const candidates = families.filter((f) => singlePartFamilies.includes(f))
    if (candidates.length > 0) return pick(candidates)
  }
  return pick(families)
}

function familyToBuild(
  family: StoryFamily,
  digitCount: DigitCount,
  carryMode: CarryMode,
): () => StoryProblem {
  switch (family) {
    case 'f0-add':
      return () => buildF0AddStory({ digitCount, carryMode })
    case 'f0-sub':
      return () => buildF0SubStory({ digitCount, carryMode })
    case 'f1-diff':
      return () => buildF1DiffStory({})
    case 'f2-transfer':
      return () => buildF2TransferStory({})
    case 'f3-chain':
      return () => buildF3ChainStory({})
    case 'f4-join3':
      return () => buildF4Join3Story({})
    case 'f5-tiered':
      return () => buildF5TieredStory({})
  }
}

export function generateStorySession(settings: StorySettings): StoryProblem[] {
  const questionCount = Math.max(1, settings.questionCount)
  const stems: StoryProblem[] = []
  let totalParts = 0
  let lastKey = ''

  while (totalParts < questionCount) {
    const remaining = questionCount - totalParts
    const family = pickFamily(settings.operation, settings.families, remaining)
    const build = familyToBuild(family, settings.digitCount, settings.carryMode)

    let stem: StoryProblem
    try {
      stem = build()
    } catch {
      continue
    }

    // Anti-duplikat berurutan: kunci family + JSON params
    const key = `${family}:${JSON.stringify(stem.stemParams)}`
    if (key === lastKey && totalParts > 0) {
      if (Math.random() < 0.1) continue
    }
    lastKey = key

    // Potong stem jika melebihi target agar totalParts tepat == questionCount
    if (totalParts + stem.parts.length > questionCount) {
      const slice = stem.parts.slice(0, questionCount - totalParts)
      stem = { ...stem, parts: slice }
    }

    stems.push(stem)
    totalParts += stem.parts.length
  }

  return stems
}

/** Helper ter-ekspor untuk test deterministik */
export const _helpers = {
  buildF0AddStory,
  buildF0SubStory,
  buildF1DiffStory,
  buildF2TransferStory,
  buildF3ChainStory,
  buildF4Join3Story,
  buildF5TieredStory,
  shuffle,
}
