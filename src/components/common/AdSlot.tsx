import { useEffect, useRef, useState } from 'react'
import { useI18n } from '../../i18n/LanguageContext'
import { ensureAdsenseLoaded, requestAd } from '../../lib/adsense'
import { getClientId, getSlotId, type AdPlacement } from '../../lib/env'

interface AdSlotProps {
  placement: AdPlacement
}

/**
 * Slot iklan non-intrusif:
 * - No-op total bila AdSense tidak dikonfigurasi, slot tidak terdaftar, atau offline.
 * - Permintaan iklan lazy: hanya saat slot mendekati viewport (IntersectionObserver).
 * - Tinggi cadangan tetap agar layout tidak melompat saat iklan termuat (anti-CLS).
 * - Tidak pernah dipasang di layar pengerjaan soal.
 * - TFAT child: data-tag-for-age-treatment="1" hardcode (AdSense Families, TFUA/TFCD deprecated).
 */
export default function AdSlot({ placement }: AdSlotProps) {
  const { t } = useI18n()
  const insRef = useRef<HTMLModElement>(null)
  const requestedRef = useRef(false)
  const [visible, setVisible] = useState(false)

  const client = getClientId()
  const slotId = getSlotId(placement)
  const enabled = Boolean(client && slotId)

  useEffect(() => {
    if (!enabled || visible) return

    // IntersectionObserver tersedia di semua browser target; jsdom memakai stub setup.ts
    let sentinel: IntersectionObserver | null = null
    const onIntersect = (entries: IntersectionObserverEntry[]): void => {
      if (entries.some((entry) => entry.isIntersecting)) {
        setVisible(true)
        sentinel?.disconnect()
      }
    }
    sentinel = new IntersectionObserver(onIntersect, { rootMargin: '200px' })
    const element = insRef.current?.parentElement ?? null
    if (element) sentinel.observe(element)
    return () => sentinel?.disconnect()
  }, [enabled, visible])

  useEffect(() => {
    if (!enabled || !visible) return

    /** Satu percobaan permintaan iklan; aman dipanggil ulang saat koneksi pulih. */
    const tryRequest = (): void => {
      if (requestedRef.current) return
      if (typeof navigator !== 'undefined' && navigator.onLine === false) return

      requestedRef.current = true
      void ensureAdsenseLoaded()
        .then(() => {
          if (insRef.current) requestAd(insRef.current)
        })
        .catch(() => {
          requestedRef.current = false // izinkan percobaan ulang
        })
    }

    tryRequest()

    // Saat mount terjadi offline, coba lagi begitu koneksi pulih.
    window.addEventListener('online', tryRequest)
    return () => window.removeEventListener('online', tryRequest)
  }, [enabled, visible])

  if (!enabled || !slotId) return null

  return (
    <aside aria-label={t('ads.label')} className="pt-2">
      <p className="mb-1 text-center text-[0.6rem] font-bold uppercase tracking-widest text-slate-300">
        {t('ads.label')}
      </p>
      <div className="flex min-h-[110px] items-center justify-center overflow-hidden rounded-2xl bg-slate-50">
        <ins
          ref={insRef}
          className="adsbygoogle block w-full"
          data-ad-client={getClientId() ?? undefined}
          data-ad-slot={slotId}
          data-ad-format="auto"
          data-full-width-responsive="true"
          data-tag-for-age-treatment="1"
        />
      </div>
    </aside>
  )
}
