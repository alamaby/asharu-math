import { useI18n } from '../../i18n/LanguageContext'
export type MascotMood = 'happy' | 'cheer' | 'think'

interface MascotProps {
  mood?: MascotMood
  size?: number
  className?: string
}

/** Maskot bulat ceria "Asya" pendamping belajar anak. */
export default function Mascot({ mood = 'happy', size = 64, className }: MascotProps) {
  const { t } = useI18n()
  const eyes = () => {
    if (mood === 'cheer') {
      return (
        <g stroke="#78350f" strokeWidth="3" strokeLinecap="round" fill="none">
          <path d="M22 30q4-6 8 0" />
          <path d="M34 30q4-6 8 0" />
        </g>
      )
    }
    if (mood === 'think') {
      return (
        <g fill="#78350f">
          <circle cx="26" cy="30" r="3" />
          <path
            d="M34 28q4-2 7 1"
            stroke="#78350f"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
          />
        </g>
      )
    }
    return (
      <g fill="#78350f">
        <circle cx="26" cy="30" r="3" />
        <circle cx="38" cy="30" r="3" />
      </g>
    )
  }

  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      className={className}
      role="img"
      aria-label={t('mascot.aria')}
    >
      <circle cx="32" cy="34" r="26" fill="#fcd34d" stroke="#f59e0b" strokeWidth="3" />
      <path d="M10 28q6-14 22-14t22 14" fill="#fde68a" stroke="none" />
      <circle cx="16" cy="24" r="3" fill="#fbbf24" />
      <circle cx="48" cy="24" r="3" fill="#fbbf24" />
      {eyes()}
      <path
        d={mood === 'cheer' ? 'M24 40q8 10 16 0' : 'M25 40q7 7 14 0'}
        stroke="#78350f"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="18" cy="38" r="3" fill="#fb923c" opacity="0.7" />
      <circle cx="46" cy="38" r="3" fill="#fb923c" opacity="0.7" />
    </svg>
  )
}
