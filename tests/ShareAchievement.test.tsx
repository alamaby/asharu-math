import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import ShareAchievement from '../src/components/achievement/ShareAchievement'
import { ACHIEVEMENTS } from '../src/lib/achievements'
import { AllProviders } from './helpers/renderWithProviders'

const mockAchievement = ACHIEVEMENTS[0]

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

describe('ShareAchievement Component', () => {
  beforeEach(() => {
    vi.stubGlobal('navigator', {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    })
  })

  it('merender tombol Bagikan secara default saat panel tertutup', () => {
    render(
      <AllProviders>
        <ShareAchievement achievement={mockAchievement} childName="Budi" />
      </AllProviders>,
    )

    expect(screen.getByRole('button', { name: /Bagikan/i })).not.toBeNull()
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('membuka dialog saat tombol Bagikan diklik dan menampilkan judul', async () => {
    render(
      <AllProviders>
        <ShareAchievement achievement={mockAchievement} childName="Budi" />
      </AllProviders>,
    )

    fireEvent.click(screen.getByRole('button', { name: /Bagikan/i }))
    expect(screen.getByRole('dialog')).not.toBeNull()
    expect(screen.getByText(/Bagikan Pencapaian/i)).not.toBeNull()
  })

  it('dapat menutup dialog menggunakan tombol silang ✕', async () => {
    render(
      <AllProviders>
        <ShareAchievement achievement={mockAchievement} childName="Budi" />
      </AllProviders>,
    )

    fireEvent.click(screen.getByRole('button', { name: /Bagikan/i }))
    expect(screen.getByRole('dialog')).not.toBeNull()

    fireEvent.click(screen.getByRole('button', { name: /Tutup panel berbagi/i }))
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('dapat menutup dialog menggunakan tombol Escape', async () => {
    render(
      <AllProviders>
        <ShareAchievement achievement={mockAchievement} childName="Budi" />
      </AllProviders>,
    )

    fireEvent.click(screen.getByRole('button', { name: /Bagikan/i }))
    expect(screen.getByRole('dialog')).not.toBeNull()

    fireEvent.keyDown(window, { key: 'Escape' })
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('menyalin teks pencapaian saat tombol Salin Teks diklik', async () => {
    render(
      <AllProviders>
        <ShareAchievement achievement={mockAchievement} childName="Budi" />
      </AllProviders>,
    )

    fireEvent.click(screen.getByRole('button', { name: /Bagikan/i }))
    const copyButton = screen.getByRole('button', { name: /Salin Teks/i })
    fireEvent.click(copyButton)

    await waitFor(() => {
      expect(screen.getByText(/Teks pencapaian sudah disalin!/i)).not.toBeNull()
    })
  })
})
