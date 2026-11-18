import { useEffect, useReducer, useRef } from 'react'
import { useI18n } from '../../i18n/LanguageContext'
import { achievementShareText } from '../../lib/achievements'
import { copyText, shareText } from '../../lib/share'
import { initialShareDialogState, shareDialogReducer } from '../../lib/shareDialogMachine'
import { generateAchievementImage } from '../../lib/shareImage'
import {
  facebookShareUrl,
  telegramShareUrl,
  whatsappShareUrl,
  xShareUrl,
} from '../../lib/socialShare'
import type { AchievementDefinition } from '../../types'

interface ShareAchievementProps {
  achievement: AchievementDefinition
  childName: string | null
}

const SOCIAL_BUTTON_CLASS =
  'inline-flex min-h-11 items-center justify-center gap-1.5 rounded-2xl border-2 border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 hover:bg-sky-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-300'

/**
 * Tombol "Bagikan" yang membuka panel berbagi: pratinjau gambar kartu
 * pencapaian (bernama anak), Web Share API untuk file gambar dengan
 * fallback unduh, tautan langsung WhatsApp/Facebook/X/Telegram, serta
 * salin teks.
 *
 * Menggunakan mesin status eksplisit `shareDialogReducer` untuk
 * menangani siklus rendering canvas, kesiapan blob, penanganan error,
 * dan pencegahan operasi ganda (busy lock).
 */
