import { useI18n } from '../../i18n/LanguageContext'

export interface TrainHUDProps {
  round: number
  total: number
  stars: number
  muted: boolean
  paused: boolean
  musicOn: boolean
  onToggleMute: () => void
  onToggleMusic: () => void
  onPause: () => void
  onQuit: () => void
}

export default function TrainHUD({
  round,
  total,
  stars,
  muted,
  paused,
  musicOn,
  onToggleMute,
  onToggleMusic,
  onPause,
  onQuit,
}: TrainHUDProps) {
  const { t } = useI18n()
  return (
    <div className="rounded-3xl border-2 border-amber-200 bg-white p-3 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-black text-slate-700" aria-live="polite">
          {t('train.questionOf', { n: Math.min(round + 1, total), total })}
        </p>
        <p
          className="text-sm font-black text-amber-500"
          aria-label={t('train.starsAria', { stars })}
        >
          ★ {stars}
        </p>
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onToggleMute}
          aria-label={muted ? t('train.unmute') : t('train.mute')}
          className="min-h-11 rounded-2xl border-2 border-slate-200 bg-white px-3 text-sm font-bold text-slate-600 hover:bg-sky-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-300"
        >
          {muted ? '🔇' : '🔊'}
        </button>
        <button
          type="button"
          onClick={onToggleMusic}
          aria-label={musicOn ? t('train.musicMute') : t('train.musicUnmute')}
          className="min-h-11 rounded-2xl border-2 border-slate-200 bg-white px-3 text-sm font-bold text-slate-600 hover:bg-sky-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-300"
        >
          {musicOn ? '🎵' : '🚫🎵'}
        </button>
        <button
          type="button"
          onClick={onPause}
          disabled={paused}
          className="min-h-11 rounded-2xl border-2 border-slate-200 bg-white px-3 text-sm font-bold text-slate-600 hover:bg-sky-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-300 disabled:opacity-40"
        >
          ⏸ {t('train.paused')}
        </button>
        <button
          type="button"
          onClick={onQuit}
          className="min-h-11 rounded-2xl border-2 border-slate-200 bg-white px-3 text-sm font-bold text-slate-600 hover:bg-sky-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-300"
        >
          {t('train.quit')}
        </button>
      </div>
    </div>
  )
}
