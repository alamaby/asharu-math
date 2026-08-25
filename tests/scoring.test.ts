import { describe, expect, it } from 'vitest'
import { starsFor } from '../src/lib/scoring'

describe('starsFor', () => {
  it('total <= 0 mengembalikan 0 bintang', () => {
    expect(starsFor(0, 0)).toBe(0)
    expect(starsFor(5, 0)).toBe(0)
  })

  it('rasio >= 0.9 mengembalikan 3 bintang', () => {
    expect(starsFor(9, 10)).toBe(3)
    expect(starsFor(10, 10)).toBe(3)
  })

  it('batas bawah tepat 0.65 mengembalikan 2 bintang', () => {
    expect(starsFor(13, 20)).toBe(2)
    expect(starsFor(7, 10)).toBe(2)
  })

  it('rasio di bawah 0.65 tetap mendapat 1 bintang', () => {
    expect(starsFor(12, 20)).toBe(1)
    expect(starsFor(0, 10)).toBe(1)
  })
})
