import { useI18n } from '../../i18n/LanguageContext'
import { usePlaceLabels } from '../../i18n/places'
import type { PlaceValue } from '../../types'

interface CarryCellProps {
  place: PlaceValue
  value: number | null
  active?: boolean
  testId?: string
}

/**
 * Kotak simpan kecil di atas kolom TUJUAN carry.
 * Carry dari satuan (hasil 13) ditampilkan di atas kolom puluhan,
 * bukan di atas satuan, agar tidak membingungkan anak.
 */
export default function CarryCell({ place, value, active = false, testId }: CarryCellProps) {
  const { t } = useI18n()
  const { long: longPlace } = usePlaceLabels()
  const placeLabel = longPlace(place)
  const filled = value !== null

  return (
    <div
      data-testid={testId}
      role={active ? 'button' : undefined}
      aria-label={t('carry.aria', { place: placeLabel, value })}
      className={`flex h-6 w-[var(--cell-w)] items-center justify-center rounded-md border-2 text-base font-extrabold tabular-nums transition-colors ${
        filled
          ? 'border-solid border-violet-400 bg-violet-100 text-violet-700'
          : active
            ? 'border-solid border-violet-600 bg-violet-50 text-violet-700 ring-4 ring-violet-200'
            : 'border-dashed border-violet-300 bg-violet-50/50 text-violet-400'
      }`}
    >
      {filled ? value : active ? '?' : ''}
    </div>
  )
}
