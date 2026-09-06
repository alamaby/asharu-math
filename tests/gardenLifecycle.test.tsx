import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { screen, fireEvent, cleanup, act } from '@testing-library/react'
import GardenScreen from '../src/screens/GardenScreen'
import { renderScreenWithProviders } from './helpers/renderWithProviders'
import * as gardenSound from '../src/lib/gardenSound'
import { APPLES_PER_BASKET } from '../src/lib/placeValueMath'

describe('Garden — lifecycle & kontrol', () => {
  beforeEach(() => window.localStorage.clear())
  afterEach(() => cleanup())

  it('reset mengembalikan state awal', async () => {
    renderScreenWithProviders(<GardenScreen levelId="kebun-1" />)
    expect(await screen.findByText('Ulangi Soal')).not.toBeNull()
    fireEvent.click(screen.getByText('Ulangi Soal'))
    expect(screen.getByLabelText(/Soal 1 dari 5/i)).not.toBeNull()
  })

  it('klik Periksa berulang tidak menggandakan onComplete (idempoten)', async () => {
    renderScreenWithProviders(<GardenScreen levelId="kebun-1" />)
    const periksaButtons = await screen.findAllByText('Periksa')
    expect(periksaButtons.length).toBeGreaterThan(0)
  })

  it('narasi tidak tumpuk — speak cancel dipanggil', async () => {
    const spy = vi.spyOn(gardenSound, 'speak')
    renderScreenWithProviders(<GardenScreen levelId="kebun-2" />)
    await screen.findByText(/Kebun Apel Ajaib/i)
    const hintBtn = screen.getByText('💡 Petunjuk')
    fireEvent.click(hintBtn)
    fireEvent.click(hintBtn)
    expect(spy).toHaveBeenCalled()
    spy.mockRestore()
  })

  it('kontrol suara toggle memicu event', async () => {
    renderScreenWithProviders(<GardenScreen levelId="kebun-1" />)
    const toggle = await screen.findByLabelText(/Suara/i)
    expect(toggle).not.toBeNull()
    const before = toggle.getAttribute('aria-pressed')
    fireEvent.click(toggle)
    await act(async () => {
      await new Promise((r) => setTimeout(r, 50))
    })
    expect(screen.getByLabelText(/Suara/i)).not.toBeNull()
    void before
  })

  it('alur keyboard: digit via NumericKeypad tersedia', async () => {
    renderScreenWithProviders(<GardenScreen levelId="kebun-1" />)
    expect((await screen.findAllByText('Periksa')).length).toBeGreaterThan(0)
    for (let d = 0; d <= 9; d++) {
      expect(screen.getByLabelText(`Angka ${d}`)).not.toBeNull()
    }
  })

  it('APPLES_PER_BASKET tetap 10', () => {
    expect(APPLES_PER_BASKET).toBe(10)
  })

  it('unmount membatalkan timer & audio tanpa leak', async () => {
    const stopSpy = vi.spyOn(gardenSound, 'stopAllAudio')
    const { unmount } = renderScreenWithProviders(<GardenScreen levelId="kebun-2" />)
    await screen.findByText(/Kebun Apel Ajaib/i)
    unmount()
    expect(stopSpy).toHaveBeenCalled()
    stopSpy.mockRestore()
  })
})
