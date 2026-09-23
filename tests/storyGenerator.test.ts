import { describe, expect, it } from 'vitest'
import { createT } from '../src/i18n/core'
import { storyPartPrompt, storyStem } from '../src/i18n/story'
import {
  buildF0AddStory,
  buildF1DiffStory,
  buildF2TransferStory,
  buildF3ChainStory,
  generateStorySession,
} from '../src/lib/storyGenerator'

const presetCerita1 = {
  kind: 'story' as const,
  operation: 'addition' as const,
  digitCount: 2 as const,
  carryMode: 'any' as const,
  questionCount: 5,
  families: ['f0-add'] as const,
}

const presetCerita2 = {
  kind: 'story' as const,
  operation: 'subtraction' as const,
  digitCount: 2 as const,
  carryMode: 'any' as const,
  questionCount: 5,
  families: ['f0-sub'] as const,
}

const presetCerita3 = {
  kind: 'story' as const,
  operation: 'mixed' as const,
  digitCount: 2 as const,
  carryMode: 'any' as const,
  questionCount: 5,
  families: ['f0-add', 'f0-sub', 'f1-diff'] as const,
}

const presetCerita4 = {
  kind: 'story' as const,
  operation: 'mixed' as const,
  digitCount: 3 as const,
  carryMode: 'any' as const,
  questionCount: 5,
  families: ['f1-diff', 'f2-transfer', 'f3-chain', 'f4-join3', 'f5-tiered'] as const,
}

describe('storyGenerator deterministik', () => {
  it('F1 full: parts [33, 78] dengan op sesuai', () => {
    const stem = buildF1DiffStory({
      x: 45,
      y: 12,
      item: 'marbles',
      nameA: 'Siti',
      nameB: 'Budi',
      variant: 'full',
    })
    expect(stem.parts).toHaveLength(2)
    expect(stem.parts[0].operation).toBe('subtraction')
    expect(stem.parts[0].a).toBe(45)
    expect(stem.parts[0].b).toBe(12)
    expect(stem.parts[0].expectedAnswer).toBe(33)
    expect(stem.parts[1].operation).toBe('addition')
    expect(stem.parts[1].a).toBe(45)
    expect(stem.parts[1].b).toBe(33)
    expect(stem.parts[1].expectedAnswer).toBe(78)
  })

  it('F2: parts [8, 29, 31] dengan q implisit', () => {
    const stem = buildF2TransferStory({
      x: 36,
      p: 15,
      r: 7,
      s: 24,
      item: 'apples',
      nameA: 'Siti',
      nameB: 'Budi',
    })
    expect(stem.parts).toHaveLength(3)
    expect(stem.parts[0].a).toBe(15)
    expect(stem.parts[0].b).toBe(7)
    expect(stem.parts[0].expectedAnswer).toBe(8)
    expect(stem.parts[1].a).toBe(36)
    expect(stem.parts[1].b).toBe(7)
    expect(stem.parts[1].expectedAnswer).toBe(29)
    expect(stem.parts[2].a).toBe(24)
    expect(stem.parts[2].b).toBe(7)
    expect(stem.parts[2].expectedAnswer).toBe(31)
  })

  it('F2 throw ketika p+q !== x', () => {
    expect(() => buildF2TransferStory({ x: 30, p: 15, q: 10, r: 5, s: 20 })).toThrow(
      'p+q harus sama dengan x',
    )
  })

  it('F3: parts [35, 27, 82] dengan total part terakhir {op:add,a:62,b:20}', () => {
    const stem = buildF3ChainStory({
      c: 20,
      n: 15,
      m: 8,
      item: 'books',
      nameA: 'Siti',
      nameB: 'Budi',
      nameC: 'Andi',
    })
    expect(stem.parts).toHaveLength(3)
    expect(stem.parts[0].a).toBe(20)
    expect(stem.parts[0].b).toBe(15)
    expect(stem.parts[0].expectedAnswer).toBe(35)
    expect(stem.parts[1].a).toBe(35)
    expect(stem.parts[1].b).toBe(8)
    expect(stem.parts[1].expectedAnswer).toBe(27)
    expect(stem.parts[2].operation).toBe('addition')
    expect(stem.parts[2].a).toBe(62)
    expect(stem.parts[2].b).toBe(20)
    expect(stem.parts[2].expectedAnswer).toBe(82)
  })

  it('F0-add: part tunggal expected 37', () => {
    const stem = buildF0AddStory({ a: 23, b: 14, item: 'cakes', name: 'Dewi' })
    expect(stem.parts).toHaveLength(1)
    expect(stem.parts[0].operation).toBe('addition')
    expect(stem.parts[0].a).toBe(23)
    expect(stem.parts[0].b).toBe(14)
    expect(stem.parts[0].expectedAnswer).toBe(37)
  })
})

