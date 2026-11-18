import { useCallback, useEffect, useState } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const IOS_HINT_KEY = 'asharu-math:ios-install-hint-dismissed'

export type InstallOutcome = 'accepted' | 'dismissed'

export type InstallStatus = 'installed' | 'available' | 'ios_instructions' | 'unsupported'

export type InstallPromptResult =
  | {
      status: 'installed'
      canInstall: false
      installed: true
      isIos: boolean
      showIosHint: false
      install: () => Promise<null>
      dismissIosHint: () => void
    }
  | {
      status: 'available'
      canInstall: true
      installed: false
      isIos: boolean
      showIosHint: false
      install: () => Promise<InstallOutcome | null>
      dismissIosHint: () => void
    }
  | {
      status: 'ios_instructions'
      canInstall: false
      installed: false
      isIos: true
      showIosHint: true
      install: () => Promise<null>
      dismissIosHint: () => void
    }
  | {
      status: 'unsupported'
      canInstall: false
      installed: false
      isIos: boolean
      showIosHint: false
      install: () => Promise<null>
      dismissIosHint: () => void
    }

function detectStandalone(): boolean {
  if (typeof window === 'undefined') return false
  const iosStandalone =
    typeof navigator !== 'undefined' &&
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  return window.matchMedia('(display-mode: standalone)').matches || iosStandalone
}

function detectIos(): boolean {
  if (typeof navigator === 'undefined') return false
  const ua = navigator.userAgent
  const idiomIpad =
    /iPad/.test(ua) ||
    (/Macintosh/.test(ua) && typeof document !== 'undefined' && 'ontouchend' in document)
  return /iPhone|iPod/.test(ua) || idiomIpad
}

/**
 * Hook mesin status PWA installation.
 * Mengintegrasikan event browser native dan deteksi platform ke dalam discriminated union `status`:
 * - 'installed': Aplikasi sudah berjalan dalam display-mode standalone (tidak menampilkan dialog apapun).
 * - 'available': Browser (Chromium/Android) memicu `beforeinstallprompt` sehingga dialog native siap dipanggil.
 * - 'ios_instructions': Safari iOS tidak memiliki API prompt programatik, menampilkan panduan 'Add to Home Screen'.
 * - 'unsupported': Browser tidak mendukung instalasi atau prompt event belum siap / telah ditolak.
 */
export function useInstallPrompt(): InstallPromptResult {
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(null)
  const [installed, setInstalled] = useState<boolean>(detectStandalone)
  const [isIos] = useState<boolean>(detectIos)
  const [hintDismissed, setHintDismissed] = useState<boolean>(
    () => typeof window !== 'undefined' && window.localStorage.getItem(IOS_HINT_KEY) === '1',
  )

  useEffect(() => {
    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault()
      setPromptEvent(event as BeforeInstallPromptEvent)
    }
    const onAppInstalled = () => {
      setInstalled(true)
      setPromptEvent(null)
    }
    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt)
    window.addEventListener('appinstalled', onAppInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt)
      window.removeEventListener('appinstalled', onAppInstalled)
    }
  }, [])

  const install = useCallback(async (): Promise<InstallOutcome | null> => {
    if (!promptEvent) return null
    await promptEvent.prompt()
    const choice = await promptEvent.userChoice
    setPromptEvent(null)
    return choice.outcome
  }, [promptEvent])

  const dismissIosHint = useCallback(() => {
    window.localStorage.setItem(IOS_HINT_KEY, '1')
    setHintDismissed(true)
  }, [])

  // Evaluasi status kanonikal:
  // 1. Prioritas tertinggi: jika sudah terpasang, jangan ganggu anak/orang tua dengan tombol atau banner apapun.
  // 2. Jika ada promptEvent browser, dialog native 1-klik siap digunakan.
  // 3. Jika di iOS dan petunjuk belum ditutup, berikan instruksi panduan Safari 'Share -> Add to Home Screen'.
  // 4. Fallback: unsupported / idle.
  if (installed) {
    return {
      status: 'installed',
      canInstall: false,
      installed: true,
      isIos,
      showIosHint: false,
      install: async () => null,
      dismissIosHint,
    }
  }

  if (promptEvent !== null) {
    return {
      status: 'available',
      canInstall: true,
      installed: false,
      isIos,
      showIosHint: false,
      install,
      dismissIosHint,
    }
  }

  if (isIos && !hintDismissed) {
    return {
      status: 'ios_instructions',
      canInstall: false,
      installed: false,
      isIos: true,
      showIosHint: true,
      install: async () => null,
      dismissIosHint,
    }
  }

  return {
    status: 'unsupported',
    canInstall: false,
    installed: false,
    isIos,
    showIosHint: false,
    install: async () => null,
    dismissIosHint,
  }
}
