type Props = {
  tens: number
  ones: number
  highlight?: 'tens' | 'ones' | null
}

export default function PlaceValueZones({ tens, ones, highlight }: Props) {
  return (
    <div className="grid gap-2 md:grid-cols-2" role="group" aria-label="Akuarium area nilai tempat">
      <section
        aria-label="Area Puluhan"
        className={`rounded-3xl border-2 bg-white p-3 shadow-sm ${highlight === 'tens' ? 'border-sky-400 ring-4 ring-sky-200' : 'border-sky-100'}`}
      >
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-sky-600 px-2.5 py-1 text-xs font-black text-white">P</span>
          <h3 className="text-sm font-black text-sky-800">PULUHAN</h3>
          <span className="ml-auto flex items-center gap-1 text-xs font-bold text-sky-700">
            <span className="rounded-full bg-sky-100 px-2 py-0.5">{tens} kelompok</span>
            <span className="text-sky-500">· {tens * 10}</span>
          </span>
        </div>
        <p className="mt-1 text-[0.65rem] font-bold text-sky-600">
          Puluhan: biru cerah · pola garis · label 10
        </p>
      </section>
      <section
        aria-label="Area Satuan"
        className={`rounded-3xl border-2 bg-white p-3 shadow-sm ${highlight === 'ones' ? 'border-amber-400 ring-4 ring-amber-200' : 'border-amber-100'}`}
      >
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-amber-500 px-2.5 py-1 text-xs font-black text-white">S</span>
          <h3 className="text-sm font-black text-amber-800">SATUAN</h3>
          <span className="ml-auto text-xs font-bold text-amber-700">{ones} ikan</span>
        </div>
        <p className="mt-1 text-[0.65rem] font-bold text-amber-600">
          Satuan: kuning amber · titik · ikan individual
        </p>
      </section>
    </div>
  )
}