describe('storyGenerator properti universal (fuzz)', () => {
  const presets = [presetCerita1, presetCerita2, presetCerita3, presetCerita4]

  for (const preset of presets) {
    it(`part valid untuk ${preset.kind}/${preset.operation}/${preset.digitCount}`, () => {
      const cap = 10 ** preset.digitCount - 1
      for (let i = 0; i < 200; i++) {
        const stems = generateStorySession(preset)
        for (const stem of stems) {
          for (const part of stem.parts) {
            expect(part.math.expectedResult).toBe(part.expectedAnswer)
            expect(part.a >= 10 && part.a <= cap).toBe(true)
            expect(part.b >= 0 && part.b <= cap).toBe(true)
            // Untuk cerita multi-part, expectedAnswer bisa > cap (total B/total soal); hanya validasi non-negatif
            expect(part.expectedAnswer >= 0).toBe(true)
            if (part.operation === 'subtraction') {
              expect(part.a >= part.b).toBe(true)
            }
          }
        }
      }
    })
  }
})

describe('storyGenerator session', () => {
  it('questionCount=5 -> tepat 5 part akumulatif', () => {
    const stems = generateStorySession({ ...presetCerita3, questionCount: 5 })
    const totalParts = stems.reduce((s, st) => s + st.parts.length, 0)
    expect(totalParts).toBe(5)
  })

  it('stem berurutan tidak duplikat berdekatan (kunci family+params)', () => {
    const stems = generateStorySession({ ...presetCerita3, questionCount: 20 })
    for (let i = 1; i < stems.length; i++) {
      const prev = `${stems[i - 1].family}:${JSON.stringify(stems[i - 1].stemParams)}`
      const cur = `${stems[i].family}:${JSON.stringify(stems[i].stemParams)}`
      expect(cur === prev).toBe(false)
    }
  })
})

describe('i18n/story render-time', () => {
  it('storyStem F1 ID mengandung angka+nama; EN beda tapi tetap mengandung angka+nama', () => {
    const stem = buildF1DiffStory({ x: 45, y: 12, item: 'marbles', nameA: 'Siti', nameB: 'Budi' })
    const idText = storyStem(stem.family, stem.stemParams, createT('id'))
    const enText = storyStem(stem.family, stem.stemParams, createT('en'))
    expect(idText).toContain('45')
    expect(idText).toContain('Siti')
    expect(enText).toContain('45')
    expect(enText).toContain('Siti')
    expect(idText).not.toBe(enText)
    // kata Indonesia tidak muncul di versi EN
    expect(enText).not.toContain('punya')
  })

  it('storyPartPrompt F0 mengembalikan stem yang sama (single-part)', () => {
    const stem = buildF0AddStory({ a: 23, b: 14, item: 'cakes', name: 'Dewi' })
    const part = stem.parts[0]
    const stemText = storyStem(stem.family, stem.stemParams, createT('id'))
    const partText = storyPartPrompt(part, createT('id'))
    expect(partText).toBe(stemText)
  })
})
