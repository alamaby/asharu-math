type PlaceValueBoardProps = {
  tens: number
  ones: number
  highlight?: 'tens' | 'ones' | null
}

export default function PlaceValueBoard({ tens, ones, highlight }: PlaceValueBoardProps) {
  return (
    <div className="flex gap-2" role="group" aria-label="Papan nilai tempat">
      <div
        className={`flex-1 rounded-2xl border-2 p-3 text-center ${highlight === 'tens' ? 'border-emerald-400 bg-emerald-50 ring-4 ring-emerald-200' : 'border-emerald-100 bg-white'}`}
      >
        <p className="text-[0.65rem] font-black uppercase tracking-wide text-emerald-700">
          Puluhan · P
        </p>
        <p className="mt-1 text-2xl font-black tabular-nums text-emerald-700">{tens}</p>
        <p className="text-[0.65rem] font-bold text-emerald-600">{tens} keranjang</p>
      </div>
      <div
        className={`flex-1 rounded-2xl border-2 p-3 text-center ${highlight === 'ones' ? 'border-amber-400 bg-amber-50 ring-4 ring-amber-200' : 'border-amber-100 bg-white'}`}
      >
        <p className="text-[0.65rem] font-black uppercase tracking-wide text-amber-700">
          Satuan · S
        </p>
        <p className="mt-1 text-2xl font-black tabular-nums text-amber-700">{ones}</p>
        <p className="text-[0.65rem] font-bold text-amber-600">{ones} apel</p>
      </div>
    </div>
  )
}
