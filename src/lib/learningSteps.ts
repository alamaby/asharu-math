import type { BorrowChange, LearningStep, OperationType } from '../types'
import { planAddition, planSubtraction, type SubtractionPlan } from './arithmetic'
import { PLACE_LABELS } from './placeValue'

/**
 * Membangun urutan langkah belajar untuk satu soal.
 * Setiap langkah menunjuk kolom pada grid tampilan (columnIndex,
 * 0 = paling kiri) sehingga instruksi dan kotak aktif selalu sinkron.
 * Kolom yang tidak dipakai hasil (mis. ribuan pada 1000 − 1 = 999)
 * dilewati agar anak tidak menulis leading zero.
 */
export function buildLearningSteps(
  operation: OperationType,
  first: number,
  second: number,
  width: number,
  resultText: string,
): LearningStep[] {
  return operation === 'addition'
    ? buildAdditionSteps(first, second, width, resultText)
    : buildSubtractionSteps(first, second, width, resultText)
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
  resultText: string,
): LearningStep[] {
  const plan = planAddition(first, second)
  const steps: LearningStep[] = [
    {
      kind: 'intro',
      instruction: `Ayo jumlahkan ${first} + ${second}! Kita mulai dari kolom satuan. Tekan tombol Berikutnya untuk mulai.`,
    },
  ]

  for (let i = 0; i < plan.columns.length; i++) {
    const col = plan.columns[i]
    const gridColumn = gridColumnOf(width, col.indexFromRight)
    if (!columnUsedByResult(gridColumn, width, resultText)) continue
    const placeLabel = PLACE_LABELS[col.place]
    const sumText = col.carryIn > 0 ? `${col.carryIn} + ${col.a} + ${col.b}` : `${col.a} + ${col.b}`

    // Kolom tambahan yang hanya berisi turunan carry, mis. ratusan pada 26 + 87
    if (col.a === 0 && col.b === 0 && col.carryIn > 0) {
      steps.push({
        kind: 'answer-digit',
        columnIndex: gridColumn,
        place: col.place,
        expectedDigit: col.resultDigit,
        instruction: `Tulis angka simpan ${col.carryIn} di kotak jawaban ${placeLabel}.`,
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
      instruction:
        col.indexFromRight === 0
          ? `Mulai dari satuan. Berapa ${col.a} + ${col.b}? Tulis hasilnya di Kotak Hitung, lalu tekan tombol hijau Periksa.`
          : `Sekarang hitung ${sumText}. Tulis hasilnya di Kotak Hitung, lalu tekan tombol hijau Periksa.`,
    })

    if (col.rawSum >= 10) {
      steps.push({
        kind: 'answer-digit',
        columnIndex: gridColumn,
        place: col.place,
        expectedDigit: col.resultDigit,
        instruction: `Hasilnya ${col.rawSum}. Tulis ${col.resultDigit} di kotak jawaban ${placeLabel}.`,
      })
      const destination = plan.columns[i + 1]
      if (col.carryOut > 0 && destination) {
        steps.push({
          kind: 'carry-digit',
          columnIndex: gridColumnOf(width, destination.indexFromRight),
          place: destination.place,
          expectedDigit: col.carryOut,
          instruction: `Simpan angka ${col.carryOut} di kotak simpan ${PLACE_LABELS[destination.place]}.`,
        })
      }
    } else {
      steps.push({
        kind: 'answer-digit',
        columnIndex: gridColumn,
        place: col.place,
        expectedDigit: col.resultDigit,
        instruction: `Tulis ${col.resultDigit} di kotak jawaban ${placeLabel}.`,
      })
    }
  }

  steps.push({ kind: 'review', instruction: `Hebat! ${first} + ${second} = ${plan.result}.` })
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
  resultText: string,
): LearningStep[] {
  const plan = planSubtraction(first, second)
  const steps: LearningStep[] = [
    {
      kind: 'intro',
      instruction: `Ayo kurangkan ${first} − ${second}! Mulai dari kolom satuan. Tekan tombol Berikutnya untuk mulai.`,
    },
  ]

  for (const col of plan.columns) {
    const gridColumn = gridColumnOf(width, col.indexFromRight)
    if (!columnUsedByResult(gridColumn, width, resultText)) continue
    const placeLabel = PLACE_LABELS[col.place]
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
        instruction: `Apakah ${effective} bisa dikurangi ${col.bottom}?`,
      })
      const changes = buildBorrowChanges(plan, col.indexFromRight, width)
      const isChain = changes.length > 2
      steps.push({
        kind: 'borrow-explain',
        columnIndex: gridColumn,
        place: col.place,
        changes,
        instruction: isChain
          ? `${effective} tidak cukup dikurangi ${col.bottom}, sedangkan kolom di sebelah kiri bernilai 0. Pinjaman diteruskan sampai ketemu kolom yang bisa memberi. Lihat perubahannya, lalu tekan Berikutnya.`
          : `${effective} tidak cukup dikurangi ${col.bottom}. Kita pinjam 10 dari kolom ${PLACE_LABELS[plan.columns[col.indexFromRight + 1].place]}. Lihat perubahannya, lalu tekan Berikutnya.`,
      })
      steps.push({
        kind: 'answer-digit',
        columnIndex: gridColumn,
        place: col.place,
        expectedDigit: col.resultDigit,
        instruction: `Sekarang berapa ${col.topAfter} − ${col.bottom}? Tulis hasilnya di kotak ${placeLabel}.`,
      })
    } else if (col.borrowedFromLeft && isChainMid) {
      steps.push({
        kind: 'answer-digit',
        columnIndex: gridColumn,
        place: col.place,
        expectedDigit: col.resultDigit,
        instruction: `Ingat, angka 0 tadi sudah dipinjam lalu meminjam 10 sehingga menjadi ${col.topAfter}. Berapa ${col.topAfter} − ${col.bottom}? Tulis di kotak ${placeLabel}.`,
      })
    } else {
      const reminder = col.lentToRight
        ? `Ingat, ${col.topOriginal} sudah dipinjam 1 sehingga menjadi ${effective}. `
        : ''
      steps.push({
        kind: 'answer-digit',
        columnIndex: gridColumn,
        place: col.place,
        expectedDigit: col.resultDigit,
        instruction: `${reminder}Berapa ${effective} − ${col.bottom}? Tulis di kotak ${placeLabel}.`,
      })
    }
  }

  steps.push({ kind: 'review', instruction: `Hebat! ${first} − ${second} = ${plan.result}.` })
  return steps
}
