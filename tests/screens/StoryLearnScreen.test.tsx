import { act, cleanup, fireEvent, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import StoryLearnScreen from '../../src/screens/StoryLearnScreen'
import { generateStorySession } from '../../src/lib/storyGenerator'
import { renderScreenWithProviders } from '../helpers/renderWithProviders'

const sampleStory = generateStorySession({
  kind: 'story',
  operation: 'addition',
  digitCount: 2,
  carryMode: 'none',
  questionCount: 1,
  families: ['f0-add'],
})[0]

beforeEach(() => {
  vi.useFakeTimers()
  window.localStorage.clear()
})

afterEach(() => {
  vi.useRealTimers()
  cleanup()
})

describe('StoryLearnScreen', () => {
  it('merender judul, kartu cerita, dan keypad numerik', () => {
    renderScreenWithProviders(<StoryLearnScreen levelId="cerita-1" problems={[sampleStory]} />)
    expect(screen.getByText('Cerita Penjumlahan')).not.toBeNull()
    expect(screen.getByText(new RegExp(`Soal 1 dari ${sampleStory.parts.length}`))).not.toBeNull()
    expect(screen.getByRole('button', { name: 'Periksa' })).not.toBeNull()
  })

  it('input digit, backspace, dan jawaban benar lanjut ke soal berikutnya', () => {
    renderScreenWithProviders(<StoryLearnScreen levelId="cerita-1" problems={[sampleStory]} />)

    const expected = String(sampleStory.parts[0].expectedAnswer)
    for (const char of expected) {
      fireEvent.click(screen.getByRole('button', { name: `Angka ${char}` }))
    }
    expect(screen.getByText(expected)).not.toBeNull()

    // Tekan Periksa
    fireEvent.click(screen.getByRole('button', { name: 'Periksa' }))
    expect(screen.getByText('Benar! Hebat!')).not.toBeNull()

    // Auto-advance setelah 700ms
    act(() => {
      vi.advanceTimersByTime(700)
    })
    if (sampleStory.parts.length > 1) {
      expect(screen.getByText(new RegExp(`Soal 2 dari ${sampleStory.parts.length}`))).not.toBeNull()
    } else {
      expect(screen.getByTestId('probe-screen').textContent).toBe('result')
    }
  })

  it('input digit salah: menampilkan feedback dan bisa coba lagi', () => {
    renderScreenWithProviders(<StoryLearnScreen levelId="cerita-1" problems={[sampleStory]} />)

    // Ketik angka salah
    const wrong = '999'
    for (const char of wrong) {
      fireEvent.click(screen.getByRole('button', { name: `Angka ${char}` }))
    }
    fireEvent.click(screen.getByRole('button', { name: 'Periksa' }))

    expect(screen.getByText('Belum tepat. Coba lagi ya!')).not.toBeNull()

    // Buka kunci setelah 600ms
    act(() => {
      vi.advanceTimersByTime(600)
    })

    // Backspace
    fireEvent.click(screen.getByRole('button', { name: 'Hapus satu angka' }))
    expect(screen.getByText('99')).not.toBeNull()
  })

  it('tombol butuh bantuan bersusun beralih ke learn screen setelah 2 kali salah', () => {
    renderScreenWithProviders(<StoryLearnScreen levelId="cerita-1" problems={[sampleStory]} />)

    // Salah ke-1
    fireEvent.click(screen.getByRole('button', { name: 'Angka 9' }))
    fireEvent.click(screen.getByRole('button', { name: 'Periksa' }))
    act(() => {
      vi.advanceTimersByTime(600)
    })

    // Salah ke-2
    fireEvent.click(screen.getByRole('button', { name: 'Periksa' }))
    act(() => {
      vi.advanceTimersByTime(600)
    })

    const columnBtn = screen.getByRole('button', { name: /Belajar Bersusun/i })
    expect(columnBtn).not.toBeNull()
    fireEvent.click(columnBtn)
    expect(screen.getByTestId('probe-screen').textContent).toBe('learn')
  })
})
