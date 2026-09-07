type Props = { current: number; total: number }

export default function AquariumProgress({ current, total }: Props) {
  const pct = total === 0 ? 0 : (current / total) * 100
  return (
    <div
      role="progressbar"
      aria-valuenow={current}
      aria-valuemin={0}
      aria-valuemax={total}
      aria-label={`Soal ${current} dari ${total}`}
      className="w-full"
    >
      <div className="flex items-center justify-between">
        <p className="text-xs font-black text-sky-700">
          Soal {current} dari {total}
        </p>
        <p className="text-xs font-bold text-slate-400">{Math.round(pct)}%</p>
      </div>
      <div className="mt-1 h-2 overflow-hidden rounded-full bg-sky-100">
        <div
          className="h-full rounded-full bg-sky-500 transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
