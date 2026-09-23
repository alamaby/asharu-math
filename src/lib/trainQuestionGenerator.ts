/**
 * Generator soal "Petualangan Kereta Angka" — pure functions, tanpa three/react.
 * Setiap soal: tepat 3 pilihan unik, tepat 1 jawaban benar, posisi benar diacak.
 */

export type TrainGrade = 1 | 2 | 3
export type TrainTopic = 'addition' | 'subtraction' | 'multiplication' | 'division' | 'comparison'

export interface TrainQuestion {
  id: string
  grade: TrainGrade
  topic: TrainTopic
  prompt: string
  choices: [string, string, string]
  correctIndex: 0 | 1 | 2
  correctValue: string
  hintText: string
}

let trainIdCounter = 0

function nextTrainId(): string {
  trainIdCounter += 1
  return `kereta-${trainIdCounter}-${Math.random().toString(36).slice(2, 8)}`
}

export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export function shuffle3<T>(items: readonly [T, T, T]): [T, T, T] {
  const copy: T[] = [items[0], items[1], items[2]]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const tmp = copy[i]!
    copy[i] = copy[j]!
    copy[j] = tmp
  }
  return [copy[0]!, copy[1]!, copy[2]!]
}

const HINTS: Record<TrainTopic, string> = {
  addition: 'Hitung dari angka besar, maju sedikit demi sedikit.',
  subtraction: 'Kurangi pelan-pelan, boleh pakai jari.',
  multiplication: 'Ingat perkalian sebagai penjumlahan berulang.',
  division: 'Cari angka yang dikali pembagi menghasilkan depan.',
  comparison: 'Bandingkan puluhannya dulu, lalu satuannya.',
}

function isComparisonSymbol(v: string): boolean {
  return v === '>' || v === '<' || v === '='
}

function numericDistractors(correct: number, count: number): string[] {
  const out: string[] = []
  const candidates = [
    correct + 1,
    correct - 1,
    correct + 2,
    correct - 2,
    correct + 10,
    correct - 10,
    correct + 3,
    correct - 3,
  ]
  for (const c of candidates) {
    if (out.length >= count) break
    if (c === correct) continue
    // Jawaban 0/1 di tepi tetap boleh punya distraktor negatif? Tidak — jaga nonnegatif untuk anak.
    if (c < 0) continue
    const s = String(c)
    if (!out.includes(s)) out.push(s)
  }
  let extra = correct + 5
  while (out.length < count) {
    const s = String(extra)
    if (s !== String(correct) && !out.includes(s)) out.push(s)
    extra += 1
  }
  return out
}

export function makeChoices(
  correct: string,
  distractors: string[],
): { choices: [string, string, string]; correctIndex: 0 | 1 | 2 } {
  const unique: string[] = []
  for (const d of distractors) {
    if (d === correct) continue
    if (unique.includes(d)) continue
    unique.push(d)
    if (unique.length >= 2) break
  }
  if (unique.length < 2) {
    if (isComparisonSymbol(correct)) {
      for (const s of ['>', '<', '=']) {
        if (s !== correct && !unique.includes(s)) {
          unique.push(s)
          if (unique.length >= 2) break
        }
      }
    } else {
      const n = Number(correct)
      if (Number.isFinite(n)) {
        for (const s of numericDistractors(n, 2)) {
          if (!unique.includes(s) && s !== correct) {
            unique.push(s)
            if (unique.length >= 2) break
          }
        }
      } else {
        let extra = 1
        while (unique.length < 2) {
          const s = `${correct}-${extra}`
          if (!unique.includes(s)) unique.push(s)
          extra += 1
        }
      }
    }
  }
  const triple: [string, string, string] = [correct, unique[0]!, unique[1]!]
  const shuffled = shuffle3(triple)
  const correctIndex = shuffled.indexOf(correct) as 0 | 1 | 2
  return { choices: shuffled, correctIndex }
}

function withChoices(
  grade: TrainGrade,
  topic: TrainTopic,
  prompt: string,
  correctValue: string,
  distractors: string[],
): TrainQuestion {
  const { choices, correctIndex } = makeChoices(correctValue, distractors)
  return {
    id: nextTrainId(),
    grade,
    topic,
    prompt,
    choices,
    correctIndex,
    correctValue,
    hintText: HINTS[topic],
  }
}

export function buildAdditionQuestion(grade: TrainGrade, a?: number, b?: number): TrainQuestion {
  let x = a ?? 0
  let y = b ?? 0
  const hasExplicit = a !== undefined && b !== undefined
  if (!hasExplicit) {
    if (grade === 1) {
      for (let i = 0; i < 50; i++) {
        const ca = randomInt(1, 9)
        const cb = randomInt(1, 9)
        if (ca + cb <= 18) {
          x = ca
          y = cb
          break
        }
        if (i === 49) {
          x = ca
          y = cb
        }
      }
    } else if (grade === 2) {
      x = randomInt(10, 99)
      y = randomInt(10, 99)
    } else {
      x = randomInt(100, 999)
      y = randomInt(100, 999)
    }
  } else {
    // Normalisasi operan eksplisit agar tetap dalam rentang grade (untuk test deterministik)
    if (grade === 1) {
      x = Math.min(9, Math.max(1, x))
      y = Math.min(9, Math.max(1, y))
    } else if (grade === 2) {
      x = Math.min(99, Math.max(10, x))
      y = Math.min(99, Math.max(10, y))
    } else {
      x = Math.min(999, Math.max(100, x))
      y = Math.min(999, Math.max(100, y))
    }
  }
  const correct = x + y
  return withChoices(
    grade,
    'addition',
    `${x} + ${y}`,
    String(correct),
    numericDistractors(correct, 6),
  )
}

