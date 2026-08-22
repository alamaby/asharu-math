export type FeedbackKind = 'correct' | 'wrong' | 'info'

export interface Feedback {
  kind: FeedbackKind
  text: string
}

interface FeedbackMessageProps {
  feedback: Feedback | null
}

/**
 * Pesan umpan balik yang diumumkan ke pembaca layar melalui aria-live.
 * Jawaban salah memakai warna hangat (bukan merah) agar anak tidak takut.
 */
export default function FeedbackMessage({ feedback }: FeedbackMessageProps) {
  if (!feedback) {
    return <div aria-hidden="true" className="min-h-14" />
  }
  const style =
    feedback.kind === 'correct'
      ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
      : feedback.kind === 'wrong'
        ? 'border-amber-300 bg-amber-50 text-amber-800'
        : 'border-sky-300 bg-sky-50 text-sky-800'
  const icon = feedback.kind === 'correct' ? '🎉' : feedback.kind === 'wrong' ? '💡' : 'ℹ️'

  return (
    <div
      role="status"
      aria-live="polite"
      className={`animate-pop-in flex min-h-14 items-center gap-2 rounded-2xl border-2 px-4 py-3 text-sm font-bold md:text-base ${style}`}
    >
      <span aria-hidden="true" className="text-xl">
        {icon}
      </span>
      <span>{feedback.text}</span>
    </div>
  )
}
