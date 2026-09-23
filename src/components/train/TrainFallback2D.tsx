import { useI18n } from '../../i18n/LanguageContext'

export interface TrainFallback2DProps {
  paused: boolean
  onReachJunction: () => void
  onReachStation: () => void
  autoAdvance?: boolean
}

export default function TrainFallback2D({
  paused,
  onReachJunction,
  onReachStation,
}: TrainFallback2DProps) {
  const { t } = useI18n()
  return (
    <div className="overflow-hidden rounded-3xl border-2 border-amber-200 bg-sky-50 p-4 text-center shadow-sm">
      <p role="alert" className="text-sm font-bold text-amber-800">
        {t('train.fallbackMsg')}
      </p>
      <div aria-hidden="true" className="mt-3 text-5xl">
        🚂
      </div>
      <div aria-hidden="true" className="mx-auto mt-2 h-1.5 w-3/4 rounded-full bg-slate-300" />
      <div className="mt-3 flex flex-wrap justify-center gap-2">
        <button
          type="button"
          disabled={paused}
          onClick={onReachJunction}
          className="min-h-11 rounded-2xl border-b-4 border-sky-600 bg-sky-500 px-4 text-sm font-black text-white hover:bg-sky-400 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-300 disabled:opacity-40"
        >
          → Percabangan
        </button>
        <button
          type="button"
          disabled={paused}
          onClick={onReachStation}
          className="min-h-11 rounded-2xl border-b-4 border-emerald-600 bg-emerald-500 px-4 text-sm font-black text-white hover:bg-emerald-400 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-300 disabled:opacity-40"
        >
          → Stasiun 🎉
        </button>
      </div>
    </div>
  )
}
