import { useI18n } from '../../i18n/LanguageContext'
import { useInstallPrompt } from '../../hooks/useInstallPrompt'

/**
 * Tombol "Pasang Aplikasi" untuk memasang PWA dari peramban.
 * Memanfaatkan discriminated union `status` dari `useInstallPrompt`:
 * - 'available': memicu dialog install native via `beforeinstallprompt`.
 * - 'ios_instructions': menampilkan petunjuk Add to Home Screen yang bisa ditutup.
 * - 'installed' | 'unsupported': tidak merender apa pun.
 */
export default function InstallButton() {
  const pwa = useInstallPrompt()
  const { t } = useI18n()

  switch (pwa.status) {
    case 'available':
      return (
        <button
          type="button"
          onClick={() => void pwa.install()}
          className="min-h-14 w-full rounded-2xl border-b-4 border-violet-700 bg-violet-500 px-4 text-left text-base font-black text-white hover:bg-violet-400 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-violet-300"
        >
          {t('install.button')}
        </button>
      )

    case 'ios_instructions':
      return (
        <div className="flex items-start justify-between gap-2 rounded-2xl border-2 border-sky-100 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold leading-relaxed text-slate-600">
            {t('install.iosPre')} <strong>{t('install.iosShare')}</strong> {t('install.iosMid')}{' '}
            <strong>{t('install.iosAdd')}</strong>.
          </p>
          <button
            type="button"
            onClick={pwa.dismissIosHint}
            aria-label={t('install.dismissAria')}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-lg font-bold text-slate-400 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-300"
          >
            ✕
          </button>
        </div>
      )

    case 'installed':
    case 'unsupported':
    default:
      return null
  }
}
