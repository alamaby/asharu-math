type TensBasketProps = {
  index: number
  onClick?: () => void
  disabled?: boolean
  label?: string
  pulse?: boolean
}

export default function TensBasket({ index, onClick, disabled, label, pulse }: TensBasketProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      aria-label={label ?? `Keranjang puluhan ${index + 1}, berisi 10 apel`}
      className={`relative flex h-14 w-16 items-center justify-center rounded-2xl border-2 bg-emerald-50 shadow-sm transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-300 ${
        pulse
          ? 'border-emerald-500 ring-2 ring-emerald-300 motion-safe:animate-pulse'
          : 'border-emerald-200 hover:bg-emerald-100'
      } ${disabled ? 'opacity-60' : ''}`}
    >
      <span aria-hidden="true" className="text-3xl">
        🧺
      </span>
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -right-1 -top-1 rounded-full bg-emerald-600 px-1.5 py-0.5 text-[0.6rem] font-black text-white"
      >
        10
      </span>
      {/* pola garis agar tidak hanya warna */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute bottom-1 left-2 right-2 h-1 rounded-full bg-emerald-200"
      />
    </button>
  )
}
