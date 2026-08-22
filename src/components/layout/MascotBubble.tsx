import Mascot, { type MascotMood } from './Mascot'

interface MascotBubbleProps {
  text: string
  mood?: MascotMood
}

/** Maskot dengan balon bicara berisi instruksi ramah anak. */
export default function MascotBubble({ text, mood = 'happy' }: MascotBubbleProps) {
  return (
    <div className="flex items-start gap-3">
      <Mascot mood={mood} size={56} className="shrink-0 drop-shadow-sm" />
      <div className="relative flex-1 rounded-2xl border-2 border-sky-200 bg-white px-4 py-3 shadow-sm">
        <span
          aria-hidden="true"
          className="absolute top-4 -left-2 h-3 w-3 rotate-45 border-b-2 border-l-2 border-sky-200 bg-white"
        />
        <p className="text-sm font-bold leading-relaxed text-slate-700 md:text-base">{text}</p>
      </div>
    </div>
  )
}
