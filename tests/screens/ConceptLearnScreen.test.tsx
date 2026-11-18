import { act, cleanup, fireEvent, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import ConceptLearnScreen from '../../src/screens/ConceptLearnScreen'
import { renderScreenWithProviders } from '../helpers/renderWithProviders'
import type { ConceptProblem } from '../../src/types'

const sampleProblem1: ConceptProblem = {
  id: 'c-1',
  kind: 'counting',
  question: { kind: 'counting', target: 3, icon: 'apple' },
  choices: ['2', '3', '4', '5'],
  expectedAnswer: '3',
}

const sampleProblem2: ConceptProblem = {
  id: 'c-2',
  kind: 'counting',
  question: { kind: 'counting', target: 5, icon: 'star' },
  choices: ['4', '5', '6', '7'],
  expectedAnswer: '5',
}

beforeEach(() => {
  vi.useFakeTimers()
  window.localStorage.clear()
})

afterEach(() => {
  vi.useRealTimers()
  cleanup()
})

describe('ConceptLearnScreen', () => {
  it('merender judul, progress bar, dan pilihan jawaban', () => {
    renderScreenWithProviders(
      <ConceptLearnScreen levelId="k1-membilang" problems={[sampleProblem1, sampleProblem2]} />,
    )
    expect(screen.getByText('Membilang 1–20')).not.toBeNull()
    expect(screen.getByText('Soal 1 dari 2')).not.toBeNull()
    expect(screen.getByRole('button', { name: '3' })).not.toBeNull()
  })

  it('jawaban benar: menampilkan feedback benar dan auto-advance setelah 700ms', () => {
    renderScreenWithProviders(
      <ConceptLearnScreen levelId="k1-membilang" problems={[sampleProblem1, sampleProblem2]} />,
    )
    fireEvent.click(screen.getByRole('button', { name: '3' }))
    expect(screen.getByText('Benar! Hebat!')).not.toBeNull()

    // Sebelum 700ms, tombol terkunci
    const btn = screen.getByRole('button', { name: '3' }) as HTMLButtonElement
    expect(btn.disabled).toBe(true)

    // Maju 700ms -> berpindah ke soal 2
    act(() => {
      vi.advanceTimersByTime(700)
    })
    expect(screen.getByText('Soal 2 dari 2')).not.toBeNull()
    expect(screen.getByRole('button', { name: '5' })).not.toBeNull()
  })

  it('jawaban salah: menampilkan feedback salah dan membuka kunci setelah 600ms', () => {
    renderScreenWithProviders(
      <ConceptLearnScreen levelId="k1-membilang" problems={[sampleProblem1, sampleProblem2]} />,
    )
    fireEvent.click(screen.getByRole('button', { name: '2' }))
    expect(screen.getByText('Belum tepat. Coba lagi ya!')).not.toBeNull()

    // Terkunci sementara
    const btn = screen.getByRole('button', { name: '2' }) as HTMLButtonElement
    expect(btn.disabled).toBe(true)

    // Buka kunci setelah 600ms
    act(() => {
      vi.advanceTimersByTime(600)
    })
    expect(btn.disabled).toBe(false)
  })

  it('salah 3 kali: mengungkap jawaban benar dan auto-advance setelah 1200ms', () => {
    renderScreenWithProviders(
      <ConceptLearnScreen levelId="k1-membilang" problems={[sampleProblem1, sampleProblem2]} />,
    )

    // Salah ke-1
    fireEvent.click(screen.getByRole('button', { name: '2' }))
    act(() => {
      vi.advanceTimersByTime(600)
    })

    // Salah ke-2
    fireEvent.click(screen.getByRole('button', { name: '4' }))
    act(() => {
      vi.advanceTimersByTime(600)
    })

    // Salah ke-3 -> Reveal
    fireEvent.click(screen.getByRole('button', { name: '5' }))
    expect(screen.getByText(/Jawaban yang benar adalah 3/)).not.toBeNull()

    // Auto-advance setelah 1200ms ke soal 2
    act(() => {
      vi.advanceTimersByTime(1200)
    })
    expect(screen.getByText('Soal 2 dari 2')).not.toBeNull()
  })

  it('menyelesaikan semua soal berpindah ke result screen', () => {
    renderScreenWithProviders(
      <ConceptLearnScreen levelId="k1-membilang" problems={[sampleProblem1]} />,
    )
    fireEvent.click(screen.getByRole('button', { name: '3' }))
    act(() => {
      vi.advanceTimersByTime(700)
    })

    expect(screen.getByTestId('probe-screen').textContent).toBe('result')
  })
})
