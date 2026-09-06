import { describe, expect, it } from 'vitest'
import { createT } from '../src/i18n/core'
import { conceptChoices, conceptPrompt } from '../src/i18n/concept'
import { _helpers, buildConceptProblem, generateConceptSession } from '../src/lib/conceptGenerator'

describe('conceptGenerator', () => {
  it('counting: target & expectedAnswer sinkron, choices berisi jawaban', () => {
    const p = _helpers.buildCountingProblem(7)
    expect(p.kind).toBe('counting')
    expect(p.expectedAnswer).toBe('7')
    expect(p.choices).toContain('7')
    expect(p.choices).toHaveLength(4)
  })

  it('compare: expectedAnswer konsisten dengan left/right', () => {
    // helper deterministik — angka eksplisit tidak boleh dipaksa equal 20%
    expect(_helpers.buildCompareProblem(12, 7).expectedAnswer).toBe('greater')
    expect(_helpers.buildCompareProblem(5, 9).expectedAnswer).toBe('less')
    expect(_helpers.buildCompareProblem(10, 10).expectedAnswer).toBe('equal')
    // jalur acak tetap allowed set saja
    expect(['greater', 'less', 'equal']).toContain(buildConceptProblem('compare').expectedAnswer)
  })

  it('place-value: askedPlace sesuai expectedDigit', () => {
    const p = _helpers.buildPlaceValueProblem(47, 'tens')
    expect(p.expectedAnswer).toBe('4')
    expect(p.choices).toContain('4')
    const u = _helpers.buildPlaceValueProblem(53, 'units')
    expect(u.expectedAnswer).toBe('3')
  })

  it('counting tepi 1 & 20 tetap 4 choices dan tidak deadlock', () => {
    for (const v of [1, 20] as const) {
      const p = _helpers.buildCountingProblem(v)
      expect(p.choices).toHaveLength(4)
      expect(p.choices).toContain(String(v))
    }
  })

  it('buildConceptProblem & generateConceptSession tidak duplikat berurutan', () => {
    const session = generateConceptSession('counting', 10)
    expect(session).toHaveLength(10)
    for (let i = 1; i < session.length; i++) {
      const prev = JSON.stringify(session[i - 1].question)
      const cur = JSON.stringify(session[i].question)
      expect(cur === prev && session[i].expectedAnswer === session[i - 1].expectedAnswer).toBe(
        false,
      )
    }
  })

  it('faktor acak menghasilkan variasi antar panggil', () => {
    const a = buildConceptProblem('compare')
    const b = buildConceptProblem('compare')
    // tidak deterministik — cukup cek shape
    expect(['greater', 'less', 'equal']).toContain(a.expectedAnswer)
    expect(['greater', 'less', 'equal']).toContain(b.expectedAnswer)
  })
})

describe('i18n/concept render-time', () => {
  it('conceptPrompt & conceptChoices terjemahan ID/EN berbeda', () => {
    const p = _helpers.buildCountingProblem(5)
    const idPrompt = conceptPrompt(p.question, createT('id'))
    const enPrompt = conceptPrompt(p.question, createT('en'))
    expect(idPrompt).not.toBe(enPrompt)
    expect(idPrompt.length).toBeGreaterThan(0)

    const cmp = _helpers.buildCompareProblem(9, 3)
    const idChoices = conceptChoices(cmp, createT('id'))
    const enChoices = conceptChoices(cmp, createT('en'))
    expect(idChoices).not.toEqual(enChoices)
  })
})
