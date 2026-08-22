/** Bintang sesi: 3 jika hampir semua benar sekali coba, dst. */
export function starsFor(correctFirstTry: number, total: number): number {
  if (total <= 0) return 0
  const ratio = correctFirstTry / total
  if (ratio >= 0.9) return 3
  if (ratio >= 0.65) return 2
  return 1
}
