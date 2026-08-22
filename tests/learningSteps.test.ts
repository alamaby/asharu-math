import { describe, expect, it } from 'vitest'
import { buildLearningSteps } from '../src/lib/learningSteps'
import { buildColumns } from '../src/lib/placeValue'

describe('langkah belajar penjumlahan 26 + 87', () => {
  const width = buildColumns('26', '87', '113').length
  const steps = buildLearningSteps('addition', 26, 87, width, '113')

  it('urutan langkah sesuai contoh spesifikasi', () => {
    expect(steps.map((s) => s.kind)).toEqual([
      'intro',
      'interim-sum', // satuan: 6 + 7
      'answer-digit', // tulis 3
      'carry-digit', // simpan 1 di atas puluhan
      'interim-sum', // puluhan: 1 + 2 + 8
      'answer-digit', // tulis 1
      'carry-digit', // simpan 1 di atas ratusan
      'answer-digit', // turunkan 1 ke ratusan
      'review',
    ])
  })

  it('kotak simpan menuju kolom puluhan (bukan satuan)', () => {
    const carrySteps = steps.filter((s) => s.kind === 'carry-digit')
    const firstCarry = carrySteps[0]
    expect(firstCarry.kind).toBe('carry-digit')
    if (firstCarry.kind === 'carry-digit') {
      expect(firstCarry.place).toBe('tens')
      expect(firstCarry.columnIndex).toBe(width - 2)
      expect(firstCarry.expectedDigit).toBe(1)
    }
  })

  it('instruksi satuan memuat "6 + 7"', () => {
    const firstInterim = steps.find((s) => s.kind === 'interim-sum')
    expect(firstInterim?.instruction).toContain('6 + 7')
  })

  it('langkah pembuka menyuruh menekan Berikutnya dan instruksi interim menunjuk Kotak Hitung', () => {
    expect(steps[0].instruction).toContain('Berikutnya')
    const firstInterim = steps.find((s) => s.kind === 'interim-sum')
    expect(firstInterim?.instruction).toContain('Kotak Hitung')
  })

  it('hasil akhir pada langkah review adalah 113', () => {
    const review = steps[steps.length - 1]
    expect(review.kind).toBe('review')
    expect(review.instruction).toContain('113')
  })
})

describe('langkah belajar penjumlahan tanpa carry 23 + 14', () => {
  it('tidak ada langkah carry', () => {
    const width = buildColumns('23', '14', '37').length
    const steps = buildLearningSteps('addition', 23, 14, width, '37')
    expect(steps.some((s) => s.kind === 'carry-digit')).toBe(false)
    expect(steps[steps.length - 1].instruction).toContain('37')
  })
})

describe('langkah belajar pengurangan 52 - 28', () => {
  const width = buildColumns('52', '28', '24').length
  const steps = buildLearningSteps('subtraction', 52, 28, width, '24')

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

  it('pertanyaan pinjam memuat "2" dan "8"', () => {
    const question = steps.find((s) => s.kind === 'borrow-question')
    expect(question?.instruction).toContain('2')
    expect(question?.instruction).toContain('8')
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
    expect(steps[steps.length - 1].instruction).toContain('24')
  })
})

describe('borrow berantai 1000 - 1', () => {
  const width = buildColumns('1000', '1', '999').length
  const steps = buildLearningSteps('subtraction', 1000, 1, width, '999')

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
    expect(steps[steps.length - 1].instruction).toContain('999')
  })

  it('tidak ada langkah menulis leading zero di kolom ribuan', () => {
    const answerSteps = steps.filter((s) => s.kind === 'answer-digit')
    expect(answerSteps).toHaveLength(3)
    expect(answerSteps.every((s) => s.kind === 'answer-digit' && s.columnIndex >= 1)).toBe(true)
  })
})
