import AppleUnit from './AppleUnit'
import TensBasket from './TensBasket'
import { useI18n } from '../../i18n/LanguageContext'

type GardenSceneProps = {
  tens: number
  ones: number
  highlight?: 'tens' | 'ones' | null
  onAppleClick?: (index: number) => void
  onBasketClick?: (index: number) => void
  disabled?: boolean
  animating?: boolean
}

export default function GardenScene({
  tens,
  ones,
  highlight,
  onAppleClick,
  onBasketClick,
  disabled,
  animating,
}: GardenSceneProps) {
  const { t } = useI18n()
  return (
    <div className="grid gap-3 md:grid-cols-2" role="group" aria-label="Kebun Apel">
      <section
        aria-label={t('garden.tensArea')}
        className={`rounded-3xl border-2 bg-white p-3 shadow-sm ${highlight === 'tens' ? 'border-emerald-400 ring-4 ring-emerald-200' : 'border-emerald-100'}`}
      >
        <div className="mb-2 flex items-center gap-2">
          <span className="rounded-full bg-emerald-600 px-2.5 py-1 text-xs font-black text-white">
            P
          </span>
          <h3 className="text-sm font-black text-emerald-800">{t('garden.tensArea')}</h3>
          <span className="ml-auto text-xs font-bold text-emerald-700">
            {tens} × 10 = {tens * 10}
          </span>
        </div>
        <div className="flex min-h-24 flex-wrap gap-2">
          {Array.from({ length: tens }).map((_, i) => (
            <TensBasket
              key={`b-${String(i)}`}
              index={i}
              disabled={disabled || animating}
              pulse={highlight === 'tens'}
              onClick={() => onBasketClick?.(i)}
              label={`${t('garden.basketLabel')} ${i + 1}`}
            />
          ))}
          {tens === 0 && <p className="py-6 text-xs font-bold text-slate-400">— kosong —</p>}
        </div>
        <p className="mt-2 text-[0.65rem] font-bold text-emerald-700">
          {t('garden.tensColor')} · strip hijau + badge 10
        </p>
      </section>

      <section
        aria-label={t('garden.onesArea')}
        className={`rounded-3xl border-2 bg-white p-3 shadow-sm ${highlight === 'ones' ? 'border-amber-400 ring-4 ring-amber-200' : 'border-amber-100'}`}
      >
        <div className="mb-2 flex items-center gap-2">
          <span className="rounded-full bg-amber-500 px-2.5 py-1 text-xs font-black text-white">
            S
          </span>
          <h3 className="text-sm font-black text-amber-800">{t('garden.onesArea')}</h3>
          <span className="ml-auto text-xs font-bold text-amber-700">{ones} apel</span>
        </div>
        <div className="flex min-h-24 flex-wrap gap-2">
          {Array.from({ length: ones }).map((_, i) => (
            <AppleUnit
              key={`a-${String(i)}`}
              index={i}
              highlighted={highlight === 'ones'}
              disabled={disabled || animating}
              onClick={() => onAppleClick?.(i)}
              label={`${t('garden.appleLabel')} ${i + 1}`}
            />
          ))}
          {ones === 0 && <p className="py-6 text-xs font-bold text-slate-400">— kosong —</p>}
        </div>
        <p className="mt-2 text-[0.65rem] font-bold text-amber-700">
          {t('garden.unitsColor')} · titik kecil + bulat
        </p>
      </section>
    </div>
  )
}
