type AppleUnitProps = {
  index: number
  highlighted?: boolean
  onClick?: () => void
  disabled?: boolean
  label?: string
}

export default function AppleUnit({
  index,
  highlighted,
  onClick,
  disabled,
  label,
}: AppleUnitProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      aria-label={label ?? `Apel satuan ${index + 1}`}
      className={`relative flex h-11 w-11 items-center justify-center rounded-full border-2 bg-amber-50 text-[1.35rem] shadow-sm transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-amber-300 ${
        highlighted
          ? 'border-amber-500 bg-amber-100 ring-2 ring-amber-300 motion-safe:animate-pulse'
          : 'border-amber-200 hover:bg-amber-100'
      } ${disabled ? 'opacity-60' : ''}`}
      style={{ transitionDuration: '300ms' }}
    >
      <span aria-hidden="true" className="select-none">
        🍎
      </span>
      {/* pola titik kecil agar tidak hanya warna */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full border border-white bg-amber-600"
      />
    </button>
  )
}
