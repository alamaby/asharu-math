import { act, cleanup, render } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const { requestAdMock } = vi.hoisted(() => ({ requestAdMock: vi.fn() }))

vi.mock('../src/lib/adsense', () => ({
  ensureAdsenseLoaded: () => Promise.resolve(),
  requestAd: requestAdMock,
}))

const { default: AdSlot } = await import('../src/components/common/AdSlot')
const { AllProviders } = await import('./helpers/renderWithProviders')

/** IO yang langsung melaporkan interseksi agar efek visible terpicu. */
class ImmediateIntersectionObserver {
  readonly root = null
  readonly rootMargin = ''
  readonly thresholds: ReadonlyArray<number> = [0]
  constructor(callback: IntersectionObserverCallback) {
    callback([{ isIntersecting: true } as IntersectionObserverEntry], this)
  }
  disconnect(): void {}
  observe(): void {}
  unobserve(): void {}
  takeRecords(): IntersectionObserverEntry[] {
    return []
  }
}

function stubConfigured() {
  vi.stubEnv('VITE_ADSENSE_CLIENT', 'ca-pub-1234567890123456')
  vi.stubEnv('VITE_ADSENSE_SLOT_HOME', '1234567890')
}

beforeEach(() => {
  window.adsbygoogle = undefined
  vi.stubGlobal('IntersectionObserver', ImmediateIntersectionObserver)
})

afterEach(() => {
  cleanup()
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('AdSlot — pemulihan koneksi (regresi F1)', () => {
  it('offline saat mount tidak mengirim iklan; event online memicu sekali', async () => {
    stubConfigured()
    const onLineSpy = vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(false)

    render(
      <AllProviders>
        <AdSlot placement="home" />
      </AllProviders>,
    )

    // Offline saat mount → belum ada permintaan
    expect(requestAdMock).not.toHaveBeenCalled()

    // Koneksi pulih → listener 'online' mencoba ulang tepat satu kali
    onLineSpy.mockReturnValue(true)
    await act(async () => {
      window.dispatchEvent(new Event('online'))
    })

    expect(requestAdMock).toHaveBeenCalledTimes(1)
  })

  it('tetap hanya satu permintaan meski event online menyala berulang', async () => {
    stubConfigured()
    const onLineSpy = vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(true)

    render(
      <AllProviders>
        <AdSlot placement="home" />
      </AllProviders>,
    )
    await act(async () => {
      window.dispatchEvent(new Event('online'))
      window.dispatchEvent(new Event('online'))
    })

    expect(requestAdMock).toHaveBeenCalledTimes(1)
    void onLineSpy
  })
})
