import { describe, expect, it } from 'vitest'
import { starsForTrainAttempt, sumTrainStars } from '../src/lib/trainStars'

describe('starsForTrainAttempt', () => {
  it('percobaan pertama 3 bintang, kedua 2, ketiga+ 1', () => {
    expect(starsForTrainAttempt(1)).toBe(3)
    expect(starsForTrainAttempt(2)).toBe(2)
    expect(starsForTrainAttempt(3)).toBe(1)
    expect(starsForTrainAttempt(4)).toBe(1)
    expect(starsForTrainAttempt(99)).toBe(1)
  })

  it('tidak ada skor nol atau negatif', () => {
    expect(starsForTrainAttempt(0)).toBe(3)
    for (let a = 1; a <= 10; a++) {
      expect(starsForTrainAttempt(a)).toBeGreaterThanOrEqual(1)
    }
  })
})

describe('sumTrainStars', () => {
  it('menjumlahkan bintang per soal', () => {
    expect(sumTrainStars([1, 1, 1, 1, 1])).toBe(15)
    expect(sumTrainStars([1, 2, 3, 2, 1])).toBe(11)
    expect(sumTrainStars([])).toBe(0)
  })
})