export function buildSubtractionQuestion(grade: TrainGrade, a?: number, b?: number): TrainQuestion {
  let top: number
  let bottom: number
  if (a !== undefined && b !== undefined) {
    // Normalisasi agar tidak negatif: angka besar selalu di depan.
    top = Math.max(a, b)
    bottom = Math.min(a, b)
    if (grade === 1) {
      top = Math.min(10, Math.max(2, top))
      bottom = Math.min(top, Math.max(1, bottom))
    } else if (grade === 2) {
      top = Math.min(99, Math.max(10, top))
      bottom = Math.min(top, Math.max(1, bottom))
    } else {
      top = Math.min(999, Math.max(100, top))
      bottom = Math.min(top, Math.max(1, bottom))
    }
  } else {
    if (grade === 1) {
      top = randomInt(2, 10)
      bottom = randomInt(1, top)
    } else if (grade === 2) {
      top = randomInt(10, 99)
      bottom = randomInt(1, top)
    } else {
      top = randomInt(100, 999)
      bottom = randomInt(1, top)
    }
  }
  const correct = top - bottom
  return withChoices(
    grade,
    'subtraction',
    `${top} − ${bottom}`,
    String(correct),
    numericDistractors(correct, 6),
  )
}

export function buildMultiplicationQuestion(
  grade: TrainGrade,
  a?: number,
  b?: number,
): TrainQuestion {
  let x: number
  let y: number
  if (a !== undefined && b !== undefined) {
    x = a
    y = b
  } else if (grade === 2) {
    x = randomInt(2, 5)
    y = randomInt(2, 5)
  } else {
    x = randomInt(2, 9)
    y = randomInt(2, 9)
  }
  // K1 tidak punya perkalian — fallback ke penjumlahan dilakukan di generateTrainQuestion.
  const correct = x * y
  return withChoices(
    grade,
    'multiplication',
    `${x} × ${y}`,
    String(correct),
    numericDistractors(correct, 6),
  )
}

export function buildDivisionQuestion(grade: TrainGrade, n?: number, d?: number): TrainQuestion {
  let dividend: number
  let divisor: number
  let quotient: number
  if (n !== undefined && d !== undefined && d !== 0 && n % d === 0) {
    dividend = n
    divisor = d
    quotient = n / d
  } else {
    divisor = randomInt(2, 9)
    quotient = randomInt(2, 9)
    dividend = divisor * quotient
  }
  void grade
  return withChoices(
    grade,
    'division',
    `${dividend} ÷ ${divisor}`,
    String(quotient),
    numericDistractors(quotient, 6),
  )
}

export function buildComparisonQuestion(grade: TrainGrade, a?: number, b?: number): TrainQuestion {
  const max = grade === 1 ? 20 : grade === 2 ? 100 : 500
  const left = a ?? randomInt(1, max)
  const right = b ?? randomInt(1, max)
  const expected = left > right ? '>' : left < right ? '<' : '='
  return withChoices(grade, 'comparison', `${left} ? ${right}`, expected, ['>', '<', '='])
}

function poolForGrade(grade: TrainGrade): TrainTopic[] {
  if (grade === 1) return ['addition', 'subtraction', 'comparison']
  if (grade === 2) return ['addition', 'subtraction', 'multiplication', 'comparison']
  return ['addition', 'subtraction', 'multiplication', 'division', 'comparison']
}

export function generateTrainQuestion(grade: TrainGrade, topic?: TrainTopic): TrainQuestion {
  if (grade !== 1 && grade !== 2 && grade !== 3) {
    throw new Error('TrainGrade tidak valid')
  }
  let resolved: TrainTopic =
    topic ?? poolForGrade(grade)[randomInt(0, poolForGrade(grade).length - 1)]!
  // K1 tidak ada kali/bagi — fallback deterministik ke tambah.
  if (grade === 1 && (resolved === 'multiplication' || resolved === 'division')) {
    resolved = 'addition'
  }
  // K2 tidak ada bagi — fallback ke kali agar tetap menantang.
  if (grade === 2 && resolved === 'division') {
    resolved = 'multiplication'
  }
  switch (resolved) {
    case 'addition':
      return buildAdditionQuestion(grade)
    case 'subtraction':
      return buildSubtractionQuestion(grade)
    case 'multiplication':
      return buildMultiplicationQuestion(grade)
    case 'division':
      return buildDivisionQuestion(grade)
    case 'comparison':
      return buildComparisonQuestion(grade)
  }
}

export function generateTrainSession(grade: TrainGrade, count = 5): TrainQuestion[] {
  const safeCount = Number.isFinite(count) && count > 0 ? Math.floor(count) : 5
  const questions: TrainQuestion[] = []
  let previous: TrainQuestion | null = null
  for (let i = 0; i < safeCount; i++) {
    let q = generateTrainQuestion(grade)
    for (let attempt = 0; attempt < 20 && previous && q.prompt === previous.prompt; attempt++) {
      q = generateTrainQuestion(grade)
    }
    questions.push(q)
    previous = q
  }
  return questions
}

export const _trainHelpers = {
  buildAdditionQuestion,
  buildSubtractionQuestion,
  buildMultiplicationQuestion,
  buildDivisionQuestion,
  buildComparisonQuestion,
  makeChoices,
  shuffle3,
  randomInt,
}
