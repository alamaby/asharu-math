interface OperatorCellProps {
  symbol: '+' | '−'
  testId?: string
}

/**
 * Simbol operator. Selalu ditempatkan pada kolom paling kanan
 * baris operand kedua — tidak pernah masuk kolom digit.
 */
export default function OperatorCell({ symbol, testId }: OperatorCellProps) {
  return (
    <div
      data-testid={testId}
      className="flex h-[var(--cell-w)] w-8 items-center justify-center text-3xl font-black text-slate-700 md:w-10"
      aria-label={symbol === '+' ? 'tambah' : 'kurang'}
      role="img"
    >
      {symbol}
    </div>
  )
}
