interface LogoProps {
  size?: number
  className?: string
}

/**
 * Logo "Bintang Bersusun": bintang kuning dengan kartu putih berisi
 * soal bersusun mini 26 + 87 dan garis jawaban emerald.
 */
export default function Logo({ size = 28, className }: LogoProps) {
  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      className={className}
      role="img"
      aria-label="Logo Asharu Math: bintang dengan soal bersusun"
    >
      <rect width="64" height="64" rx="14" fill="#0ea5e9" />
      <path
        d="M32 9l6 13.4 14.7 1.6-10.9 10 2.9 14.5L32 42.1l-12.7 6.4 2.9-14.5-10.9-10L26 22.4z"
        fill="#fde047"
        stroke="#f59e0b"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <circle cx="15" cy="21" r="3" fill="#fbbf24" />
      <circle cx="49" cy="21" r="3" fill="#fbbf24" />
      <rect x="20" y="18.5" width="24" height="23" rx="4" fill="#ffffff" />
      <text
        x="31"
        y="26.5"
        textAnchor="middle"
        fontFamily="Arial, 'Segoe UI', sans-serif"
        fontSize="7.5"
        fontWeight="700"
        fill="#1e293b"
      >
        26
      </text>
      <text
        x="27"
        y="34.5"
        textAnchor="middle"
        fontFamily="Arial, 'Segoe UI', sans-serif"
        fontSize="7.5"
        fontWeight="700"
        fill="#1e293b"
      >
        87
      </text>
      <text
        x="38.5"
        y="34.5"
        textAnchor="middle"
        fontFamily="Arial, 'Segoe UI', sans-serif"
        fontSize="7.5"
        fontWeight="700"
        fill="#0369a1"
      >
        +
      </text>
      <rect x="23" y="36.6" width="15" height="1.7" rx="0.85" fill="#10b981" />
    </svg>
  )
}
