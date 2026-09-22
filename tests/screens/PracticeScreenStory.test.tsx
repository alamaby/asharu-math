import { cleanup, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import PracticeScreen from '../../src/screens/PracticeScreen'
import { renderScreenWithProviders } from '../helpers/renderWithProviders'

afterEach(cleanup)

describe('PracticeScreenStory', () => {
  it('fase setup menampilkan opsi soal cerita', () => {
    renderScreenWithProviders(<PracticeScreen />)
    expect(screen.getByText('Soal cerita')).not.toBeNull()
    expect(screen.getByText('Bersusun')).not.toBeNull()
  })

  it('round-trip presentation story langsung ke fase solving-story', () => {
    renderScreenWithProviders(
      <PracticeScreen
        settings={{
          operation: 'mixed',
          digitCount: 2,
          carryMode: 'any',
          questionCount: 5,
          presentation: 'story',
        }}
      />,
    )
    // Tidak lagi di setup — tombol "Mulai Latihan" tidak ada
    expect(screen.queryByText('Mulai Latihan')).toBeNull()
    // Sudah di story solving: menampilkan soal cerita + keypad angka
    expect(screen.getByText(/punya/)).not.toBeNull()
    expect(screen.getByRole('group', { name: 'Keyboard angka' })).not.toBeNull()
  })
})
