import { useState, type FormEvent } from 'react'

interface ChildNameFormProps {
  initialName: string | null
  onSave: (name: string) => void
  /** Tautan "Lewati dulu" (hanya untuk kartu sapaan beranda) */
  onSkip?: () => void
}

/**
 * Form nama panggilan anak. Nama bersifat opsional, maksimal 20 karakter,
 * dan hanya tersimpan di perangkat (localStorage).
 */
export default function ChildNameForm({ initialName, onSave, onSkip }: ChildNameFormProps) {
  const [value, setValue] = useState(initialName ?? '')
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    const trimmed = value.trim()
    if (trimmed.length === 0) {
      setError('Tulis dulu namamu ya.')
      return
    }
    onSave(trimmed.slice(0, 20))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <label htmlFor="child-name" className="block text-sm font-black text-slate-700">
        Siapa namamu?
      </label>
      <input
        id="child-name"
        value={value}
        onChange={(event) => {
          setValue(event.target.value.slice(0, 20))
          setError(null)
        }}
        maxLength={20}
        autoComplete="off"
        placeholder="Nama panggilan"
        aria-label="Nama panggilan anak"
        className="h-12 w-full rounded-2xl border-2 border-sky-200 bg-white px-4 text-lg font-extrabold text-slate-800 placeholder:font-semibold placeholder:text-slate-300 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-300"
      />
      {error && (
        <p role="alert" className="text-sm font-bold text-amber-700">
          {error}
        </p>
      )}
      <div className="flex gap-2">
        <button
          type="submit"
          className="min-h-12 flex-1 rounded-2xl border-b-4 border-sky-600 bg-sky-500 text-base font-black text-white hover:bg-sky-400 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-300"
        >
          Simpan Nama
        </button>
        {onSkip && (
          <button
            type="button"
            onClick={onSkip}
            className="min-h-12 rounded-2xl border-2 border-slate-200 bg-white px-4 text-sm font-bold text-slate-500 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-300"
          >
            Lewati dulu
          </button>
        )}
      </div>
      <p className="text-xs font-semibold text-slate-400">
        Nama hanya tersimpan di perangkat ini ya.
      </p>
    </form>
  )
}
