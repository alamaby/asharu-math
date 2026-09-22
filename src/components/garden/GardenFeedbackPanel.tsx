type GardenFeedbackProps = {
  kind: 'correct' | 'wrong' | 'info' | null
  text: string | null
  highlightColumn?: 'tens' | 'ones' | 'hundreds' | null
}

export default function GardenFeedbackPanel({ kind, text, highlightColumn }: GardenFeedbackProps) {
  if (!text) {
    return <div className="min-h-14" aria-live="polite" />
  }
  const styles =
    kind === 'correct'
      ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
      : kind === 'wrong'
        ? 'border-amber-200 bg-amber-50 text-amber-800'
        : 'border-sky-200 bg-sky-50 text-sky-800'
  const icon = kind === 'correct' ? '🎉' : kind === 'wrong' ? '💡' : '🍎'
  return (
    <div
      role="status"
      aria-live="polite"
      className={`animate-pop-in rounded-2xl border-2 p-3 text-sm font-bold shadow-sm ${styles}`}
    >
      <span aria-hidden="true">{icon} </span>
      {text}
      {highlightColumn && (
        <span className="ml-2 rounded-full bg-white px-2 py-1 text-xs font-black">
          {highlightColumn === 'ones'
            ? 'Satuan'
            : highlightColumn === 'tens'
              ? 'Puluhan'
              : 'Ratusan'}
        </span>
      )}
    </div>
  )
}
