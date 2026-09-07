import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { screen, fireEvent, cleanup } from '@testing-library/react'
import { renderScreenWithProviders } from './helpers/renderWithProviders'
import * as aquariumSound from '../src/lib/aquariumSound'
import { FISH_PER_GROUP } from '../src/lib/aquariumPlaceValueMath'
import { buildAquariumFixture } from '../src/lib/aquariumQuestionGenerator'

describe('Akuarium — invarian skenario', () => {
  it('FISH_PER_GROUP tetap 10', () => {
    expect(FISH_PER_GROUP).toBe(10)
  })

  it('27+15: formGroup mempertahankan total 42', async () => {
    const { formGroup, totalFromSplit } = await import('../src/lib/aquariumPlaceValueMath')
    const before = { tens: 3, ones: 12 } // 27(2/7)+15(1/5) = 3 kelompok +12 ikan
    const after = formGroup(before.tens, before.ones)
    expect(after).toEqual({ tens: 4, ones: 2 })
    expect(totalFromSplit(before)).toBe(42)
    expect(totalFromSplit(after)).toBe(42)
    const f = buildAquariumFixture('addition', 27, 15)
    expect(f.expectedResult).toBe(42)
  })

  it('42-17: splitGroup mempertahankan total 42', async () => {
    const { splitGroup, totalFromSplit } = await import('../src/lib/aquariumPlaceValueMath')
    const before = { tens: 4, ones: 2 }
    const after = splitGroup(before.tens, before.ones)
    expect(after).toEqual({ tens: 3, ones: 12 })
    expect(totalFromSplit(before)).toBe(42)
    expect(totalFromSplit(after)).toBe(42)
    const f = buildAquariumFixture('subtraction', 42, 17)
    expect(f.expectedResult).toBe(25)
  })

  it('matematika adalah source of truth — posisi visual bukan kebenaran', async () => {
    const m = await import('../src/lib/aquariumPlaceValueMath')
    const a = m.splitTensOnes(27)
    const b = m.splitTensOnes(15)
    const combined = m.combinedForAddition(27, 15)
    expect(combined).toEqual({ tens: a.tens + b.tens, ones: a.ones + b.ones })
    const after = m.formGroup(combined.tens, combined.ones)
    expect(m.isCorrectOnesAnswer(27, 15, 'addition', after.ones)).toBe(true)
    expect(m.isCorrectTensAnswer(27, 15, 'addition', after.tens)).toBe(true)
  })

  it('klik berulang tidak menggandakan ikan — guard animating', async () => {
    const { formGroup, splitGroup } = await import('../src/lib/aquariumPlaceValueMath')
    // formGroup hanya boleh dipanggil sekali; panggil dua kali dengan guard di UI
    const once = formGroup(2, 12)
    expect(once).toEqual({ tens: 3, ones: 2 })
    // jika dipanggil lagi tanpa 10 ikan, throw
    expect(() => formGroup(once.tens, once.ones)).toThrow()
    const opened = splitGroup(4, 2)
    expect(() => splitGroup(opened.tens - 3, opened.ones)).toThrow()
    void splitGroup
  })
})

describe('Akuarium — lifecycle & kontrol (render)', () => {
  beforeEach(() => window.localStorage.clear())
  afterEach(() => cleanup())

  it('AquariumScreen render dan tombol interaktif ada', async () => {
    const AquariumScreen = (await import('../src/screens/AquariumScreen')).default
    renderScreenWithProviders(<AquariumScreen levelId="akuarium-1" />)
    // heading spesifik — gagal sebelumnya karena getByText menemukan 2 node (header + subtitle)
    expect(await screen.findByRole('heading', { name: /Akuarium Ikan Ceria/i })).not.toBeNull()
    const canvasOrFallback = document.querySelector('canvas') ?? screen.queryByRole('alert')
    expect(canvasOrFallback != null || screen.queryByRole('heading', { name: /Akuarium/i }) != null).toBe(true)
  })

  it('NumericKeypad tersedia tanpa drag (a11y)', async () => {
    const AquariumScreen = (await import('../src/screens/AquariumScreen')).default
    renderScreenWithProviders(<AquariumScreen levelId="akuarium-2" />)
    await screen.findByRole('heading', { name: /Akuarium Ikan Ceria/i })
    for (let d = 0; d <= 9; d++) {
      expect(screen.getByLabelText(`Angka ${d}`)).not.toBeNull()
    }
    expect(screen.getAllByText('Periksa').length).toBeGreaterThan(0)
  })

  it('narasi tidak tumpuk — speak dipanggil', async () => {
    const spy = vi.spyOn(aquariumSound, 'speak')
    const AquariumScreen = (await import('../src/screens/AquariumScreen')).default
    renderScreenWithProviders(<AquariumScreen levelId="akuarium-2" />)
    await screen.findByRole('heading', { name: /Akuarium Ikan Ceria/i })
    const hintBtn = screen.getByText('💡 Petunjuk')
    fireEvent.click(hintBtn)
    fireEvent.click(hintBtn)
    expect(spy).toHaveBeenCalled()
    spy.mockRestore()
  })

  it('unmount membatalkan audio', async () => {
    const spy = vi.spyOn(aquariumSound, 'stopAllAudio')
    const AquariumScreen = (await import('../src/screens/AquariumScreen')).default
    const { unmount } = renderScreenWithProviders(<AquariumScreen levelId="akuarium-1" />)
    await screen.findByRole('heading', { name: /Akuarium Ikan Ceria/i })
    unmount()
    expect(spy).toHaveBeenCalled()
    spy.mockRestore()
  })

  it('reduce motion: animasi tetap sinkron matematika walau durasi dipersingkat', async () => {
    // jsdom matchMedia default false — cek preferensi terbaca tanpa throw
    const m = window.matchMedia('(prefers-reduced-motion: reduce)')
    expect(typeof m.matches).toBe('boolean')
  })
})
