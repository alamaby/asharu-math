const EMOJIS = ['🎉', '⭐', '🎊', '✨', '🌟', '🎈']

export interface TrainCelebrationProps {
  show: boolean
}

export default function TrainCelebration({ show }: TrainCelebrationProps) {
  if (!show) return null
  return (
    <div aria-hidden="true" className="train-confetti">
      {Array.from({ length: 24 }).map((_, i) => (
        <span key={i} style={{ left: `${(i * 100) / 24}%`, animationDelay: `${(i % 6) * 0.08}s` }}>
          {EMOJIS[i % EMOJIS.length]}
        </span>
      ))}
    </div>
  )
}
