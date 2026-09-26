import { beforeEach, describe, expect, it } from 'vitest'
import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import TrainScreen from '../src/screens/TrainScreen'
import { LanguageProvider } from '../src/i18n/LanguageContext'
import { ProgressProvider, useProgress } from '../src/state/ProgressContext'
import { NavigationProvider } from '../src/state/NavigationContext'

const GRADE1_BUTTON = 'Kelas 1 · 🚂 Berangkat! ✨ Belum dicoba'

function GlobalMuteProbe() {
  const { setPreferences } = useProgress()
  return (
    <button type="button" onClick={() => setPreferences({ soundEnabled: false })}>
      probe-mute-global
    </button>
  )
}

function renderScreen() {
  return render(
    <NavigationProvider>
      <ProgressProvider>
        <LanguageProvider>
          <GlobalMuteProbe />
          <TrainScreen />
        </LanguageProvider>
      </ProgressProvider>
    </NavigationProvider>,
  )
}

function promptAnswer(prompt: string): string | null {
  const m = prompt.match(/(\d+)\s*([+−×÷?])\s*(\d+)/)
  if (!m) return null
  const a = Number(m[1])
  const b = Number(m[3])
  switch (m[2]) {
    case '+':
      return String(a + b)
    case '−':
      return String(a - b)
    case '×':
      return String(a * b)
    case '÷':
      return b === 0 ? null : String(a / b)
    case '?':
      if (a > b) return '>'
      if (a < b) return '<'
      return '='
    default:
      return null
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

describe('sinkron mute global layar kereta', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('tombol HUD mengikuti saklar suara global', async () => {
    try {
      renderScreen()
      // mulai sesi kelas 1 (INTRO -> TRAIN_MOVING ~800ms)
      fireEvent.click(screen.getByRole('button', { name: GRADE1_BUTTON }))
      await screen.findByRole('button', { name: 'Matikan suara' }, { timeout: 4000 })
      expect(screen.getByRole('button', { name: 'Matikan musik' })).toBeTruthy()
      expect(screen.getByRole('button', { name: 'Matikan narasi suara' })).toBeTruthy()

      // matikan dari "header" (global): ikon HUD harus ikut bisu
      fireEvent.click(screen.getByRole('button', { name: 'probe-mute-global' }))
      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Nyalakan suara' })).toBeTruthy()
        expect(screen.getByRole('button', { name: 'Nyalakan musik' })).toBeTruthy()
        expect(screen.getByRole('button', { name: 'Nyalakan narasi suara' })).toBeTruthy()
      })
    } finally {
      cleanup()
    }
  })

  it('satu jawaban benar dicatat tepat 3 bintang', async () => {
    try {
      renderScreen()
      fireEvent.click(screen.getByRole('button', { name: GRADE1_BUTTON }))
      // tunggu INTRO (800ms) selesai agar fase TRAIN_MOVING sebelum ke junction
      await sleep(1000)
      // sampai percabangan via fallback 2D (tanpa WebGL di jsdom)
      const junctionBtn = await screen.findByRole(
        'button',
        { name: '→ Percabangan' },
        { timeout: 4000 },
      )
      fireEvent.click(junctionBtn)
      // dialog soal muncul setelah jeda APPROACHING
      const dialog = await screen.findByRole('dialog', undefined, { timeout: 4000 })
      const prompt = within(dialog).getByRole('heading').textContent ?? ''
      const correct = promptAnswer(prompt)
      expect(correct).not.toBeNull()
      const choiceBtn = within(dialog).getByRole('button', {
        name: `Pilih jalur dengan jawaban ${correct}`,
      })
      // tunggu tombol aktif (fase WAITING, bukan APPROACHING yang disabled)
      await waitFor(
        () => {
          expect(choiceBtn as HTMLButtonElement).not.toHaveProperty('disabled', true)
          expect((choiceBtn as HTMLButtonElement).disabled).toBe(false)
        },
        { timeout: 4000 },
      )
      // dua klik sinkron beruntun: jawaban ganda tidak boleh dihitung dua kali
      fireEvent.click(choiceBtn)
      fireEvent.click(choiceBtn)
      // umpan balik benar + tepat 3 bintang
      await waitFor(
        () => {
          expect(screen.getByText('Hebat! Jawabanmu benar.')).toBeTruthy()
        },
        { timeout: 4000 },
      )
      expect(screen.getByLabelText('Bintang: 3')).toBeTruthy()
    } finally {
      cleanup()
    }
  }, 15000)

  it('tidak ada unhandled error saat unmount', async () => {
    try {
      const { unmount } = renderScreen()
      await act(async () => {
        unmount()
      })
    } finally {
      cleanup()
    }
  })
})
