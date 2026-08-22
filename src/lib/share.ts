export type ShareOutcome = 'shared' | 'copied' | 'failed'

/**
 * Menyalin teks ke clipboard dengan fallback untuk peramban lama.
 */
export async function copyText(text: string): Promise<ShareOutcome> {
  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
      await navigator.clipboard.writeText(text)
      return 'copied'
    }
  } catch {
    // lanjut ke fallback
  }
  try {
    if (typeof document === 'undefined') return 'failed'
    const textarea = document.createElement('textarea')
    textarea.value = text
    textarea.setAttribute('readonly', '')
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.select()
    const ok = document.execCommand('copy')
    document.body.removeChild(textarea)
    return ok ? 'copied' : 'failed'
  } catch {
    return 'failed'
  }
}

/**
 * Membagikan teks lewat Web Share API; jika tidak tersedia atau gagal,
 * otomatis jatuh kembali ke menyalin teks.
 */
export async function shareText(text: string): Promise<ShareOutcome> {
  if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
    try {
      await navigator.share({ text })
      return 'shared'
    } catch {
      // pengguna membatalkan atau gagal → coba salin
    }
  }
  return copyText(text)
}
