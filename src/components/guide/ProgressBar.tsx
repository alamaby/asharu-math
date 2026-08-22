interface ProgressBarProps {
  /** 0 sampai 1 */
  value: number
  label: string
}

export default function ProgressBar({ value, label }: ProgressBarProps) {
  const clamped = Math.min(1, Math.max(0, value))
  const percent = Math.round(clamped * 100)
  return (
    <div
      role="progressbar"
      aria-valuenow={percent}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
      className="h-3 w-full overflow-hidden rounded-full bg-sky-100"
    >
      <div
        className="h-full rounded-full bg-sky-500 transition-all duration-300"
        style={{ width: `${percent}%` }}
      />
    </div>
  )
}
