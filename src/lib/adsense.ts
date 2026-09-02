/**
 * Loader Google AdSense sekali-jalur.
 * - `index.html` kini memuat script global hardcode `ca-pub-4082765898994990` (Auto Ads off,
 *   verifikasi crawler). Loader di sini tetap lazy untuk slot `AdSlot` dan melakukan dedup:
 *   jika script sudah ada di <head>, tidak inject duplikat — hanya menunggu load/error.
 * - Mode tanpa konfigurasi maupun offline tetap no-op.
 */

import { getClientId } from './env'

declare global {
  interface Window {
    /** Antrean perintah AdSense: setiap elemen berisi konfigurasi unit yang di-push. */
    adsbygoogle?: object[]
  }
}

let loadPromise: Promise<void> | null = null

function findExistingScript(): HTMLScriptElement | null {
  return document.querySelector<HTMLScriptElement>(
    'script[src*="pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"]',
  )
}

function waitForExistingScript(script: HTMLScriptElement): Promise<void> {
  return new Promise((resolve, reject) => {
    // Jika script sudah selesai dimuat sebelum listener dipasang, tidak ada event lagi.
    // Heuristik: cek atribut data-loaded yang kami set pada injectScript, atau
    // anggap sudah loaded bila script ada dan window.adsbygoogle sudah terisi.
    // Fallback paling aman: resolve segera bila tidak bisa deteksi — push ke
    // adsbygoogle tetap di-queue oleh AdSense walau script belum ready.
    const onLoad = (): void => {
      script.dataset.loaded = 'true'
      resolve()
    }
    const onError = (): void => reject(new Error('Gagal memuat skrip AdSense'))

    // Jika script sudah menandai loaded, langsung resolve.
    if (script.dataset.loaded === 'true') {
      resolve()
      return
    }

    script.addEventListener('load', onLoad, { once: true })
    script.addEventListener('error', onError, { once: true })

    // Fallback: bila event sudah terlewat (async script di index.html sudah load
    // sebelum JS bundle dieksekusi), resolve pada tick berikutnya bila script
    // masih di DOM tanpa error. AdSense memproses queue bahkan sebelum load.
    // Timeout 0 memastikan listener di atas tetap diprioritaskan bila event masih datang.
    setTimeout(() => {
      if (script.dataset.loaded !== 'true' && document.head.contains(script)) {
        // Tidak reject — anggap queue masih valid; resolve agar AdSlot bisa push.
        // Jika script nyata gagal, error event sudah menangani reject.
        resolve()
      }
    }, 0)
  })
}

function injectScript(client: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.async = true
    script.crossOrigin = 'anonymous'
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${client}`
    script.onload = () => {
      script.dataset.loaded = 'true'
      resolve()
    }
    script.onerror = () => reject(new Error('Gagal memuat skrip AdSense'))
    document.head.appendChild(script)
  })
}

/** Memuat skrip AdSense tepat satu kali per halaman. Dedup terhadap script hardcode di index.html. */
export function ensureAdsenseLoaded(): Promise<void> {
  const client = getClientId()
  if (!client) return Promise.reject(new Error('AdSense tidak dikonfigurasi'))
  if (typeof window === 'undefined') return Promise.reject(new Error('Tanpa window'))

  if (!loadPromise) {
    window.adsbygoogle = window.adsbygoogle ?? []
    const existing = findExistingScript()
    const loader = existing ? waitForExistingScript(existing) : injectScript(client)
    loadPromise = loader.catch((error) => {
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
