import type { MascotMood } from '../layout/Mascot'
import MascotBubble from '../layout/MascotBubble'

interface StepGuideProps {
  instruction: string
  mood?: MascotMood
  /** Kotak hitung sementara (mis. hasil 6 + 7 = 13) */
  interim?: { value: string; active: boolean } | null
  /** Pilihan Bisa / Tidak bisa untuk pertanyaan pinjam */
  choice?: { onChoose: (answer: 'bisa' | 'tidak-bisa') => void; disabled?: boolean } | null
  canGoBack: boolean
  canGoNext: boolean
  /** Sorot lembut tombol Berikutnya (mis. langkah pembuka) */
  pulseNext?: boolean
  onBack: () => void
  onRepeat: () => void
  onNext: () => void
}

export default function StepGuide({
  instruction,
  mood = 'happy',
  interim = null,
  choice = null,
  canGoBack,
  canGoNext,
  pulseNext = false,
  onBack,
  onRepeat,
  onNext,
}: StepGuideProps) {
  return (
    <section aria-label="Panduan langkah" className="space-y-3">
      <MascotBubble text={instruction} mood={mood} />

      {interim && (
        <div className="flex flex-col items-center gap-1">
          {interim.active && (
            <span aria-hidden="true" className="motion-safe:animate-bounce text-lg leading-none text-sky-500">
              ▾
            </span>
          )}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500">Kotak Hitung:</span>
            <div
              role="status"
              aria-label={`Kotak hitung sementara${interim.value ? `, berisi ${interim.value}` : ', kosong'}`}
              className={`flex h-16 w-24 items-center justify-center rounded-2xl border-2 text-3xl font-extrabold tabular-nums ${
                interim.active
                  ? 'border-sky-500 bg-sky-50 text-sky-900 ring-4 ring-sky-200'
                  : 'border-slate-300 bg-white text-slate-800'
              }`}
            >
              {interim.value || '··'}
            </div>
          </div>
        </div>
      )}

      {choice && (
        <div className="flex justify-center gap-2">
          <button
            type="button"
            disabled={choice.disabled}
            onClick={() => choice.onChoose('bisa')}
            className="min-h-11 rounded-2xl border-2 border-slate-200 bg-white px-5 text-sm font-bold text-slate-700 hover:bg-sky-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-300 disabled:opacity-50"
          >
            Bisa
          </button>
          <button
            type="button"
            disabled={choice.disabled}
            onClick={() => choice.onChoose('tidak-bisa')}
            className="min-h-11 rounded-2xl border-2 border-slate-200 bg-white px-5 text-sm font-bold text-slate-700 hover:bg-sky-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-300 disabled:opacity-50"
          >
            Tidak bisa
          </button>
        </div>
      )}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={onBack}
          disabled={!canGoBack}
          className="min-h-11 flex-1 rounded-2xl border-2 border-slate-200 bg-white text-sm font-bold text-slate-600 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-300 disabled:opacity-40"
        >
          ← Kembali
        </button>
        <button
          type="button"
          onClick={onRepeat}
          className="min-h-11 flex-1 rounded-2xl border-2 border-slate-200 bg-white text-sm font-bold text-slate-600 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-300"
        >
          ↻ Ulangi Penjelasan
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={!canGoNext}
          className={`min-h-11 flex-1 rounded-2xl border-b-4 border-sky-600 bg-sky-500 text-sm font-bold text-white hover:bg-sky-400 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-300 disabled:opacity-40 ${
            pulseNext && canGoNext ? 'motion-safe:animate-pulse' : ''
          }`}
        >
          Berikutnya →
        </button>
      </div>
    </section>
  )
}
