import { useI18n } from '../../i18n/LanguageContext'
import { usePlaceLabels } from '../../i18n/places'
import type { PlaceValue } from '../../types'

interface BorrowCellProps {
  place: PlaceValue
  /** Nilai atas baru setelah meminjam, mis. 12 atau 4 */
  after: number
  testId?: string
}

/**
 * Anotasi pinjam kecil di atas kolom: menunjukkan nilai baru
 * angka atas setelah meminjam (5 → 4, 2 → 12).
 */
export default function BorrowCell({ place, after, testId }: BorrowCellProps) {
  const { t } = useI18n()
  const { long: longPlace } = usePlaceLabels()
  const placeLabel = longPlace(place)
  return (
    <div
      data-testid={testId}
      aria-label={t('borrow.newValueAria', { place: placeLabel, after })}
      title={t('borrow.becomes', { place: placeLabel, after })}
      className="animate-pop-in flex h-6 w-[var(--cell-w)] items-center justify-center rounded-md border-2 border-solid border-amber-400 bg-amber-100 text-sm font-extrabold tabular-nums text-amber-700"
    >
      {after}
    </div>
  )
}
