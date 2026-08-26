import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import LegalScreen from '../../src/screens/LegalScreen'
import SettingsScreen from '../../src/screens/SettingsScreen'
import { defaultProgress, STORAGE_KEY } from '../../src/lib/storage'
import { AllProviders, renderScreenWithProviders } from '../helpers/renderWithProviders'

function LegalProbe({ kind }: { kind: 'privacy' | 'terms' }) {
  return (
    <AllProviders>
      <LegalScreen kind={kind} />
    </AllProviders>
  )
}

beforeEach(() => {
  window.localStorage.clear()
})

afterEach(cleanup)

describe('LegalScreen', () => {
  it('privacy: judul & seksi inti tampil dalam Bahasa Indonesia', () => {
    render(<LegalProbe kind="privacy" />)
    expect(screen.getByText('Kebijakan Privasi')).not.toBeNull()
    expect(screen.getAllByText(/Google AdSense/).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/localStorage/).length).toBeGreaterThan(0)
    expect(screen.getByText(/Hak Orang Tua dan Wali/)).not.toBeNull()
  })

  it('terms: judul & batasan tanggung jawab tampil', () => {
    render(<LegalProbe kind="terms" />)
    expect(screen.getByText('Syarat dan Ketentuan Layanan')).not.toBeNull()
    expect(screen.getByText(/sebagaimana adanya/i)).not.toBeNull()
  })

  it('konten mengikuti bahasa aktif (EN saat preferensi language=en)', () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ ...defaultProgress(), language: 'en' }),
    )
    render(<LegalProbe kind="privacy" />)
    expect(screen.getByText('Privacy Policy')).not.toBeNull()
    expect(screen.getByText(/Parental Rights/)).not.toBeNull()
  })
})

describe('Navigasi ke dokumen legal dari Pengaturan', () => {
  it('tombol privasi mendorong layar privacy', () => {
    renderScreenWithProviders(<SettingsScreen />)
    fireEvent.click(screen.getByRole('button', { name: /Kebijakan Privasi/ }))
    expect(screen.getByTestId('probe-screen').textContent).toBe('privacy')
  })

  it('tombol terms mendorong layar terms', () => {
    renderScreenWithProviders(<SettingsScreen />)
    fireEvent.click(screen.getByRole('button', { name: /Syarat dan Ketentuan Layanan/ }))
    expect(screen.getByTestId('probe-screen').textContent).toBe('terms')
  })
})
