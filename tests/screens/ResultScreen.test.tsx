import { cleanup, fireEvent, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import ResultScreen from '../../src/screens/ResultScreen'
import { defaultProgress, STORAGE_KEY } from '../../src/lib/storage'
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

  it('retry concept mengarah ke concept-learn, next concept vs column bercabang', () => {
    const { unmount: u1 } = renderScreenWithProviders(
      <ResultScreen
        summary={makeSummary({ levelId: 'k1-membilang', nextLevelId: 'k1-banding' })}
      />,
    )
    fireEvent.click(screen.getByRole('button', { name: /Ulangi Level Ini/ }))
    expect(screen.getByTestId('probe-screen').textContent).toBe('concept-learn')
    // next selalu tampil karena semua level terbuka by design
    expect(screen.getByRole('button', { name: /Level Berikutnya/ })).not.toBeNull()
    cleanup()
    u1()
    const { unmount: u2 } = renderScreenWithProviders(
      <ResultScreen
        summary={makeSummary({
          levelId: 'k1-jembatan-2-digit',
          nextLevelId: 'level-1',
        })}
      />,
    )
    // k1-jembatan → level-1 selalu tersedia now
    expect(screen.getByRole('button', { name: /Level Berikutnya/ })).not.toBeNull()
    // concept selesai: settings null → tidak ada Latihan Lagi by design (di-overrides settings null)
    expect(screen.queryByRole('button', { name: /Latihan Lagi/ })).toBeNull()
    u2()
  })

  it('tombol next tampil walau progres fresh maupun terisi', () => {
    const seed = defaultProgress()
    seed.completedLevelIds = ['k1-membilang']
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seed))
    const { unmount } = renderScreenWithProviders(
      <ResultScreen
        summary={makeSummary({ levelId: 'k1-membilang', nextLevelId: 'k1-banding' })}
      />,
    )
    expect(screen.getByRole('button', { name: /Level Berikutnya/ })).not.toBeNull()
    unmount()
    window.localStorage.clear()
  })

  it('retry story mengarah ke story-learn, next story bercabang benar', () => {
    const seed = defaultProgress()
    seed.completedLevelIds = ['level-11', 'cerita-1']
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seed))
    const { unmount } = renderScreenWithProviders(
      <ResultScreen summary={makeSummary({ levelId: 'cerita-1', nextLevelId: 'cerita-2' })} />,
    )
    fireEvent.click(screen.getByRole('button', { name: /Ulangi Level Ini/ }))
    expect(screen.getByTestId('probe-screen').textContent).toBe('story-learn')
    cleanup()
    unmount()
    window.localStorage.clear()
  })

  it('next tampil juga saat fresh progress untuk story', () => {
    window.localStorage.clear()
    const { unmount } = renderScreenWithProviders(
      <ResultScreen summary={makeSummary({ levelId: 'cerita-1', nextLevelId: 'cerita-2' })} />,
    )
    expect(screen.getByRole('button', { name: /Level Berikutnya/ })).not.toBeNull()
    unmount()
    window.localStorage.clear()
  })

  it('retry dan next level kebun mengarah ke screen garden', () => {
    const { unmount } = renderScreenWithProviders(
      <ResultScreen summary={makeSummary({ levelId: 'kebun-1', nextLevelId: 'kebun-2' })} />,
    )
    fireEvent.click(screen.getByRole('button', { name: /Ulangi Level Ini/ }))
    expect(screen.getByTestId('probe-screen').textContent).toBe('garden')

    fireEvent.click(screen.getByRole('button', { name: /Level Berikutnya/ }))
    expect(screen.getByTestId('probe-screen').textContent).toBe('garden')
    cleanup()
    unmount()
  })

  it('retry dan next level akuarium mengarah ke screen aquarium', () => {
    const { unmount } = renderScreenWithProviders(
      <ResultScreen summary={makeSummary({ levelId: 'akuarium-1', nextLevelId: 'akuarium-2' })} />,
    )
    fireEvent.click(screen.getByRole('button', { name: /Ulangi Level Ini/ }))
    expect(screen.getByTestId('probe-screen').textContent).toBe('aquarium')

    fireEvent.click(screen.getByRole('button', { name: /Level Berikutnya/ }))
    expect(screen.getByTestId('probe-screen').textContent).toBe('aquarium')
    cleanup()
    unmount()
  })

  it('transisi lintas tipe: akuarium-4 ke kebun-5 mengarah ke screen garden', () => {
    renderScreenWithProviders(
      <ResultScreen summary={makeSummary({ levelId: 'akuarium-4', nextLevelId: 'kebun-5' })} />,
    )
    fireEvent.click(screen.getByRole('button', { name: /Level Berikutnya/ }))
    expect(screen.getByTestId('probe-screen').textContent).toBe('garden')
  })
})
