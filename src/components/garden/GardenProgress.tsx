type GardenProgressProps = {
  current: number
  total: number
  label?: string
}

export default function GardenProgressIndicator({ current, total, label }: GardenProgressProps) {
  const value = total > 0 ? current / total : 0
  return (
    <div className="space-y-1.5" aria-label={label ?? `Soal ${current} dari ${total}`}>
      <div className="flex items-baseline justify-between">
        <p className="text-xs font-black text-slate-700">
          Soal {current} dari {total}
        </p>
      </div>
      <div
        role="progressbar"
        aria-valuenow={Math.round(value * 100)}
        aria-valuemin={0}
        aria-valuemax={100}
        className="h-3 w-full overflow-hidden rounded-full bg-emerald-100"
      >
        <div
          className="h-full bg-emerald-500 transition-all duration-300"
          style={{ width: `${value * 100}%` }}
        />
      </div>
    </div>
  )
}
