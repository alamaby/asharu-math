import { describe, expect, it } from 'vitest'
import { buildLearningSteps } from '../src/lib/learningSteps'
import { createT } from '../src/i18n/core'
import { stepInstruction } from '../src/i18n/steps'
import { buildColumns } from '../src/lib/placeValue'

const t = createT('id')

describe('langkah belajar penjumlahan 26 + 87', () => {
  const width = buildColumns('26', '87', '113').length
  const steps = buildLearningSteps('addition', 26, 87, width, 113)

  it('urutan langkah sesuai contoh spesifikasi', () => {
    expect(steps.map((s) => s.kind)).toEqual([
      'intro',
      'interim-sum', // satuan: 6 + 7, otomatis isi jawaban 3 + simpan 1
      'interim-sum', // puluhan: 1 + 2 + 8, otomatis isi jawaban 1 + simpan 1
      'carry-down', // turunkan 1 ke ratusan (tanpa input anak)
      'review',
    ])
  })

  it('kotak simpan dibawa oleh langkah interim satuan', () => {
    const firstInterim = steps[1]
    expect(firstInterim.kind).toBe('interim-sum')
    if (firstInterim.kind === 'interim-sum') {
      expect(firstInterim.expected).toBe(13)
      expect(firstInterim.expectedDigit).toBe(3)
      expect(firstInterim.carry).toMatchObject({
        digit: 1,
        columnIndex: width - 2,
        place: 'tens',
      })
    }
  })

  it('kolom turunan carry hanya butuh narasi (tanpa input angka)', () => {
    const down = steps[3]
    expect(down.kind).toBe('carry-down')
    if (down.kind === 'carry-down') {
      expect(down.digit).toBe(1)
      expect(stepInstruction(down, t)).toContain('1')
    }
  })

  it('instruksi interim satuan memuat "6 + 7" saat diterjemahkan', () => {
    const firstInterim = steps.find((s) => s.kind === 'interim-sum')
    expect(firstInterim?.kind).toBe('interim-sum')
    if (firstInterim?.kind === 'interim-sum') {
      const text = stepInstruction(firstInterim, t)
      expect(text).toContain('6 + 7')
      expect(text).toContain('Kotak Hitung')
    }
  })

  it('langkah pembuka menyebut Berikutnya dan membawa operand', () => {
    expect(steps[0].kind).toBe('intro')
    if (steps[0].kind === 'intro') {
      expect(steps[0]).toMatchObject({ operation: 'addition', first: 26, second: 87 })
    }
    expect(stepInstruction(steps[0], t)).toContain('Berikutnya')
  })

  it('hasil akhir pada langkah review adalah 113', () => {
    const review = steps[steps.length - 1]
    expect(review.kind).toBe('review')
    if (review.kind === 'review') {
      expect(review.result).toBe(113)
      expect(stepInstruction(review, t)).toContain('113')
    }
  })
})

describe('langkah belajar penjumlahan tanpa carry 23 + 14', () => {
  it('tidak ada langkah carry atau turunkan carry', () => {
    const width = buildColumns('23', '14', '37').length
    const steps = buildLearningSteps('addition', 23, 14, width, 37)
    expect(steps.some((s) => s.kind === 'carry-down')).toBe(false)
    expect(steps.map((s) => s.kind)).toEqual([
      'intro',
      'interim-sum', // satuan: 3 + 4
      'interim-sum', // puluhan: 2 + 1
      'review',
    ])
    const review = steps[steps.length - 1]
    if (review.kind === 'review') {
      expect(stepInstruction(review, t)).toContain('37')
    }
  })
})

describe('langkah belajar pengurangan 52 - 28', () => {
  const width = buildColumns('52', '28', '24').length
  const steps = buildLearningSteps('subtraction', 52, 28, width, 24)

  it('urutan langkah meminjam sesuai spesifikasi', () => {
    expect(steps.map((s) => s.kind)).toEqual([
      'intro',
      'borrow-question', // apakah 2 bisa dikurangi 8?
      'borrow-explain', // 5 → 4, 2 → 12
      'answer-digit', // 12 - 8 = 4
      'answer-digit', // 4 - 2 = 2
      'review',
    ])
  })

  it('pertanyaan pinjam membawa top=2 dan bottom=8', () => {
    const question = steps.find((s) => s.kind === 'borrow-question')
    expect(question?.kind).toBe('borrow-question')
    if (question?.kind === 'borrow-question') {
      expect(question.top).toBe(2)
      expect(question.bottom).toBe(8)
      const text = stepInstruction(question, t)
      expect(text).toContain('2')
      expect(text).toContain('8')
    }
  })

  it('penjelasan pinjam menunjukkan 5 menjadi 4 dan 2 menjadi 12', () => {
    const explain = steps.find((s) => s.kind === 'borrow-explain')
    expect(explain?.kind).toBe('borrow-explain')
    if (explain?.kind === 'borrow-explain') {
      expect(explain.changes).toEqual([
        { columnIndex: width - 1, before: 2, after: 12 },
        { columnIndex: width - 2, before: 5, after: 4 },
      ])
    }
  })

  it('hasil akhir 24', () => {
    const review = steps[steps.length - 1]
    if (review.kind === 'review') {
      expect(stepInstruction(review, t)).toContain('24')
    }
  })
})

describe('borrow berantai 1000 - 1', () => {
  const width = buildColumns('1000', '1', '999').length
  const steps = buildLearningSteps('subtraction', 1000, 1, width, 999)

  it('penjelasan pinjam mencakup seluruh rantai kolom', () => {
    const explain = steps.find((s) => s.kind === 'borrow-explain')
    expect(explain?.kind).toBe('borrow-explain')
    if (explain?.kind === 'borrow-explain') {
      expect(explain.changes).toEqual([
        { columnIndex: 3, before: 0, after: 10 },
        { columnIndex: 2, before: 0, after: 9 },
        { columnIndex: 1, before: 0, after: 9 },
        { columnIndex: 0, before: 1, after: 0 },
      ])
    }
    const review = steps[steps.length - 1]
    if (review.kind === 'review') {
      expect(stepInstruction(review, t)).toContain('999')
    }
  })

  it('tidak ada langkah menulis leading zero di kolom ribuan', () => {
    const answerSteps = steps.filter((s) => s.kind === 'answer-digit')
    expect(answerSteps).toHaveLength(3)
    expect(answerSteps.every((s) => s.kind === 'answer-digit' && s.columnIndex >= 1)).toBe(true)
  })
})
