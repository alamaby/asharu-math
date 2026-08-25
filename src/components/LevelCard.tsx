import type { LevelDefinition } from '../types'

interface LevelCardProps {
  level: LevelDefinition
  unlocked: boolean
  completed: boolean
  stars: number
  onStart: () => void
}

function StarRow({ count }: { count: number }) {
  return (
    <span aria-label={`${count} dari 3 bintang`} className="text-sm tracking-tight">
      {[1, 2, 3].map((position) => (
        <span
          key={position}
          aria-hidden="true"
          className={position <= count ? 'text-amber-400' : 'text-slate-300'}
        >
          ★
        </span>
      ))}
    </span>
  )
}

export default function LevelCard({ level, unlocked, completed, stars, onStart }: LevelCardProps) {
  return (
    <article
      className={`rounded-3xl border-2 p-4 shadow-sm ${
        unlocked ? 'border-sky-200 bg-white' : 'border-slate-200 bg-slate-100'
      }`}
    >
      <div className="flex items-start gap-3">
        <span
          aria-hidden="true"
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-sm font-black ${
            unlocked ? 'bg-sky-100 text-sky-700' : 'bg-slate-200 text-slate-400'
          }`}
        >
          {unlocked ? (level.number ?? '⚡') : '🔒'}
        </span>
        <div className="flex-1">
          <h3 className={`text-base font-black ${unlocked ? 'text-slate-800' : 'text-slate-500'}`}>
            {level.number ? `Level ${level.number}` : 'Tantangan'}: {level.name}
          </h3>
          <p
            className={`mt-0.5 text-sm font-semibold ${unlocked ? 'text-slate-600' : 'text-slate-400'}`}
          >
            {level.goal}
          </p>
          <p className="mt-1 text-xs font-bold text-slate-400">
            Contoh: {level.example} · {level.questionCount} soal
          </p>
          <div className="mt-2 flex items-center justify-between gap-2">
            {completed ? (
              <StarRow count={stars} />
            ) : (
              <span className="text-xs font-bold text-slate-400">Belum selesai</span>
            )}
            {unlocked ? (
              <button
                type="button"
                onClick={onStart}
                className="min-h-11 rounded-2xl border-b-4 border-sky-600 bg-sky-500 px-4 text-sm font-bold text-white hover:bg-sky-400 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-300"
              >
                {completed ? 'Mengulang' : 'Mulai'}
              </button>
            ) : (
              <span className="text-xs font-bold text-slate-400">
                Selesaikan level sebelumnya dulu ya
              </span>
            )}
          </div>
        </div>
      </div>
    </article>
  )
}
