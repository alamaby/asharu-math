import { act, cleanup, fireEvent, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import PracticeScreen from '../../src/screens/PracticeScreen'
import { renderScreenWithProviders } from '../helpers/renderWithProviders'

beforeEach(() => {
  vi.useFakeTimers()
  window.localStorage.clear()
})

afterEach(() => {
  vi.useRealTimers()
  cleanup()
})

describe('PracticeScreen', () => {
  it('fase setup: konfigurasi dan klik Mulai Latihan memulai sesi bersusun', () => {
    renderScreenWithProviders(<PracticeScreen />)
    expect(screen.getByText('Pengaturan Latihan')).not.toBeNull()
    expect(screen.getByRole('button', { name: 'Mulai Latihan' })).not.toBeNull()

    fireEvent.click(screen.getByRole('button', { name: 'Mulai Latihan' }))

    // Berpindah ke solving bersusun
    expect(screen.queryByText('Pengaturan Latihan')).toBeNull()
    expect(screen.getByText(/Soal 1 dari 5/)).not.toBeNull()
    expect(screen.getByRole('button', { name: 'Periksa' })).not.toBeNull()
  })

  it('fase custom: mengisi angka kustom dan klik Ayo Kerjakan memulai sesi bersusun 1 soal', () => {
    renderScreenWithProviders(<PracticeScreen />)

    const topInput = screen.getByLabelText('Angka atas untuk soal buatan sendiri')
    const bottomInput = screen.getByLabelText('Angka bawah untuk soal buatan sendiri')

    fireEvent.change(topInput, { target: { value: '12' } })
    fireEvent.change(bottomInput, { target: { value: '34' } })

    fireEvent.click(screen.getByRole('button', { name: 'Kerjakan Soal Ini' }))

    expect(screen.getByText(/Soal 1 dari 1/)).not.toBeNull()
    expect(screen.getByRole('button', { name: 'Periksa' })).not.toBeNull()
  })

  it('input angka dan periksa jawaban yang benar', () => {
    renderScreenWithProviders(<PracticeScreen />)

    // Buat soal kustom sederhana: 10 + 20 = 30
    const topInput = screen.getByLabelText('Angka atas untuk soal buatan sendiri')
    const bottomInput = screen.getByLabelText('Angka bawah untuk soal buatan sendiri')
    fireEvent.change(topInput, { target: { value: '10' } })
    fireEvent.change(bottomInput, { target: { value: '20' } })
    fireEvent.click(screen.getByRole('button', { name: 'Kerjakan Soal Ini' }))

    // Kolom awal aktif adalah satuan (kanan), jawaban satuan 0 + 0 = 0
    fireEvent.click(screen.getByRole('button', { name: 'Angka 0' }))
    // Otomatis pindah ke puluhan (kiri), jawaban puluhan 1 + 2 = 3
    fireEvent.click(screen.getByRole('button', { name: 'Angka 3' }))

    // Klik periksa
    fireEvent.click(screen.getByRole('button', { name: 'Periksa' }))

    // Tombol terkunci saat feedback benar
    expect((screen.getByRole('button', { name: 'Periksa' }) as HTMLButtonElement).disabled).toBe(
      true,
    )

    // Maju 1000ms -> menyelesaikan soal dan beralih ke result
    act(() => {
      vi.advanceTimersByTime(1000)
    })

    expect(screen.getByTestId('probe-screen').textContent).toBe('result')
  })

  it('jawaban salah: menampilkan feedback salah dan membuka kunci setelah delay', () => {
    renderScreenWithProviders(<PracticeScreen />)

    // Buat soal kustom: 10 + 20
    const topInput = screen.getByLabelText('Angka atas untuk soal buatan sendiri')
    const bottomInput = screen.getByLabelText('Angka bawah untuk soal buatan sendiri')
    fireEvent.change(topInput, { target: { value: '10' } })
    fireEvent.change(bottomInput, { target: { value: '20' } })
    fireEvent.click(screen.getByRole('button', { name: 'Kerjakan Soal Ini' }))

    // Isi jawaban salah: satuan = 9, puluhan = 9
    fireEvent.click(screen.getByRole('button', { name: 'Angka 9' }))
    fireEvent.click(screen.getByRole('button', { name: 'Angka 9' }))

    fireEvent.click(screen.getByRole('button', { name: 'Periksa' }))

    expect(screen.getByText('Belum tepat. Lihat petunjuk di bawah ya.')).not.toBeNull()

    // Buka kunci setelah 700ms
    act(() => {
      vi.advanceTimersByTime(700)
    })

    expect((screen.getByRole('button', { name: 'Periksa' }) as HTMLButtonElement).disabled).toBe(
      false,
    )
  })
})
