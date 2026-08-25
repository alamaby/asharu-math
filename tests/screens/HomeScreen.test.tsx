import { cleanup, fireEvent, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import HomeScreen from '../../src/screens/HomeScreen'
import { renderScreenWithProviders } from '../helpers/renderWithProviders'

afterEach(cleanup)

describe('HomeScreen', () => {
  it('menampilkan form nama saat nama anak belum diisi', () => {
    renderScreenWithProviders(<HomeScreen />)
    // MascotBubble merender teks sapaan; pastikan form nama ikut tampil
    expect(screen.getAllByText(/siapa namamu/i).length).toBeGreaterThan(0)
    expect(screen.getByLabelText('Nama panggilan anak')).not.toBeNull()
  })

  it('kartu ringkasan progres tampil dengan nilai awal', () => {
    renderScreenWithProviders(<HomeScreen />)
    const summary = screen.getByLabelText('Ringkasan progres')
    expect(within(summary).getByText('Level selesai')).not.toBeNull()
    expect(within(summary).getByText('Hari berturut-turut')).not.toBeNull()
    expect(within(summary).getByText('Jawaban benar')).not.toBeNull()
  })

  it('tombol lanjutkan nonaktif ketika belum ada level dimulai', () => {
    renderScreenWithProviders(<HomeScreen />)
    const continueButton = screen.getByRole('button', { name: /Lanjutkan/ })
    expect((continueButton as HTMLButtonElement).disabled).toBe(true)
    expect(continueButton.textContent).toContain('mulai level pertama dulu')
  })

  it('tombol utama menavigasi ke tab yang sesuai', () => {
    renderScreenWithProviders(<HomeScreen />)
    fireEvent.click(screen.getByRole('button', { name: /Mulai Belajar/ }))
    expect(screen.getByTestId('probe-screen').textContent).toBe('levels')

    fireEvent.click(screen.getByRole('button', { name: /Latihan Soal/ }))
    expect(screen.getByTestId('probe-screen').textContent).toBe('practice')
  })

  it('tombol pengaturan membuka layar settings', () => {
    renderScreenWithProviders(<HomeScreen />)
    fireEvent.click(screen.getByRole('button', { name: /Pengaturan/ }))
    expect(screen.getByTestId('probe-screen').textContent).toBe('settings')
  })
})
