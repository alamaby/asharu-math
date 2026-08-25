import { useCallback, useEffect, useState } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const IOS_HINT_KEY = 'asharu-math:ios-install-hint-dismissed'

type InstallOutcome = 'accepted' | 'dismissed'

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
 * Menangkap event pemasangan PWA dari peramban:
 * - Android/desktop: `beforeinstallprompt` disimpan agar tombol kustom bisa memicu dialog.
 * - iOS: tidak ada API programatik, tampilkan petunjuk Add to Home Screen.
 */
export function useInstallPrompt() {
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

  return {
    /** Dialog install native siap dipicu lewat tombol kustom */
    canInstall: promptEvent !== null,
    /** Aplikasi sudah berjalan sebagai PWA terpasang */
    installed,
    isIos,
    /** Petunjuk Add to Home Screen untuk iPhone yang belum ditutup anak/orang tua */
    showIosHint: isIos && !installed && !hintDismissed,
    install,
    dismissIosHint,
  }
}
