import { cleanup, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import AchievementsScreen from '../../src/screens/AchievementsScreen'
import { ACHIEVEMENTS } from '../../src/lib/achievements'
import { renderScreenWithProviders } from '../helpers/renderWithProviders'

afterEach(cleanup)

describe('AchievementsScreen', () => {
  it('menampilkan ringkasan 0 dari total pencapaian saat progres kosong', () => {
    renderScreenWithProviders(<AchievementsScreen />)
    expect(
      screen.getByText(new RegExp(`membuka 0 dari ${ACHIEVEMENTS.length} pencapaian`)),
    ).not.toBeNull()
  })

  it('seluruh definisi pencapaian tampil sebagai kartu', () => {
    renderScreenWithProviders(<AchievementsScreen />)
    for (const achievement of ACHIEVEMENTS) {
      expect(screen.getAllByText(achievement.name.id).length).toBeGreaterThan(0)
    }
  })
})
