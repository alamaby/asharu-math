/**
 * Loader Google AdSense sekali-jalur.
 * Skrip hanya disuntikkan saat ada slot pertama yang mendekati viewport,
 * sehingga mode tanpa konfigurasi maupun offline tetap bersih.
 */

import { getClientId } from './env'

declare global {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface Window {
    /** Antrean perintah AdSense: setiap elemen berisi konfigurasi unit yang di-push. */
    adsbygoogle?: object[]
  }
}

let loadPromise: Promise<void> | null = null

function injectScript(client: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.async = true
    script.crossOrigin = 'anonymous'
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${client}`
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Gagal memuat skrip AdSense'))
    document.head.appendChild(script)
  })
}

/** Memuat skrip AdSense tepat satu kali per halaman. */
export function ensureAdsenseLoaded(): Promise<void> {
  const client = getClientId()
  if (!client) return Promise.reject(new Error('AdSense tidak dikonfigurasi'))
  if (typeof window === 'undefined') return Promise.reject(new Error('Tanpa window'))

  if (!loadPromise) {
    window.adsbygoogle = window.adsbygoogle ?? []
    loadPromise = injectScript(client).catch((error) => {
      loadPromise = null // izinkan percobaan ulang pada render berikutnya
      throw error
    })
  }
  return loadPromise
}

/** Mendaftarkan satu unit iklan setelah <ins> dirender. */
export function requestAd(insElement: HTMLElement): void {
  window.adsbygoogle = window.adsbygoogle ?? []
  window.adsbygoogle.push({})
  void insElement // elemen sudah membawa data-ad-client/data-ad-slot sebagai atribut
}
