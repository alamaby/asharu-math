interface HintPanelProps {
  hint: string | null
}

/** Panel petunjuk bertahap saat anak kesulitan pada mode latihan. */
export default function HintPanel({ hint }: HintPanelProps) {
  if (!hint) return null
  return (
    <div
      role="status"
      aria-live="polite"
      className="animate-rise flex items-start gap-2 rounded-2xl border-2 border-violet-200 bg-violet-50 px-4 py-3 text-sm font-bold text-violet-800"
    >
      <span aria-hidden="true" className="text-lg">
        💡
      </span>
      <span>{hint}</span>
    </div>
  )
}
