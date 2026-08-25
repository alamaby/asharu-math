import { cleanup, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import LevelSelectScreen from '../../src/screens/LevelSelectScreen'
import { LEVELS } from '../../src/data/levels'
import { renderScreenWithProviders } from '../helpers/renderWithProviders'

afterEach(cleanup)

describe('LevelSelectScreen', () => {
  it('menampilkan seluruh kartu level', () => {
    const { baseElement } = renderScreenWithProviders(<LevelSelectScreen />)
    expect(screen.getByText(/Level 1:/)).not.toBeNull()
    // 11 level bernomor + 1 kartu Tantangan
    const headings = baseElement.querySelectorAll('h3')
    expect(headings.length).toBe(LEVELS.length)
    expect(baseElement.textContent).toContain('Tantangan')
  })

  it('level pertama siap dimulai dan level berikutnya terkunci', () => {
    renderScreenWithProviders(<LevelSelectScreen />)
    expect(screen.getByRole('button', { name: 'Mulai' })).not.toBeNull()
    // Belum ada level selesai → tidak ada tombol "Mengulang"
    expect(screen.queryByRole('button', { name: 'Mengulang' })).toBeNull()
  })
})
