import { useI18n } from '../../i18n/LanguageContext'
import { useInstallPrompt } from '../../hooks/useInstallPrompt'

/**
 * Tombol "Pasang Aplikasi" untuk memasang PWA dari peramban.
 * - Android/desktop: memicu dialog install native via beforeinstallprompt.
 * - iOS: menampilkan petunjuk Add to Home Screen yang bisa ditutup.
 * - Tidak merender apa pun bila aplikasi sudah berjalan terpasang.
 */
export default function InstallButton() {
  const { canInstall, installed, showIosHint, install, dismissIosHint } = useInstallPrompt()
  const { t } = useI18n()

  if (installed) return null

  if (canInstall) {
    return (
      <button
        type="button"
        onClick={() => void install()}
        className="min-h-14 w-full rounded-2xl border-b-4 border-violet-700 bg-violet-500 px-4 text-left text-base font-black text-white hover:bg-violet-400 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-violet-300"
      >
        {t('install.button')}
      </button>
    )
  }

  if (showIosHint) {
    return (
      <div className="flex items-start justify-between gap-2 rounded-2xl border-2 border-sky-100 bg-white p-4 shadow-sm">
        <p className="text-xs font-semibold leading-relaxed text-slate-600">
          {t('install.iosPre')} <strong>{t('install.iosShare')}</strong> {t('install.iosMid')}{' '}
          <strong>{t('install.iosAdd')}</strong>.
        </p>
        <button
          type="button"
          onClick={dismissIosHint}
          aria-label={t('install.dismissAria')}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-lg font-bold text-slate-400 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-300"
        >
          ✕
        </button>
      </div>
    )
  }

  return null
}
