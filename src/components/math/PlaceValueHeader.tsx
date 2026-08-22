import { PLACE_LABELS, PLACE_SHORT_LABELS } from '../../lib/placeValue'
import type { PlaceValue } from '../../types'

interface PlaceValueHeaderProps {
  places: readonly { place: PlaceValue; used: boolean }[]
}

/**
 * Label nilai tempat di atas area soal (kini juga dirender langsung
 * di dalam grid VerticalMathProblem; komponen ini disediakan untuk
 * legenda/penjelasan nilai tempat di luar grid).
 */
export default function PlaceValueHeader({ places }: PlaceValueHeaderProps) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-bold text-slate-500">
      {places.map((item) => (
        <span
          key={item.place}
          title={PLACE_LABELS[item.place]}
          className={`rounded-full px-2 py-1 ${
            item.used ? 'bg-sky-100 text-sky-700' : 'bg-slate-100 text-slate-300'
          }`}
        >
          {PLACE_SHORT_LABELS[item.place]} = {PLACE_LABELS[item.place]}
        </span>
      ))}
    </div>
  )
}
