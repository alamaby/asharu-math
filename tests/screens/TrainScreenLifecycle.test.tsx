import { beforeEach, describe, expect, it } from 'vitest'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import TrainScreen from '../../src/screens/TrainScreen'
import { LanguageProvider } from '../../src/i18n/LanguageContext'
import { ProgressProvider } from '../../src/state/ProgressContext'
import { NavigationProvider } from '../../src/state/NavigationContext'

const GRADE1_BUTTON = 'Kelas 1 · 🚂 Berangkat! ✨ Belum dicoba'

function renderTrainScreen() {
  return render(
    <NavigationProvider>
      <ProgressProvider>
        <LanguageProvider>
          <TrainScreen />
        </LanguageProvider>
      </ProgressProvider>
    </NavigationProvider>,
  )
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

describe('TrainScreen — lifecycle & validasi state machine', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('memulai sesi dari menu beralih ke perjalanan dan berhenti di percabangan', async () => {
    try {
      renderTrainScreen()
      // Awal di MENU
      const startBtn = screen.getByRole('button', { name: GRADE1_BUTTON })
      expect(startBtn).toBeTruthy()

      // Klik mulai: beralih ke INTRO lalu TRAIN_MOVING
      fireEvent.click(startBtn)
      await sleep(900)

      // Tombol percabangan 2D tersedia saat TRAIN_MOVING
      const junctionBtn = await screen.findByRole(
        'button',
        { name: '→ Percabangan' },
        { timeout: 4000 },
      )
      expect(junctionBtn).toBeTruthy()
      fireEvent.click(junctionBtn)

      // Menuju WAITING_FOR_ANSWER (dialog soal terbuka)
      const dialog = await screen.findByRole('dialog', undefined, { timeout: 4000 })
      expect(dialog).toBeTruthy()
    } finally {
      cleanup()
    }
  }, 10000)

  it('jeda (pause) dan lanjutkan (resume) menjaga status aktif', async () => {
    try {
      renderTrainScreen()
      fireEvent.click(screen.getByRole('button', { name: GRADE1_BUTTON }))
      await sleep(900)

      const pauseBtn = await screen.findByRole('button', { name: /Jeda/i }, { timeout: 4000 })
      fireEvent.click(pauseBtn)

      // Saat PAUSED, tombol lanjutkan tampil
      const resumeBtn = await screen.findByRole('button', { name: /Lanjutkan/i }, { timeout: 4000 })
      expect(resumeBtn).toBeTruthy()

      // Lanjutkan kembali
      fireEvent.click(resumeBtn)
      await waitFor(() => {
        expect(screen.queryByRole('button', { name: /Lanjutkan/i })).toBeNull()
      })
    } finally {
      cleanup()
    }
  }, 10000)
})
