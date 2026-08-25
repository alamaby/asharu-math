import { cleanup, fireEvent, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import SettingsScreen from '../../src/screens/SettingsScreen'
import { renderScreenWithProviders } from '../helpers/renderWithProviders'

afterEach(cleanup)

describe('SettingsScreen', () => {
  it('merender judul dan kedua saklar preferensi aktif secara default', () => {
    renderScreenWithProviders(<SettingsScreen />)
    expect(screen.getByText('Pengaturan')).not.toBeNull()
    const soundToggle = screen.getByRole('switch', { name: /Suara/ })
    const animationToggle = screen.getByRole('switch', { name: /Animasi/ })
    expect(soundToggle.getAttribute('aria-checked')).toBe('true')
    expect(animationToggle.getAttribute('aria-checked')).toBe('true')
  })

  it('saklar suara dapat dimatikan lalu dinyalakan kembali', () => {
    renderScreenWithProviders(<SettingsScreen />)
    const soundToggle = screen.getByRole('switch', { name: /Suara/ })
    fireEvent.click(soundToggle)
    expect(screen.getByRole('switch', { name: /Suara/ }).getAttribute('aria-checked')).toBe('false')
    fireEvent.click(screen.getByRole('switch', { name: /Suara/ }))
    expect(screen.getByRole('switch', { name: /Suara/ }).getAttribute('aria-checked')).toBe('true')
  })

  it('menyimpan nama anak lewat form pengaturan', () => {
    renderScreenWithProviders(<SettingsScreen />)
    const input = screen.getByLabelText('Nama panggilan anak') as HTMLInputElement
    fireEvent.change(input, { target: { value: 'Sari' } })
    fireEvent.click(screen.getByRole('button', { name: /Simpan Nama/ }))
    // Nama tersimpan: tombol hapus nama muncul
    expect(screen.getByRole('button', { name: /Hapus nama/ })).not.toBeNull()
  })

  it('dialog konfirmasi hapus progres membatalkan tanpa menghapus', () => {
    renderScreenWithProviders(<SettingsScreen />)
    fireEvent.click(screen.getByRole('button', { name: /Hapus Progres/ }))
    fireEvent.click(screen.getByRole('button', { name: 'Batal' }))
    // Dialog tertutup; saklar tetap ada (aplikasi tidak reset)
    expect(screen.queryByRole('button', { name: 'Ya, hapus' })).toBeNull()
  })
})
