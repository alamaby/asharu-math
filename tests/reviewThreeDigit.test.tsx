import { cleanup, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type * as AquariumSound from '../src/lib/aquariumSound'
import type * as GardenSound from '../src/lib/gardenSound'
import type * as Sound from '../src/lib/sound'
import CheerfulAquarium from '../src/components/aquarium/CheerfulAquarium'
import MagicAppleGarden from '../src/components/garden/MagicAppleGarden'
import { renderScreenWithProviders } from './helpers/renderWithProviders'
import { buildAquariumFixture } from '../src/lib/aquariumQuestionGenerator'
import { buildGardenFixture } from '../src/lib/gardenQuestionGenerator'

vi.mock('../src/lib/aquariumSound', async (importOriginal) => {
  const actual = await importOriginal<typeof AquariumSound>()
  return { ...actual, speak: () => {}, playTap: () => {} }
})
vi.mock('../src/lib/gardenSound', async (importOriginal) => {
  const actual = await importOriginal<typeof GardenSound>()
  return { ...actual, speak: () => {}, playTap: () => {} }
})
vi.mock('../src/lib/sound', async (importOriginal) => {
  const actual = await importOriginal<typeof Sound>()
  return { ...actual, playTap: () => {} }
})

afterEach(cleanup)

describe('review — render 3-digit carry berantai (259+178=437)', () => {
  it('akuarium render tanpa crash + tombol tukar peti ratusan muncul', async () => {
    const problem = buildAquariumFixture('addition', 259, 178)
    expect(problem.columns.length).toBe(3)
    renderScreenWithProviders(
      <CheerfulAquarium problem={problem} currentIndex={1} total={5} onComplete={() => {}} />,
    )
    expect(await screen.findByTestId('stacked-answer-hundreds')).not.toBeNull()
    expect(await screen.findByTestId('aquarium-hundreds-overlay')).not.toBeNull()
    // Tombol tukar ratusan (carry P→R) tersedia walau carry S sudah menyala
    expect(
      await screen.findByRole('button', { name: /Bentuk 10 kelompok menjadi 1 tangki/i }),
    ).not.toBeNull()
  })

  it('kebun render tanpa crash + tombol tukar peti ratusan muncul', async () => {
    const problem = buildGardenFixture('addition', 259, 178)
    expect(problem.columns.length).toBe(3)
    renderScreenWithProviders(
      <MagicAppleGarden problem={problem} currentIndex={0} total={5} onComplete={() => {}} />,
    )
    expect(await screen.findByTestId('stacked-answer-hundreds')).not.toBeNull()
    expect(
      await screen.findByRole('button', { name: /Tukarkan 10 keranjang menjadi 1 peti/i }),
    ).not.toBeNull()
  })

  it('borrow berantai 432-176=256: tombol pecah ratusan muncul di kedua modul', async () => {
    const aProblem = buildAquariumFixture('subtraction', 432, 176)
    const { unmount } = renderScreenWithProviders(
      <CheerfulAquarium problem={aProblem} currentIndex={1} total={5} onComplete={() => {}} />,
    )
    expect(await screen.findByTestId('stacked-answer-hundreds')).not.toBeNull()
    expect(
      await screen.findByRole('button', { name: /Pecah 1 tangki menjadi 10 kelompok/i }),
    ).not.toBeNull()
    unmount()
    cleanup()
    const gProblem = buildGardenFixture('subtraction', 432, 176)
    renderScreenWithProviders(
      <MagicAppleGarden problem={gProblem} currentIndex={0} total={5} onComplete={() => {}} />,
    )
    expect(await screen.findByTestId('stacked-answer-hundreds')).not.toBeNull()
    expect(
      await screen.findByRole('button', { name: /Buka 1 peti menjadi 10 keranjang/i }),
    ).not.toBeNull()
  })

  it('fase tidak macet di intro: tombol tukar muncul tanpa aksi user (regresi reset-async)', async () => {
    // Dulu reset-async (setTimeout 0 + clearTimers) menghapus timer intro
    // 600ms pada mount yang sama → fase macet di 'intro' → Periksa/keypad mati.
    const problem = buildGardenFixture('addition', 259, 178)
    renderScreenWithProviders(
      <MagicAppleGarden problem={problem} currentIndex={0} total={5} onComplete={() => {}} />,
    )
    expect(
      await screen.findByRole('button', { name: /Tukarkan 10 keranjang menjadi 1 peti/i }),
    ).not.toBeNull()
  })
})
