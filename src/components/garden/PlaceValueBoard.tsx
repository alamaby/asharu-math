type PlaceValueBoardProps = {
  tens: number
  ones: number
  hundreds?: number
  highlight?: 'tens' | 'ones' | 'hundreds' | null
  showHundreds?: boolean
}

export default function PlaceValueBoard({
  tens,
  ones,
  hundreds = 0,
  highlight,
  showHundreds,
}: PlaceValueBoardProps) {
  const showR = showHundreds ?? hundreds > 0
  return (
    <div className="flex gap-2" role="group" aria-label="Papan nilai tempat">
      {showR && (
        <div
          className={`flex-1 rounded-2xl border-2 p-3 text-center ${highlight === 'hundreds' ? 'border-violet-400 bg-violet-50 ring-4 ring-violet-200' : 'border-violet-100 bg-white'}`}
        >
          <p className="text-[0.65rem] font-black uppercase tracking-wide text-violet-700">
            Ratusan · R
          </p>
          <p className="mt-1 text-2xl font-black tabular-nums text-violet-700">{hundreds}</p>
          <p className="text-[0.65rem] font-bold text-violet-600">{hundreds} peti</p>
        </div>
      )}
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
