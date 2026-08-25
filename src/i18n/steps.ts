import type { DigitColumn, LearningStep, PlaceValue } from '../types'
import type { TFunction } from './core'

function placeLabel(t: TFunction, place: PlaceValue): string {
  switch (place) {
    case 'units':
      return t('place.units')
    case 'tens':
      return t('place.tens')
    case 'hundreds':
      return t('place.hundreds')
    case 'thousands':
      return t('place.thousands')
  }
}

/**
 * Menerjemahkan satu langkah belajar menjadi kalimat pada bahasa aktif.
 * Dipanggil saat render sehingga ganti bahasa berlaku instan, bahkan
 * untuk sesi yang sedang berjalan.
 */
export function stepInstruction(
  step: LearningStep,
  t: TFunction,
  columns?: readonly DigitColumn[],
): string {
  switch (step.kind) {
    case 'intro':
      return step.operation === 'addition'
        ? t('steps.introAdd', { first: step.first, second: step.second })
        : t('steps.introSub', { first: step.first, second: step.second })
    case 'interim-sum': {
      if (step.place === 'units' && step.carryIn === 0) {
        return t('steps.interimFirst', { a: step.addendA, b: step.addendB })
      }
      const sumText =
        step.carryIn > 0
          ? `${step.carryIn} + ${step.addendA} + ${step.addendB}`
          : `${step.addendA} + ${step.addendB}`
      return t('steps.interimNext', { sumText })
    }
    case 'answer-digit': {
      const place = placeLabel(t, step.place)
      if (step.sub) {
        if (step.sub.mode === 'afterBorrow') {
          return t('steps.subtractAfterBorrow', {
            topAfter: step.sub.topAfter,
            bottom: step.sub.bottom,
            place,
          })
        }
        if (step.sub.mode === 'chainMid') {
          return t('steps.subtractChainMid', {
            topAfter: step.sub.topAfter,
            bottom: step.sub.bottom,
            place,
          })
        }
        return t('steps.subtractPlain', {
          original: step.sub.topOriginal,
          effective: step.sub.effective,
          bottom: step.sub.bottom,
          place,
        })
      }
      return t('steps.writeAnswerPlain', { digit: step.expectedDigit, place })
    }
    case 'carry-digit':
      return t('steps.writeCarryBox', {
        carryOut: step.expectedDigit,
        place: placeLabel(t, step.place),
      })
    case 'borrow-question':
      return t('steps.borrowQuestion', { top: step.top, bottom: step.bottom })
    case 'borrow-explain': {
      if (step.changes.length > 2) {
        return t('steps.borrowExplainChain', { top: step.top, bottom: step.bottom })
      }
      // Peminjam sederhana = tetangga kiri kolom ini
      const lenderIndex = step.columnIndex - 1
      const lender = columns?.find((column) => column.index === lenderIndex)
      return t('steps.borrowExplainSimple', {
        top: step.top,
        bottom: step.bottom,
        leftPlace: lender ? placeLabel(t, lender.place) : '',
      })
    }
    case 'review':
      return step.operation === 'addition'
        ? t('steps.reviewAdd', { first: step.first, second: step.second, result: step.result })
        : t('steps.reviewSub', { first: step.first, second: step.second, result: step.result })
  }
}
