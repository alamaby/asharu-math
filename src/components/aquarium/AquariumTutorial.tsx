type Props = {
  open: boolean
  onSkip: () => void
  onNext: () => void
  step: number
  totalSteps: number
}

const STEPS = [
  {
    title: 'Selamat datang di Akuarium Ikan Ceria! 🐠',
    body: 'Satu ikan kecil bernilai satu satuan.',
    emoji: '🐟',
  },
  {
    title: 'Sepuluh ikan menjadi satu kelompok puluhan',
    body: 'Sepuluh ikan dapat berenang bersama menjadi satu kelompok puluhan. Kelompok ditandai lingkaran biru dan label 10.',
    emoji: '🐠🐠🐠',
  },
  {
    title: 'Kelompok dapat berpencar lagi',
    body: 'Kalau diperlukan, satu kelompok puluhan dapat berpencar kembali menjadi sepuluh ikan satuan.',
    emoji: '🫧',
  },
  {
    title: 'Selalu mulai dari kolom satuan',
    body: 'Kita selalu mulai menghitung dari kolom satuan (S), lalu lanjut ke puluhan (P).',
    emoji: '🔢',
  },
  {
    title: 'Seratus = sepuluh puluhan',
    body: 'Sepuluh kelompok puluhan dapat ditukar menjadi satu peti/tangki ratusan ungu bernilai 100.',
    emoji: '📦',
  },
]

export default function AquariumTutorial({ open, onSkip, onNext, step, totalSteps }: Props) {
  if (!open) return null
  const s = STEPS[Math.min(step, STEPS.length - 1)]
  const n = totalSteps || STEPS.length
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Tutorial Akuarium Ikan Ceria"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
    >
      <div className="w-full max-w-md rounded-3xl border-2 border-sky-200 bg-white p-5 shadow-xl">
        <p className="text-center text-4xl" aria-hidden="true">
          {s.emoji}
        </p>
        <h2 className="mt-3 text-center text-base font-black text-sky-800">{s.title}</h2>
        <p className="mt-2 text-center text-sm font-bold leading-relaxed text-slate-600">
          {s.body}
        </p>
        <p className="mt-3 text-center text-xs font-bold text-slate-400">
          Langkah {step + 1} dari {n}
        </p>
        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={onSkip}
            className="min-h-11 flex-1 rounded-2xl border-2 border-slate-200 bg-white px-4 text-sm font-black text-slate-600 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-300"
          >
            Lewati
          </button>
          <button
            type="button"
            onClick={onNext}
            className="min-h-11 flex-1 rounded-2xl border-b-4 border-sky-600 bg-sky-500 px-4 text-sm font-black text-white hover:bg-sky-400 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-300"
            autoFocus
          >
            {step + 1 >= n ? 'Mulai!' : 'Lanjut →'}
          </button>
        </div>
      </div>
    </div>
  )
}

export const TUTORIAL_STEPS_COUNT = STEPS.length
