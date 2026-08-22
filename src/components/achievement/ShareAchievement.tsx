import { useState } from 'react'
import { copyText, shareText } from '../../lib/share'

interface ShareAchievementProps {
  text: string
}

/**
 * Tombol bagikan (Web Share API) dengan fallback salin ke clipboard.
 * Tidak ada publikasi otomatis — selalu butuh tindakan pengguna.
 */
export default function ShareAchievement({ text }: ShareAchievementProps) {
  const [message, setMessage] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const handleShare = async () => {
    setBusy(true)
    const outcome = await shareText(text)
    setMessage(
      outcome === 'shared'
        ? 'Pencapaian berhasil dibagikan!'
        : outcome === 'copied'
          ? 'Teks pencapaian sudah disalin!'
          : 'Belum bisa membagikan sekarang.',
    )
    setBusy(false)
  }

  const handleCopy = async () => {
    setBusy(true)
    const outcome = await copyText(text)
    setMessage(outcome === 'copied' ? 'Teks pencapaian sudah disalin!' : 'Belum bisa menyalin sekarang.')
    setBusy(false)
  }

  return (
    <div className="mt-3">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={handleShare}
          disabled={busy}
          className="min-h-11 rounded-2xl border-b-4 border-sky-600 bg-sky-500 px-4 text-sm font-bold text-white hover:bg-sky-400 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-300 disabled:opacity-50"
        >
          🔗 Bagikan
        </button>
        <button
          type="button"
          onClick={handleCopy}
          disabled={busy}
          className="min-h-11 rounded-2xl border-2 border-slate-200 bg-white px-4 text-sm font-bold text-slate-600 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-300 disabled:opacity-50"
        >
          📋 Salin Pencapaian
        </button>
      </div>
      {message && (
        <p role="status" aria-live="polite" className="mt-2 text-xs font-bold text-emerald-700">
          {message}
        </p>
      )}
    </div>
  )
}
