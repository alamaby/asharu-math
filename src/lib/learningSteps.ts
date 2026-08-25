import type { BorrowChange, LearningStep, OperationType } from '../types'
import { planAddition, planSubtraction, type SubtractionPlan } from './arithmetic'

/**
 * Membangun urutan langkah belajar untuk satu soal.
 * Setiap langkah menyimpan DATA terstruktur (tanpa kalimat) — instruksi
 * diterjemahkan saat render via `stepInstruction()` agar ganti bahasa
 * berlaku instan. Kolom yang tidak dipakai hasil (mis. ribuan pada
 * 1000 − 1 = 999) dilewati agar anak tidak menulis leading zero.
 */
export function buildLearningSteps(
  operation: OperationType,
  first: number,
  second: number,
  width: number,
  result: number,
): LearningStep[] {
  return operation === 'addition'
    ? buildAdditionSteps(first, second, width, result)
    : buildSubtractionSteps(first, second, width, result)
}

/** Kolom grid ini dipakai oleh hasil akhir? */
function columnUsedByResult(gridColumn: number, width: number, resultText: string): boolean {
  return gridColumn >= width - resultText.length
}

function gridColumnOf(width: number, indexFromRight: number): number {
  return width - 1 - indexFromRight
}

function buildAdditionSteps(
  first: number,
  second: number,
  width: number,
  result: number,
): LearningStep[] {
  const resultText = String(result)
  const plan = planAddition(first, second)
  const steps: LearningStep[] = [{ kind: 'intro', operation: 'addition', first, second }]

  for (let i = 0; i < plan.columns.length; i++) {
    const col = plan.columns[i]
    const gridColumn = gridColumnOf(width, col.indexFromRight)
    if (!columnUsedByResult(gridColumn, width, resultText)) continue

    // Kolom tambahan yang hanya berisi turunan carry, mis. ratusan pada 26 + 87
    if (col.a === 0 && col.b === 0 && col.carryIn > 0) {
      steps.push({
        kind: 'answer-digit',
        columnIndex: gridColumn,
        place: col.place,
        expectedDigit: col.resultDigit,
      })
      continue
    }

    steps.push({
      kind: 'interim-sum',
      columnIndex: gridColumn,
      place: col.place,
      addendA: col.a,
      addendB: col.b,
      carryIn: col.carryIn,
      expected: col.rawSum,
    })

    if (col.rawSum >= 10) {
      steps.push({
        kind: 'answer-digit',
        columnIndex: gridColumn,
        place: col.place,
        expectedDigit: col.resultDigit,
      })
      const destination = plan.columns[i + 1]
      if (col.carryOut > 0 && destination) {
        steps.push({
          kind: 'carry-digit',
          columnIndex: gridColumnOf(width, destination.indexFromRight),
          place: destination.place,
          expectedDigit: col.carryOut,
        })
      }
    } else {
      steps.push({
        kind: 'answer-digit',
        columnIndex: gridColumn,
        place: col.place,
        expectedDigit: col.resultDigit,
      })
    }
  }

  steps.push({ kind: 'review', operation: 'addition', first, second, result })
  return steps
}

/**
 * Perubahan angka akibat satu peminjaman pada kolom `indexFromRight`.
 * Rantai berhenti di kolom pertama yang bisa memberi pinjaman; kolom
 * bernilai 0 yang dilewati menampilkan 0 → 9.
 */
function buildBorrowChanges(
  plan: SubtractionPlan,
  indexFromRight: number,
  width: number,
): BorrowChange[] {
  const changes: BorrowChange[] = []
  const current = plan.columns[indexFromRight]
  const currentEffective = current.topOriginal - (current.lentToRight ? 1 : 0)
  changes.push({
    columnIndex: gridColumnOf(width, indexFromRight),
    before: currentEffective,
    after: current.topAfter,
  })

  let j = indexFromRight + 1
  while (j < plan.columns.length && plan.columns[j].topOriginal === 0) {
    changes.push({ columnIndex: gridColumnOf(width, j), before: 0, after: 9 })
    j++
  }
  if (j < plan.columns.length) {
    const lender = plan.columns[j]
    changes.push({
      columnIndex: gridColumnOf(width, j),
      before: lender.topOriginal,
      after: lender.topOriginal - 1,
    })
  }
  return changes
}

function buildSubtractionSteps(
  first: number,
  second: number,
  width: number,
  result: number,
): LearningStep[] {
  const resultText = String(result)
  const plan = planSubtraction(first, second)
  const steps: LearningStep[] = [{ kind: 'intro', operation: 'subtraction', first, second }]

  for (const col of plan.columns) {
    const gridColumn = gridColumnOf(width, col.indexFromRight)
    if (!columnUsedByResult(gridColumn, width, resultText)) continue
    const effective = col.topOriginal - (col.lentToRight ? 1 : 0)
    // Kolom rantai tengah: bernilai 0 dan dipinjam kolom kanan, lalu
    // meneruskan pinjaman — perubahannya sudah dijelaskan pada langkah sebelumnya.
    const isChainMid = col.lentToRight && col.topOriginal === 0

    if (col.borrowedFromLeft && !isChainMid) {
      // Kasus klasik: kolom ini sendiri yang memulai peminjaman
      steps.push({
        kind: 'borrow-question',
        columnIndex: gridColumn,
        place: col.place,
        top: effective,
        bottom: col.bottom,
        canSubtract: false,
      })
      const changes = buildBorrowChanges(plan, col.indexFromRight, width)
      steps.push({
        kind: 'borrow-explain',
        columnIndex: gridColumn,
        place: col.place,
        top: effective,
        bottom: col.bottom,
        changes,
      })
      steps.push({
        kind: 'answer-digit',
        columnIndex: gridColumn,
        place: col.place,
        expectedDigit: col.resultDigit,
        sub: {
          mode: 'afterBorrow',
          topAfter: col.topAfter,
          bottom: col.bottom,
          topOriginal: col.topOriginal,
          effective,
        },
      })
    } else {
      steps.push({
        kind: 'answer-digit',
        columnIndex: gridColumn,
        place: col.place,
        expectedDigit: col.resultDigit,
        sub: {
          mode: isChainMid ? 'chainMid' : 'plain',
          topAfter: col.topAfter,
          bottom: col.bottom,
          topOriginal: col.topOriginal,
          effective,
        },
      })
    }
  }

  steps.push({ kind: 'review', operation: 'subtraction', first, second, result })
  return steps
}
