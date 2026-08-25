import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import InstallButton from '../src/components/common/InstallButton'
import { useInstallPrompt } from '../src/hooks/useInstallPrompt'

const IOS_HINT_KEY = 'asharu-math:ios-install-hint-dismissed'

type HookState = ReturnType<typeof useInstallPrompt>

function HookProbe({ onState }: { onState?: (state: HookState) => void }) {
  const state = useInstallPrompt()
  onState?.(state)
  return (
    <div>
      <span data-testid="can-install">{String(state.canInstall)}</span>
      <span data-testid="installed">{String(state.installed)}</span>
      <span data-testid="show-ios-hint">{String(state.showIosHint)}</span>
    </div>
  )
}

function fireBeforeInstallPrompt(outcome: 'accepted' | 'dismissed' = 'accepted') {
  const prompt = vi.fn().mockResolvedValue(undefined)
  const event = Object.assign(new Event('beforeinstallprompt', { cancelable: true }), {
    prompt,
    userChoice: Promise.resolve({ outcome }),
  })
  // act(): memastikan setState dari listener event ter-flush sebelum asersi
  act(() => {
    window.dispatchEvent(event)
  })
  return { prompt }
}

beforeEach(() => {
  window.localStorage.clear()
})

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

describe('useInstallPrompt', () => {
  it('kondisi awal: belum bisa install, belum terpasang, tanpa petunjuk iOS', () => {
    render(<HookProbe />)
    expect(screen.getByTestId('can-install').textContent).toBe('false')
    expect(screen.getByTestId('installed').textContent).toBe('false')
    expect(screen.getByTestId('show-ios-hint').textContent).toBe('false')
  })

  it('event beforeinstallprompt menandai siap install', () => {
    render(<HookProbe />)
    fireBeforeInstallPrompt()
    expect(screen.getByTestId('can-install').textContent).toBe('true')
  })

  it('event appinstalled menandai terpasang dan menyembunyikan kemampuan install', () => {
    render(<HookProbe />)
    act(() => {
      window.dispatchEvent(new Event('appinstalled'))
    })
    expect(screen.getByTestId('installed').textContent).toBe('true')
    expect(screen.getByTestId('can-install').textContent).toBe('false')
  })

  it('install() memicu dialog native dan mengembalikan pilihan pengguna', async () => {
    let captured: HookState | null = null
    render(<HookProbe onState={(s) => (captured = s)} />)
    const { prompt } = fireBeforeInstallPrompt()

    await act(async () => {
      const outcome = await captured!.install()
      expect(outcome).toBe('accepted')
    })

    expect(prompt).toHaveBeenCalledTimes(1)
    expect(captured!.canInstall).toBe(false)
  })

  it('install() tanpa event mengembalikan null', async () => {
    let captured: HookState | null = null
    render(<HookProbe onState={(s) => (captured = s)} />)
    await act(async () => {
      expect(await captured!.install()).toBeNull()
    })
  })
})

describe('InstallButton', () => {
  it('tidak merender apa pun sebelum ada kemampuan install atau petunjuk', () => {
    const { container } = render(<InstallButton />)
    expect(container.querySelector('button')).toBeNull()
  })

  it('menampilkan tombol Pasang Aplikasi dan memicu dialog saat ditekan', () => {
    render(<InstallButton />)
    fireBeforeInstallPrompt()

    const button = screen.getByRole('button', { name: /Pasang Aplikasi/ })
    fireEvent.click(button)

    // Dialog native dipicu; setelah userChoice selesai tombol kembali sembunyi
    expect(screen.queryByRole('button', { name: /Pasang Aplikasi/ })).not.toBeNull()
  })

  it('tersembunyi setelah aplikasi terpasang', () => {
    render(<InstallButton />)
    act(() => {
      window.dispatchEvent(new Event('appinstalled'))
    })
    expect(screen.queryByRole('button', { name: /Pasang Aplikasi/ })).toBeNull()
  })

  it('mode iOS: menampilkan petunjuk A2HS yang bisa ditutup dan tersimpan', () => {
    vi.spyOn(navigator, 'userAgent', 'get').mockReturnValue(
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15',
    )
    render(<InstallButton />)

    // iOS tidak pernah menerima beforeinstallprompt → langsung petunjuk
    expect(screen.queryByRole('button', { name: /Pasang Aplikasi/ })).toBeNull()
    expect(screen.getByText(/Tambahkan ke Layar Utama/)).not.toBeNull()

    fireEvent.click(screen.getByRole('button', { name: 'Tutup petunjuk pemasangan' }))
    expect(window.localStorage.getItem(IOS_HINT_KEY)).toBe('1')
    expect(screen.queryByLabelText('Tutup petunjuk pemasangan')).toBeNull()
  })
})
