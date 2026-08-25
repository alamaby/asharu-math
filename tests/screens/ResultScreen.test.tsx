import { cleanup, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import ResultScreen from '../../src/screens/ResultScreen'
import { renderScreenWithProviders } from '../helpers/renderWithProviders'
import type { SessionSummary } from '../../src/types'

function makeSummary(overrides: Partial<SessionSummary> = {}): SessionSummary {
  return {
    title: 'Level 1',
    totalQuestions: 5,
    correctFirstTry: 4,
    wrongAttempts: 1,
    recovered: 1,
    stars: 3,
    levelId: 'level-1',
    settings: null,
    nextLevelId: 'level-2',
    newAchievementIds: [],
    ...overrides,
  }
}

afterEach(cleanup)

describe('ResultScreen', () => {
  it('menampilkan judul sesi, bintang, dan statistik', () => {
    renderScreenWithProviders(<ResultScreen summary={makeSummary()} />)
    expect(screen.getByText('Level 1 selesai! 🎉')).not.toBeNull()
    expect(screen.getByLabelText('Kamu mendapat 3 dari 3 bintang')).not.toBeNull()
    expect(screen.getByText('Benar sekali coba')).not.toBeNull()
  })

  it('tombol ulangi level tampil untuk levelId yang ada', () => {
    renderScreenWithProviders(<ResultScreen summary={makeSummary()} />)
    expect(screen.getByRole('button', { name: /Ulangi Level Ini/ })).not.toBeNull()
  })

  it('tanpa settings tidak ada tombol latihan lagi', () => {
    renderScreenWithProviders(<ResultScreen summary={makeSummary({ settings: null })} />)
    expect(screen.queryByRole('button', { name: /Latihan Lagi/ })).toBeNull()
  })

  it('dengan settings tombol latihan lagi tersedia', () => {
    renderScreenWithProviders(
      <ResultScreen
        summary={makeSummary({
          settings: { operation: 'addition', digitCount: 2, carryMode: 'none', questionCount: 5 },
        })}
      />,
    )
    expect(screen.getByRole('button', { name: /Latihan Lagi/ })).not.toBeNull()
  })
})
