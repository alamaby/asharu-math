import { playTap } from '../../lib/sound'

interface NumericKeypadProps {
  onDigit: (digit: number) => void
  onBackspace: () => void
  onCheck: () => void
  checkDisabled?: boolean
  checkLabel?: string
  /** Nonaktifkan tombol angka & hapus saat langkah belum/tidak menerima input angka */
  digitsDisabled?: boolean
}

const DIGIT_BUTTON_CLASS =
  'flex min-h-14 items-center justify-center rounded-2xl border-b-4 border-slate-200 bg-white text-2xl font-extrabold text-slate-700 transition-transform active:translate-y-0.5 active:border-b-2 hover:bg-sky-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-300 disabled:opacity-50'

/**
 * Kelas dasar tombol aksi sengaja tidak memuat utilitas warna latar atau
 * warna teks agar tidak bertentangan dengan warna tombol spesifik.
 * Tailwind memenangkan kelas yang urutannya lebih belakang di stylesheet
 * (bukan urutan di atribut class); konflik bg-white dengan text-white
 * membuat tombol tampak kosong.
 */
const ACTION_BUTTON_CLASS =
  'inline-flex min-h-14 items-center justify-center gap-1.5 rounded-2xl border-b-4 px-2 text-base font-extrabold transition-transform active:translate-y-0.5 active:border-b-2 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-300 disabled:opacity-50'

/** Ikon SVG agar selalu tampil di semua peramban/font */
function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" className="shrink-0">
      <path
        d="M4 12.5l5 5L20 6.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function BackspaceIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" className="shrink-0">
      <path
        d="M9 5h11a1.5 1.5 0 011.5 1.5v11A1.5 1.5 0 0120 19H9l-6.2-6.2a1 1 0 010-1.6L9 5z"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
      <path
        d="M12.5 9.5l5 5M17.5 9.5l-5 5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  )
}

/**
 * Keyboard angka dalam aplikasi: 0-9, hapus, dan periksa.
 * Semua tombol minimal 56px agar mudah ditekan anak.
 */
export default function NumericKeypad({
  onDigit,
  onBackspace,
  onCheck,
  checkDisabled = false,
  checkLabel = 'Periksa',
  digitsDisabled = false,
}: NumericKeypadProps) {
  const handleDigit = (digit: number) => {
    playTap()
    onDigit(digit)
  }

  return (
    <div
      role="group"
      aria-label="Keyboard angka"
      className="mx-auto grid w-full max-w-xs grid-cols-3 gap-2"
    >
      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => (
        <button
          key={digit}
          type="button"
          className={DIGIT_BUTTON_CLASS}
          onClick={() => handleDigit(digit)}
          disabled={digitsDisabled}
          aria-label={`Angka ${digit}`}
        >
          {digit}
        </button>
      ))}
      <button
        type="button"
        className={`${ACTION_BUTTON_CLASS} border-amber-300 bg-amber-100 text-amber-800 hover:bg-amber-50`}
        onClick={() => {
          playTap()
          onBackspace()
        }}
        disabled={digitsDisabled}
        aria-label="Hapus satu angka"
      >
        <BackspaceIcon />
        Hapus
      </button>
      <button
        type="button"
        className={DIGIT_BUTTON_CLASS}
        onClick={() => handleDigit(0)}
        disabled={digitsDisabled}
        aria-label="Angka 0"
      >
        0
      </button>
      <button
        type="button"
        className={`${ACTION_BUTTON_CLASS} border-emerald-700 bg-emerald-500 text-white hover:bg-emerald-400`}
        onClick={() => {
          playTap()
          onCheck()
        }}
        disabled={checkDisabled}
        aria-label={checkLabel}
      >
        <CheckIcon />
        {checkLabel}
      </button>
    </div>
  )
}
