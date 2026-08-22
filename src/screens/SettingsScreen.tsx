import { useState } from 'react'
import ConfirmDialog from '../components/common/ConfirmDialog'
import { useProgress } from '../state/ProgressContext'

function Toggle(props: { checked: boolean; onChange: (value: boolean) => void; label: string; description: string }) {
  const { checked, onChange, label, description } = props
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between gap-3 rounded-2xl border-2 border-sky-100 bg-white p-4 text-left shadow-sm hover:bg-sky-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-300"
    >
      <span>
        <span className="block text-sm font-black text-slate-800">{label}</span>
        <span className="block text-xs font-semibold text-slate-500">{description}</span>
      </span>
      <span
        aria-hidden="true"
        className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${checked ? 'bg-emerald-500' : 'bg-slate-300'}`}
      >
        <span
          className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all ${checked ? 'left-6' : 'left-1'}`}
        />
      </span>
    </button>
  )
}

export default function SettingsScreen() {
  const { progress, setPreferences, resetProgress } = useProgress()
  const [confirmOpen, setConfirmOpen] = useState(false)

  return (
    <div className="space-y-4">
      <h1 className="pt-1 text-lg font-black text-slate-800">Pengaturan</h1>

      <section aria-label="Preferensi" className="space-y-2">
        <Toggle
          checked={progress.soundEnabled}
          onChange={(value) => setPreferences({ soundEnabled: value })}
          label="Suara 🔊"
          description="Bunyi ramah saat jawaban benar atau salah"
        />
        <Toggle
          checked={progress.animationsEnabled}
          onChange={(value) => setPreferences({ animationsEnabled: value })}
          label="Animasi ✨"
          description="Animasi kecil yang menyenangkan (dimatikan juga mengikuti pengaturan perangkat)"
        />
      </section>

      <section aria-label="Data" className="rounded-3xl border-2 border-rose-100 bg-rose-50 p-4">
        <h2 className="text-sm font-black text-rose-800">Hapus Progres</h2>
        <p className="mt-1 text-xs font-semibold text-rose-700">
          Semua level, skor, dan pencapaian akan dihapus dari perangkat ini. Tindakan ini tidak bisa dibatalkan.
        </p>
        <button
          type="button"
          onClick={() => setConfirmOpen(true)}
          className="mt-3 min-h-11 rounded-2xl border-b-4 border-rose-600 bg-rose-500 px-4 text-sm font-bold text-white hover:bg-rose-400 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-rose-300"
        >
          🗑️ Hapus Progres
        </button>
      </section>

      <p className="rounded-2xl bg-white p-4 text-xs font-semibold text-slate-500 shadow-sm">
        🔒 Asharu Math menyimpan progres hanya di perangkat ini (localStorage) dan tidak mengumpulkan nama,
        foto, maupun data pribadi anak lainnya.
      </p>

      <ConfirmDialog
        open={confirmOpen}
        title="Hapus semua progres?"
        description="Level selesai, skor, dan pencapaian akan hilang. Kamu bisa mulai belajar lagi dari awal."
        confirmLabel="Ya, hapus"
        cancelLabel="Batal"
        danger
        onConfirm={() => {
          resetProgress()
          setConfirmOpen(false)
        }}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  )
}
