import { SITE_URL } from './site'

/** Tautan berbagi WhatsApp dengan teks terisi otomatis. */
export function whatsappShareUrl(message: string): string {
  return `https://wa.me/?text=${encodeURIComponent(message)}`
}

/** Tautan berbagi Facebook (Facebook hanya menerima tautan, bukan teks). */
export function facebookShareUrl(url: string = SITE_URL): string {
  return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
}

/** Tautan berbagi X (Twitter) berupa tweet dengan teks terisi. */
export function xShareUrl(message: string): string {
  return `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}`
}

/** Tautan berbagi Telegram dengan teks dan tautan. */
export function telegramShareUrl(message: string, url: string = SITE_URL): string {
  return `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(message)}`
}
