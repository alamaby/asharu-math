const EMOJIS = ['🎉', '⭐', '🎊', '✨', '🌟', '🎈']

export type TrainCelebrationTone = 'flowers' | 'farm' | 'dusk'

const TONE_EMOJIS: Record<TrainCelebrationTone, readonly string[]> = {
  flowers: ['🌸', '✨', '🎉', '⭐', '🎊', '💐'],
  farm: ['🍎', '⭐', '🎉', '✨', '🌾', '🎊'],
  dusk: ['🌟', '✨', '🎉', '⭐', '🌙', '🎊'],
}

export interface TrainCelebrationProps {
  show: boolean
  tone?: TrainCelebrationTone
}

export default function TrainCelebration({ show, tone }: TrainCelebrationProps) {
  if (!show) return null
  const emojis = tone ? TONE_EMOJIS[tone] : EMOJIS
  return (
    <div aria-hidden="true" className="train-confetti">
      {Array.from({ length: 24 }).map((_, i) => (
        <span key={i} style={{ left: `${(i * 100) / 24}%`, animationDelay: `${(i % 6) * 0.08}s` }}>
          {emojis[i % emojis.length]}
        </span>
      ))}
    </div>
  )
}
