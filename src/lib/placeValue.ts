import type { DigitColumn, PlaceValue } from '../types'

export const PLACES_LEFT_TO_RIGHT: readonly PlaceValue[] = ['thousands', 'hundreds', 'tens', 'units']

export const PLACE_LABELS: Record<PlaceValue, string> = {
  thousands: 'ribuan',
  hundreds: 'ratusan',
  tens: 'puluhan',
  units: 'satuan',
}

export const PLACE_SHORT_LABELS: Record<PlaceValue, string> = {
  thousands: 'Rb',
  hundreds: 'R',
  tens: 'P',
  units: 'S',
}

/**
 * Tempat nilai untuk kolom pada posisi `indexFromLeft` (0 = paling kiri)
 * dalam grid selebar `width` kolom. Contoh: width 2, index 0 → puluhan.
 */
export function placeForColumnIndex(indexFromLeft: number, width: number): PlaceValue {
  const offset = PLACES_LEFT_TO_RIGHT.length - width + indexFromLeft
  if (offset < 0 || offset >= PLACES_LEFT_TO_RIGHT.length) {
    throw new Error(`Kolom di luar jangkauan: index ${indexFromLeft}, width ${width}`)
  }
  return PLACES_LEFT_TO_RIGHT[offset]
}

/**
 * Pad kiri sebuah string angka ke lebar `width` kolom.
 * Mengembalikan array dari kiri ke kanan dengan urutan digit ASLI;
 * posisi kosong bernilai null. Tidak memakai reverse().
 */
export function padToWidth(text: string, width: number): (string | null)[] {
  if (text.length > width) {
    throw new Error(`Angka ${text} lebih panjang dari ${width} kolom`)
  }
  const cells: (string | null)[] = new Array(width).fill(null)
  for (let i = 0; i < text.length; i++) {
    cells[width - text.length + i] = text[i]
  }
  return cells
}

export function problemWidth(firstText: string, secondText: string, resultText: string): number {
  return Math.max(firstText.length, secondText.length, resultText.length)
}

/**
 * Memetakan digit ke kolom nilai tempat TANPA mengubah urutan angka asli.
 * Baris pertama selalu operand pertama, baris kedua operand kedua.
 */
export function buildColumns(firstText: string, secondText: string, resultText: string): DigitColumn[] {
  const width = problemWidth(firstText, secondText, resultText)
  const first = padToWidth(firstText, width)
  const second = padToWidth(secondText, width)
  const result = padToWidth(resultText, width)
  const columns: DigitColumn[] = []
  for (let i = 0; i < width; i++) {
    columns.push({
      index: i,
      place: placeForColumnIndex(i, width),
      firstDigit: first[i],
      secondDigit: second[i],
      resultDigit: result[i],
      used: first[i] !== null || second[i] !== null || result[i] !== null,
    })
  }
  return columns
}

/** Menggabungkan digit yang terlihat (untuk pengujian urutan tampilan). */
export function joinDigits(cells: readonly (string | null)[]): string {
  return cells.filter((c): c is string => c !== null).join('')
}
