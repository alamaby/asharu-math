import { useEffect, useRef, useState } from 'react'
import { useI18n } from '../../i18n/LanguageContext'
import { achievementShareText } from '../../lib/achievements'
import { shareText } from '../../lib/share'
import { generateAchievementImage } from '../../lib/shareImage'
import {
  facebookShareUrl,
  telegramShareUrl,
  whatsappShareUrl,
  xShareUrl,
} from '../../lib/socialShare'
import { copyText } from '../../lib/share'
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
 * salin teks. Tidak ada publikasi otomatis — semua butuh tindakan anak.
 */
export default function ShareAchievement({ achievement, childName }: ShareAchievementProps) {
  const [open, setOpen] = useState(false)
  const [imageBlob, setImageBlob] = useState<Blob | null>(null)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const closeRef = useRef<HTMLButtonElement>(null)
  const { lang, t } = useI18n()

  const shareMessage = achievementShareText(achievement, childName, lang)

  /** Reset gambar lama sebelum membuka panel agar pratinjau selalu segar */
  const openSharePanel = () => {
    setImageBlob(null)
    setImageUrl(null)
    setOpen(true)
  }

  useEffect(() => {
    if (!open) return
    closeRef.current?.focus()
    let revokeUrl: string | null = null
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
    }).then((blob) => {
      if (cancelled) return
      if (blob) {
        const url = URL.createObjectURL(blob)
        revokeUrl = url
        setImageBlob(blob)
        setImageUrl(url)
      }
    })
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => {
      cancelled = true
      window.removeEventListener('keydown', onKeyDown)
      if (revokeUrl) URL.revokeObjectURL(revokeUrl)
    }
  }, [open, achievement, childName, lang, t])

  const shareImage = async () => {
    if (!imageBlob) return
    setBusy(true)
    try {
      const file = new File([imageBlob], `pencapaian-${achievement.id}.png`, { type: 'image/png' })
      const navigatorWithShare = navigator as Navigator & {
        canShare?: (data: { files: File[] }) => boolean
      }
      if (
        typeof navigatorWithShare.canShare === 'function' &&
        navigatorWithShare.canShare({ files: [file] })
      ) {
        await navigatorWithShare.share({ files: [file], text: shareMessage })
        setMessage(t('share.sharedOk'))
      } else {
        downloadImage()
      }
    } catch {
      setMessage(t('share.shareFail'))
    } finally {
      setBusy(false)
    }
  }

  const downloadImage = () => {
    if (!imageBlob) return
    const url = URL.createObjectURL(imageBlob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `pencapaian-${achievement.id}.png`
    document.body.appendChild(anchor)
    anchor.click()
    document.body.removeChild(anchor)
    URL.revokeObjectURL(url)
    setMessage(t('share.downloadOk'))
  }

  const handleCopy = async () => {
    const outcome = await copyText(shareMessage)
    setMessage(outcome === 'copied' ? t('share.copyOk') : t('share.copyFail'))
  }

  const legacyShare = async () => {
    setBusy(true)
    const outcome = await shareText(shareMessage)
    setMessage(
      outcome === 'shared'
        ? t('share.sharedOk')
        : outcome === 'copied'
          ? t('share.copyOk')
          : t('share.shareFail'),
    )
    setBusy(false)
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

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4"
          onClick={(event) => {
            if (event.target === event.currentTarget) setOpen(false)
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
                onClick={() => setOpen(false)}
                aria-label={t('share.closePanel')}
                className="flex h-11 w-11 items-center justify-center rounded-full text-xl font-bold text-slate-500 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-300"
              >
                ✕
              </button>
            </div>

            <div className="mt-3 flex justify-center">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={t('share.imageAlt', { name: achievement.name[lang], child: childName })}
                  className="w-56 rounded-2xl border-2 border-sky-100 shadow-md"
                />
              ) : (
                <div className="flex h-40 w-56 items-center justify-center rounded-2xl border-2 border-dashed border-sky-200 bg-sky-50 text-sm font-bold text-slate-400">
                  {t('share.preparing')}
                </div>
              )}
            </div>

            <div className="mt-4 space-y-2">
              <button
                type="button"
                onClick={shareImage}
                disabled={busy || imageBlob === null}
                className="min-h-12 w-full rounded-2xl border-b-4 border-emerald-600 bg-emerald-500 text-base font-black text-white hover:bg-emerald-400 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-300 disabled:opacity-40"
              >
                {t('share.sendImage')}
              </button>
              <button
                type="button"
                onClick={downloadImage}
                disabled={imageBlob === null}
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
                disabled={busy}
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

            {message && (
              <p
                role="status"
                aria-live="polite"
                className="mt-3 text-center text-xs font-bold text-emerald-700"
              >
                {message}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
