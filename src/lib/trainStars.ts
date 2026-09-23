/**
 * Bintang per-soal kereta: attempt 1 → 3, attempt 2 → 2, attempt ≥3 → 1.
 * Tidak ada skor nol/negatif.
 */

export const TRAIN_MAX_STARS_PER_QUESTION = 3

export function starsForTrainAttempt(attempt: number): 1 | 2 | 3 {
  if (!Number.isFinite(attempt) || attempt <= 1) return 3
  const normalized = Math.ceil(attempt)
  if (normalized <= 1) return 3
  if (normalized === 2) return 2
  return 1
}

export function sumTrainStars(attempts: readonly number[]): number {
  let total = 0
  for (const a of attempts) {
    total += starsForTrainAttempt(a)
  }
  return total
}
