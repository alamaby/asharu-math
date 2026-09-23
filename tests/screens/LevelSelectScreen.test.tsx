import { cleanup, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import LevelSelectScreen from '../../src/screens/LevelSelectScreen'
import { LEVELS } from '../../src/data/levels'
import { defaultProgress, STORAGE_KEY } from '../../src/lib/storage'
import { renderScreenWithProviders } from '../helpers/renderWithProviders'

afterEach(cleanup)

describe('LevelSelectScreen', () => {
  it('menampilkan seluruh kartu level', () => {
    const { baseElement } = renderScreenWithProviders(<LevelSelectScreen />)
    // Penomoran per-grade: ada dua "Level 1:" (Kelas 1 & 2)
    expect(screen.getAllByText(/Level 1:/).length).toBeGreaterThanOrEqual(2)
    expect(baseElement.textContent).toContain('Kelas 1')
    expect(baseElement.textContent).toContain('Kelas 2')
    const headings = baseElement.querySelectorAll('h3')
    expect(headings.length).toBe(LEVELS.length)
    expect(baseElement.textContent).toContain('Tantangan')
  })

  it('semua level terbuka tanpa ikon kunci', () => {
    renderScreenWithProviders(<LevelSelectScreen />)
    expect(screen.queryByText('🔒')).toBeNull()
    expect(screen.queryByText(/Selesaikan level sebelumnya/)).toBeNull()
    const mulaiButtons = screen.getAllByRole('button', { name: 'Mulai' })
    expect(mulaiButtons.length).toBe(LEVELS.length)
    expect(screen.queryByRole('button', { name: 'Mengulang' })).toBeNull()
  })

  it('status belum dicoba vs sempurna', () => {
    const { unmount } = renderScreenWithProviders(<LevelSelectScreen />)
    expect(screen.getAllByText('✨ Belum dicoba').length).toBe(LEVELS.length)
    unmount()
    cleanup()

    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        ...defaultProgress(),
        completedLevelIds: ['k1-membilang'],
        bestScores: { 'k1-membilang': 3 },
      }),
    )
    const { unmount: u2 } = renderScreenWithProviders(<LevelSelectScreen />)
    expect(screen.getByText('🏆 Sempurna!')).not.toBeNull()
    expect(screen.getByRole('button', { name: 'Mengulang' })).not.toBeNull()
    expect(screen.getAllByText('✨ Belum dicoba').length).toBe(LEVELS.length - 1)
    u2()
    cleanup()

    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        ...defaultProgress(),
        completedLevelIds: ['level-1'],
        bestScores: { 'level-1': 2 },
      }),
    )
    renderScreenWithProviders(<LevelSelectScreen />)
    expect(screen.getByLabelText('Kamu mendapat 2 dari 3 bintang')).not.toBeNull()
    window.localStorage.clear()
  })
})
