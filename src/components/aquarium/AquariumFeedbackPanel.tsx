type Kind = 'correct' | 'wrong' | 'info' | null

type Props = {
  kind: Kind
  text: string | null
  highlightColumn?: 'tens' | 'ones' | 'hundreds' | null
}

export default function AquariumFeedbackPanel({ kind, text }: Props) {
  if (!text) return null
  const cls =
    kind === 'correct'
      ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
      : kind === 'wrong'
        ? 'border-amber-200 bg-amber-50 text-amber-800'
        : 'border-sky-200 bg-sky-50 text-sky-800'
  const icon = kind === 'correct' ? '✅ ' : kind === 'wrong' ? '💡 ' : '🐠 '
  return (
    <div
      role="status"
      aria-live="polite"
      className={`rounded-3xl border-2 p-3 text-sm font-bold shadow-sm ${cls}`}
    >
      <p>
        {icon}
        {text}
      </p>
    </div>
  )
}
