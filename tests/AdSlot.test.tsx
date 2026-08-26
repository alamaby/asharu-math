import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import AdSlot from '../src/components/common/AdSlot'
import { getClientId, getSlotId, isAdsenseEnabled, isValidClient } from '../src/lib/env'
import { AllProviders } from './helpers/renderWithProviders'

function stubAdsenseEnv(client?: string, slotHome?: string) {
  vi.stubEnv('VITE_ADSENSE_CLIENT', client ?? '')
  vi.stubEnv('VITE_ADSENSE_SLOT_HOME', slotHome ?? '')
}

beforeEach(() => {
  vi.stubEnv('VITE_ADSENSE_CLIENT', '')
  vi.stubEnv('VITE_ADSENSE_SLOT_HOME', '')
})

afterEach(() => {
  cleanup()
  vi.unstubAllEnvs()
})

describe('isValidClient', () => {
  it('menerima format ca-pub dengan minimal 10 digit', () => {
    expect(isValidClient('ca-pub-1234567890123456')).toBe(true)
  })

  it('menolak tanpa awalan ca-pub, terlalu pendek, atau bukan string', () => {
    expect(isValidClient('pub-1234567890')).toBe(false)
    expect(isValidClient('ca-pub-123')).toBe(false)
    expect(isValidClient(12345)).toBe(false)
    expect(isValidClient(undefined)).toBe(false)
  })
})

describe('env getters', () => {
  it('konfigurasi lengkap: enabled, client & slot terbaca', () => {
    stubAdsenseEnv('ca-pub-1234567890123456', '1234567890')
    expect(isAdsenseEnabled()).toBe(true)
    expect(getClientId()).toBe('ca-pub-1234567890123456')
    expect(getSlotId('home')).toBe('1234567890')
  })

  it('client valid tanpa slot penempatan: enabled tapi slot null', () => {
    stubAdsenseEnv('ca-pub-1234567890123456', undefined)
    expect(isAdsenseEnabled()).toBe(true)
    expect(getSlotId('home')).toBeNull()
    expect(getSlotId('result')).toBeNull()
  })

  it('tanpa konfigurasi: semuanya kosong/nonaktif', () => {
    expect(isAdsenseEnabled()).toBe(false)
    expect(getClientId()).toBeNull()
    expect(getSlotId('home')).toBeNull()
  })
})

describe('AdSlot — tanpa konfigurasi', () => {
  it('merender null saat env tidak dikonfigurasi', () => {
    const { container } = render(
      <AllProviders>
        <AdSlot placement="home" />
      </AllProviders>,
    )
    expect(container.querySelector('.adsbygoogle')).toBeNull()
    expect(container.textContent).not.toContain('Iklan')
  })

  it('merender null bila client valid tetapi slot penempatan kosong', () => {
    stubAdsenseEnv('ca-pub-1234567890123456', undefined)
    const { container } = render(
      <AllProviders>
        <AdSlot placement="home" />
      </AllProviders>,
    )
    expect(container.querySelector('.adsbygoogle')).toBeNull()
  })
})

describe('AdSlot — terkonfigurasi', () => {
  it('merender ins dengan atribut klien/slot dan label ARIA iklan', () => {
    stubAdsenseEnv('ca-pub-1234567890123456', '1234567890')
    render(
      <AllProviders>
        <AdSlot placement="home" />
      </AllProviders>,
    )
    const ins = screen.getByLabelText('Iklan').querySelector('.adsbygoogle')
    expect(ins).not.toBeNull()
    expect(ins?.getAttribute('data-ad-client')).toBe('ca-pub-1234567890123456')
    expect(ins?.getAttribute('data-ad-slot')).toBe('1234567890')
    expect(ins?.getAttribute('data-full-width-responsive')).toBe('true')
    // Permintaan iklan belum dikirim sebelum slot terlihat (lazy IO stub tidak memicu)
    expect(window.adsbygoogle ?? []).toHaveLength(0)
  })

  it('slot di penempatan lain tidak memakai slot home', () => {
    stubAdsenseEnv('ca-pub-1234567890123456', '1234567890')
    const { container } = render(
      <AllProviders>
        <AdSlot placement="result" />
      </AllProviders>,
    )
    expect(container.querySelector('.adsbygoogle')).toBeNull()
  })
})
