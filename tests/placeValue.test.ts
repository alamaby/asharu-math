import { describe, expect, it } from 'vitest'
import {
  buildColumns,
  joinDigits,
  padToWidth,
  placeForColumnIndex,
  problemWidth,
} from '../src/lib/placeValue'

describe('placeForColumnIndex', () => {
  it('memetakan kolom ke nilai tempat dengan benar', () => {
    expect(placeForColumnIndex(0, 2)).toBe('tens')
    expect(placeForColumnIndex(1, 2)).toBe('units')
    expect(placeForColumnIndex(0, 4)).toBe('thousands')
    expect(placeForColumnIndex(3, 4)).toBe('units')
  })
})

describe('padToWidth', () => {
  it('menjaga urutan digit asli (tanpa reverse)', () => {
    expect(padToWidth('26', 3)).toEqual([null, '2', '6'])
    expect(padToWidth('87', 3)).toEqual([null, '8', '7'])
    expect(padToWidth('999', 4)).toEqual([null, '9', '9', '9'])
  })

  it('menolak angka yang lebih panjang dari lebar kolom', () => {
    expect(() => padToWidth('123', 2)).toThrow()
  })
})

describe('buildColumns — urutan tampilan', () => {
  it('26 + 87: baris pertama tetap 26, baris kedua tetap 87 (bukan 62/78)', () => {
    const columns = buildColumns('26', '87', '113')
    expect(joinDigits(columns.map((c) => c.firstDigit))).toBe('26')
    expect(joinDigits(columns.map((c) => c.secondDigit))).toBe('87')
    expect(joinDigits(columns.map((c) => c.resultDigit))).toBe('113')
    expect(columns).toHaveLength(3)
  })

  it('26 + 87: digit 6 dan 7 di kolom satuan, 2 dan 8 di kolom puluhan', () => {
    const columns = buildColumns('26', '87', '113')
    expect(columns[2].place).toBe('units')
    expect(columns[2].firstDigit).toBe('6')
    expect(columns[2].secondDigit).toBe('7')
    expect(columns[1].place).toBe('tens')
    expect(columns[1].firstDigit).toBe('2')
    expect(columns[1].secondDigit).toBe('8')
    // Kolom ratusan dipakai hasil saja
    expect(columns[0].place).toBe('hundreds')
    expect(columns[0].firstDigit).toBeNull()
    expect(columns[0].secondDigit).toBeNull()
    expect(columns[0].resultDigit).toBe('1')
  })

  it('52 - 28: baris pertama 52, baris kedua 28, hasil 24', () => {
    const columns = buildColumns('52', '28', '24')
    expect(joinDigits(columns.map((c) => c.firstDigit))).toBe('52')
    expect(joinDigits(columns.map((c) => c.secondDigit))).toBe('28')
    expect(joinDigits(columns.map((c) => c.resultDigit))).toBe('24')
  })

  it('999 + 1: satuan tetap lurus satuan setelah padding', () => {
    const columns = buildColumns('999', '1', '1000')
    expect(columns).toHaveLength(4)
    expect(joinDigits(columns.map((c) => c.firstDigit))).toBe('999')
    expect(joinDigits(columns.map((c) => c.secondDigit))).toBe('1')
    expect(joinDigits(columns.map((c) => c.resultDigit))).toBe('1000')
    expect(columns[3].firstDigit).toBe('9')
    expect(columns[3].secondDigit).toBe('1')
  })

  it('1000 - 1: hasil 999 rata kanan tanpa leading zero', () => {
    const columns = buildColumns('1000', '1', '999')
    expect(columns).toHaveLength(4)
    expect(columns[0].resultDigit).toBeNull()
    expect(joinDigits(columns.map((c) => c.resultDigit))).toBe('999')
    expect(joinDigits(columns.map((c) => c.secondDigit))).toBe('1')
  })

  it('1234 + 4321: keempat nilai tempat sejajar', () => {
    const columns = buildColumns('1234', '4321', '5555')
    expect(columns.map((c) => c.place)).toEqual(['thousands', 'hundreds', 'tens', 'units'])
    expect(joinDigits(columns.map((c) => c.firstDigit))).toBe('1234')
    expect(joinDigits(columns.map((c) => c.secondDigit))).toBe('4321')
  })

  it('problemWidth mengikuti digit terbanyak termasuk hasil', () => {
    expect(problemWidth('26', '87', '113')).toBe(3)
    expect(problemWidth('999', '1', '1000')).toBe(4)
    expect(problemWidth('1000', '1', '999')).toBe(4)
  })

  it('angka 26 dan 87 tidak pernah tampil sebagai 62 atau 78 pada semua lebar', () => {
    for (let width = 2; width <= 4; width++) {
      expect(joinDigits(padToWidth('26', width))).toBe('26')
      expect(joinDigits(padToWidth('87', width))).toBe('87')
    }
  })
})
