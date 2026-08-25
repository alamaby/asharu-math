import { useEffect, useRef } from 'react'

interface ConfirmDialogProps {
  open: boolean
  title: string
  description?: string
  confirmLabel: string
  cancelLabel: string
  danger?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel,
  danger = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const cancelRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (open) cancelRef.current?.focus()
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        className="animate-pop-in max-h-[80vh] w-full max-w-sm overflow-y-auto rounded-3xl bg-white p-6 shadow-xl"
      >
        <h2 id="confirm-dialog-title" className="text-lg font-black text-slate-800">
          {title}
        </h2>
        {description && <p className="mt-2 text-sm font-semibold text-slate-600">{description}</p>}
        <div className="mt-5 flex gap-2">
          <button
            ref={cancelRef}
            type="button"
            onClick={onCancel}
            className="min-h-11 flex-1 rounded-2xl border-2 border-slate-200 bg-white px-4 font-bold text-slate-600 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-300"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`min-h-11 flex-1 rounded-2xl border-b-4 px-4 font-bold text-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-300 ${
              danger
                ? 'border-rose-700 bg-rose-500 hover:bg-rose-400'
                : 'border-sky-600 bg-sky-500 hover:bg-sky-400'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
