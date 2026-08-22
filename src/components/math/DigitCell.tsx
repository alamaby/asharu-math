interface DigitCellProps {
  digit: string | null
  /** Digit dipinjam oleh kolom kanan → tampil dicoret */
  struck?: boolean
  testId?: string
}

/**
 * Kotak digit statis untuk operand. Digit null berarti kolom kosong
 * (padding kiri) dan tetap dirender agar posisi kolom tidak bergeser.
 */
export default function DigitCell({ digit, struck = false, testId }: DigitCellProps) {
  const style = { width: 'var(--cell-w)', height: 'var(--cell-w)' }

  if (digit === null) {
    return (
      <div
        aria-hidden="true"
        data-testid={testId}
        style={style}
        className="rounded-xl border-2 border-dashed border-slate-200/70"
      />
    )
  }

  return (
    <div
      data-testid={testId}
      style={style}
      className={`flex items-center justify-center rounded-xl bg-white text-3xl font-extrabold tabular-nums text-slate-800 shadow-sm ${
        struck ? 'text-slate-400 line-through decoration-2 decoration-amber-500/70' : ''
      }`}
    >
      {digit}
    </div>
  )
}
