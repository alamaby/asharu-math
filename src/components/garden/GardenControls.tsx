type GardenControlsProps = {
  onHint: () => void
  onRepeat: () => void
  onCheck: () => void
  onReset: () => void
  onNext: () => void
  canCheck: boolean
  canNext: boolean
  animating: boolean
  soundEnabled: boolean
  onToggleSound: () => void
}

export default function GardenControls({
  onHint,
  onRepeat,
  onCheck,
  onReset,
  onNext,
  canCheck,
  canNext,
  animating,
  soundEnabled,
  onToggleSound,
}: GardenControlsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={onHint}
        disabled={animating}
        className="min-h-11 rounded-2xl border-2 border-slate-200 bg-white px-4 text-sm font-black text-slate-700 hover:bg-sky-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-300 disabled:opacity-40"
      >
        💡 Petunjuk
      </button>
      <button
        type="button"
        onClick={onRepeat}
        disabled={animating}
        className="min-h-11 rounded-2xl border-2 border-slate-200 bg-white px-4 text-sm font-black text-slate-700 hover:bg-sky-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-300 disabled:opacity-40"
      >
        ↻ Ulangi Suara
      </button>
      <button
        type="button"
        onClick={onToggleSound}
        aria-pressed={soundEnabled}
        aria-label={soundEnabled ? 'Suara hidup' : 'Suara mati'}
        className={`min-h-11 rounded-2xl border-2 px-4 text-sm font-black focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-300 ${soundEnabled ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-white text-slate-500'}`}
      >
        {soundEnabled ? '🔊 Hidup' : '🔈 Mati'}
      </button>
      <button
        type="button"
        onClick={onCheck}
        disabled={!canCheck || animating}
        className="min-h-11 rounded-2xl border-b-4 border-emerald-600 bg-emerald-500 px-5 text-sm font-black text-white hover:bg-emerald-400 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-300 disabled:opacity-40"
      >
        Periksa
      </button>
      <button
        type="button"
        onClick={onReset}
        disabled={animating}
        className="min-h-11 rounded-2xl border-2 border-amber-200 bg-white px-4 text-sm font-black text-amber-700 hover:bg-amber-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-amber-300 disabled:opacity-40"
      >
        Ulangi Soal
      </button>
      {canNext && (
        <button
          type="button"
          onClick={onNext}
          disabled={animating}
          className="min-h-11 rounded-2xl border-b-4 border-sky-600 bg-sky-500 px-5 text-sm font-black text-white hover:bg-sky-400 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-300 disabled:opacity-40"
        >
          Soal Berikutnya →
        </button>
      )}
    </div>
  )
}