export default function ShareAchievement({ achievement, childName }: ShareAchievementProps) {
  const [state, dispatch] = useReducer(shareDialogReducer, initialShareDialogState)
  const closeRef = useRef<HTMLButtonElement>(null)
  const activeUrlRef = useRef<string | null>(null)
  const { lang, t } = useI18n()

  const shareMessage = achievementShareText(achievement, childName, lang)
  const isOpen = state.phase !== 'closed'

  // Buka panel berbagi dan transisikan status ke rendering
  const openSharePanel = () => {
    if (activeUrlRef.current) {
      URL.revokeObjectURL(activeUrlRef.current)
      activeUrlRef.current = null
    }
    dispatch({ type: 'OPEN' })
  }

  const closeSharePanel = () => {
    if (activeUrlRef.current) {
      URL.revokeObjectURL(activeUrlRef.current)
      activeUrlRef.current = null
    }
    dispatch({ type: 'CLOSE' })
  }

  // Efek pembuatan gambar kartu saat dialog memasuki fase 'rendering'
  useEffect(() => {
    if (state.phase !== 'rendering') return
    closeRef.current?.focus()

    let cancelled = false

    void generateAchievementImage({
      achievement,
      childName,
      date: new Date(),
      labels: {
        cardLabel: t('ach.cardLabel'),
        greet: t('ach.greet', { name: childName }),
      },
      locale: lang === 'id' ? 'id-ID' : 'en-US',
    })
      .then((blob) => {
        if (cancelled) return
        if (blob) {
          const url = URL.createObjectURL(blob)
          activeUrlRef.current = url
          dispatch({ type: 'IMAGE_READY', blob, url })
        } else {
          dispatch({ type: 'IMAGE_FAILED', feedback: t('share.imageFail') })
        }
      })
      .catch(() => {
        if (!cancelled) {
          dispatch({ type: 'IMAGE_FAILED', feedback: t('share.imageFail') })
        }
      })

    return () => {
      cancelled = true
    }
  }, [state.phase, achievement, childName, lang, t])

  // Listener tombol keyboard Escape untuk menutup dialog dengan aksesibilitas ramah anak
  useEffect(() => {
    if (!isOpen) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeSharePanel()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [isOpen])

  // Bersihkan ObjectURL saat komponen unmount
  useEffect(() => {
    return () => {
      if (activeUrlRef.current) {
        URL.revokeObjectURL(activeUrlRef.current)
      }
    }
  }, [])

  const shareImage = async () => {
    if (state.phase !== 'ready') return
    dispatch({ type: 'SET_BUSY', busy: true })
    try {
      const file = new File([state.imageBlob], `pencapaian-${achievement.id}.png`, {
        type: 'image/png',
      })
      const navigatorWithShare = navigator as Navigator & {
        canShare?: (data: { files: File[] }) => boolean
      }
      if (
        typeof navigatorWithShare.canShare === 'function' &&
        navigatorWithShare.canShare({ files: [file] })
      ) {
        await navigatorWithShare.share({ files: [file], text: shareMessage })
        dispatch({ type: 'SET_FEEDBACK', message: t('share.sharedOk') })
      } else {
        downloadImage()
      }
    } catch {
      dispatch({ type: 'SET_FEEDBACK', message: t('share.shareFail') })
    } finally {
      dispatch({ type: 'SET_BUSY', busy: false })
    }
  }

  const downloadImage = () => {
    if (state.phase !== 'ready') return
    const url = URL.createObjectURL(state.imageBlob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `pencapaian-${achievement.id}.png`
    document.body.appendChild(anchor)
    anchor.click()
    document.body.removeChild(anchor)
    URL.revokeObjectURL(url)
    dispatch({ type: 'SET_FEEDBACK', message: t('share.downloadOk') })
  }

  const handleCopy = async () => {
    const outcome = await copyText(shareMessage)
    dispatch({
      type: 'SET_FEEDBACK',
      message: outcome === 'copied' ? t('share.copyOk') : t('share.copyFail'),
    })
  }

  const legacyShare = async () => {
    if (state.phase === 'ready' && state.busy) return
    const outcome = await shareText(shareMessage)
    dispatch({
      type: 'SET_FEEDBACK',
      message:
        outcome === 'shared'
          ? t('share.sharedOk')
          : outcome === 'copied'
            ? t('share.copyOk')
            : t('share.shareFail'),
    })
  }

  return (
    <div className="mt-3">
      <button
        type="button"
        onClick={openSharePanel}
        className="min-h-11 rounded-2xl border-b-4 border-sky-600 bg-sky-500 px-4 text-sm font-bold text-white hover:bg-sky-400 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-300"
      >
        {t('share.open')}
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4"
          onClick={(event) => {
            if (event.target === event.currentTarget) closeSharePanel()
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="share-dialog-title"
            className="animate-pop-in max-h-[85vh] w-full max-w-sm overflow-y-auto rounded-3xl bg-white p-5 shadow-xl"
          >
            <div className="flex items-start justify-between gap-2">
              <h2 id="share-dialog-title" className="text-lg font-black text-slate-800">
                {t('share.title')}
              </h2>
              <button
                ref={closeRef}
                type="button"
                onClick={closeSharePanel}
                aria-label={t('share.closePanel')}
                className="flex h-11 w-11 items-center justify-center rounded-full text-xl font-bold text-slate-500 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-300"
              >
                ✕
              </button>
            </div>

            <div className="mt-3 flex justify-center">
              {state.phase === 'ready' ? (
                <img
                  src={state.imageUrl}
                  alt={t('share.imageAlt', { name: achievement.name[lang], child: childName })}
                  className="w-56 rounded-2xl border-2 border-sky-100 shadow-md"
                />
              ) : state.phase === 'rendering' ? (
                <div className="flex h-40 w-56 items-center justify-center rounded-2xl border-2 border-dashed border-sky-200 bg-sky-50 text-sm font-bold text-slate-400">
                  {t('share.preparing')}
                </div>
              ) : (
                <div className="flex h-40 w-56 flex-col items-center justify-center rounded-2xl border-2 border-amber-200 bg-amber-50 p-3 text-center text-xs font-bold text-amber-800">
                  <span>⚠️ {t('share.imageFail')}</span>
                </div>
              )}
            </div>

            <div className="mt-4 space-y-2">
              <button
                type="button"
                onClick={shareImage}
                disabled={state.phase !== 'ready' || state.busy}
                className="min-h-12 w-full rounded-2xl border-b-4 border-emerald-600 bg-emerald-500 text-base font-black text-white hover:bg-emerald-400 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-300 disabled:opacity-40"
              >
                {t('share.sendImage')}
              </button>
              <button
                type="button"
                onClick={downloadImage}
                disabled={state.phase !== 'ready'}
                className="min-h-11 w-full rounded-2xl border-2 border-slate-200 bg-white text-sm font-bold text-slate-700 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-300 disabled:opacity-40"
              >
                {t('share.downloadImage')}
              </button>
              <div className="grid grid-cols-2 gap-2">
                <a
                  href={whatsappShareUrl(shareMessage)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={SOCIAL_BUTTON_CLASS}
                >
                  💬 WhatsApp
                </a>
                <a
                  href={facebookShareUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={SOCIAL_BUTTON_CLASS}
                >
                  📘 Facebook
                </a>
                <a
                  href={xShareUrl(shareMessage)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={SOCIAL_BUTTON_CLASS}
                >
                  ✖️ X
                </a>
                <a
                  href={telegramShareUrl(shareMessage)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={SOCIAL_BUTTON_CLASS}
                >
                  ✈️ Telegram
                </a>
              </div>
              <button
                type="button"
                onClick={legacyShare}
                disabled={state.phase === 'ready' && state.busy}
                className="min-h-11 w-full rounded-2xl border-2 border-slate-200 bg-white text-sm font-bold text-slate-700 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-300 disabled:opacity-50"
              >
                {t('share.viaDevice')}
              </button>
              <button
                type="button"
                onClick={handleCopy}
                className="min-h-11 w-full rounded-2xl border-2 border-slate-200 bg-white text-sm font-bold text-slate-700 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-300"
              >
                {t('share.copyText')}
              </button>
            </div>

            {state.feedback && (
              <p
                role="status"
                aria-live="polite"
                className="mt-3 text-center text-xs font-bold text-emerald-700"
              >
                {state.feedback}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
