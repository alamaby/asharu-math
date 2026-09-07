type Props = { text: string | null }

export default function NarrationSubtitle({ text }: Props) {
  if (!text) return null
  return (
    <div
      className="rounded-2xl border-2 border-sky-100 bg-white/90 p-3 backdrop-blur"
      aria-live="polite"
    >
      <p className="text-sm font-bold leading-relaxed text-slate-700">{text}</p>
      <p className="mt-1 text-[0.65rem] font-bold text-slate-400">Subtitle — tetap tampil tanpa suara</p>
    </div>
  )
}
