import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { useEffect, useRef } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import BottomNavigation from '../src/components/layout/BottomNavigation'
import { buildProblem } from '../src/lib/problemGenerator'
import { STORAGE_KEY } from '../src/lib/storage'
import LearnScreen from '../src/screens/LearnScreen'
import { NavigationProvider, useNavigation } from '../src/state/NavigationContext'
import { ProgressProvider } from '../src/state/ProgressContext'
import { LanguageProvider } from '../src/i18n/LanguageContext'
import type { MathProblem } from '../src/types'

function ScreenProbe() {
  const { screen } = useNavigation()
  return <span data-testid="probe-screen">{screen.name}</span>
}

/** Mendorong layar learn ke stack agar kondisi awal sama seperti pemakaian nyata */
function NavigateToLearn(props: { levelId: string | null; problems?: MathProblem[] }) {
  const { navigate } = useNavigation()
  const done = useRef(false)
  useEffect(() => {
    if (done.current) return
    done.current = true
    navigate({
      name: 'learn',
      levelId: props.levelId,
      problems: props.problems,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return null
}

function renderLearn(ui: React.ReactElement, problems: MathProblem[]) {
  return render(
    <NavigationProvider>
      <ProgressProvider>
        <LanguageProvider>
          <NavigateToLearn levelId="level-1" problems={problems} />
          {ui}
          <BottomNavigation />
          <ScreenProbe />
        </LanguageProvider>
      </ProgressProvider>
    </NavigationProvider>,
  )
}

/** Soal mini: intro → isi satuan → review, agar alur cepat didorong di test */
function miniProblem(): MathProblem {
  const base = buildProblem('addition', 23, 14)
  return {
    ...base,
    learningSteps: [
      { kind: 'intro', operation: 'addition', first: 23, second: 14 },
      {
        kind: 'answer-digit',
        columnIndex: base.columns.length - 1,
        place: 'units',
        expectedDigit: 7,
      },
      { kind: 'review', operation: 'addition', first: 23, second: 14, result: 37 },
    ],
  }
}

/** Dorong sesi dari intro ke langkah jawaban satuan */
function keLangkahJawaban() {
  const problems = [miniProblem()]
  const view = renderLearn(<LearnScreen levelId="level-1" problems={problems} />, problems)
  fireEvent.click(screen.getByRole('button', { name: 'Berikutnya →' }))
  expect(screen.getByText(/kotak jawaban satuan/i)).not.toBeNull()
  return view
}

beforeEach(() => {
  window.localStorage.clear()
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
  cleanup()
})

describe('LearnScreen — penyelesaian level', () => {
  it('sesi otomatis selesai dari review: completeLevel tercatat dan pindah ke result', () => {
    const problems = [miniProblem()]
    renderLearn(<LearnScreen levelId="level-1" problems={problems} />, problems)
    fireEvent.click(screen.getByRole('button', { name: 'Berikutnya →' }))
    fireEvent.click(screen.getByRole('button', { name: 'Angka 7' }))

    // Auto-lanjut 1: jawaban benar → review
    act(() => vi.advanceTimersByTime(700))
    expect(screen.getByText(/23 \+ 14 = 37/)).not.toBeNull()

    // Auto-lanjut 2: review → finished → result (completeLevel sudah jalan)
    act(() => vi.advanceTimersByTime(700))
    expect(screen.getByTestId('probe-screen').textContent).toBe('result')

    const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY) as string)
    expect(saved.completedLevelIds).toContain('level-1')
    expect(saved.totalCorrect).toBeGreaterThanOrEqual(1)
  })

  it('sesi ad-hoc tanpa level memakai judul default terlokalkan', () => {
    renderLearn(<LearnScreen levelId={null} problems={[miniProblem()]} />, [miniProblem()])
    expect(screen.getByText('Belajar Langkah demi Langkah')).not.toBeNull()
  })

  it('keluar sebelum sesi selesai tidak mencatat level', () => {
    const { unmount } = keLangkahJawaban()
    unmount()

    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (raw !== null) {
      expect(JSON.parse(raw).completedLevelIds).toEqual([])
    }
  })
})

describe('LearnScreen — guard keluar mid-session', () => {
  it('tap bottom nav membuka dialog; batal tetap di learn', () => {
    keLangkahJawaban()

    fireEvent.click(screen.getByRole('button', { name: /Beranda/ }))
    expect(screen.getByRole('dialog')).not.toBeNull()
    expect(screen.getByText('Keluar dari level?')).not.toBeNull()

    fireEvent.click(screen.getByRole('button', { name: 'Lanjut Belajar' }))
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(screen.getByTestId('probe-screen').textContent).toBe('learn')
  })

  it('konfirmasi keluar menjalankan navigasi yang tertahan', () => {
    keLangkahJawaban()

    fireEvent.click(screen.getByRole('button', { name: /Beranda/ }))
    fireEvent.click(screen.getByRole('button', { name: 'Ya, Keluar' }))
    expect(screen.getByTestId('probe-screen').textContent).toBe('home')
  })

  it('navigasi tertahan terakhir tidak menumpuk saat dialog dibuka ulang', () => {
    keLangkahJawaban()

    // Buka lewat Beranda lalu batal, buka lagi lewat tab lain lalu konfirmasi
    fireEvent.click(screen.getByRole('button', { name: /Beranda/ }))
    fireEvent.click(screen.getByRole('button', { name: 'Lanjut Belajar' }))
    fireEvent.click(screen.getByRole('button', { name: /Pencapaian/ }))
    fireEvent.click(screen.getByRole('button', { name: 'Ya, Keluar' }))
    expect(screen.getByTestId('probe-screen').textContent).toBe('achievements')
  })
})
