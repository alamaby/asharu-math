import { useI18n } from '../../i18n/LanguageContext'
import type { TrainGrade } from '../../lib/trainQuestionGenerator'

export interface TrainMenuProps {
  onStart: (grade: TrainGrade) => void
  bestStarsByGrade: Record<string, number>
  resumeInfo?: { grade: TrainGrade; round: number; total: number } | null
  onResume?: () => void
}

const GRADES: TrainGrade[] = [1, 2, 3]

export default function TrainMenu({
  onStart,
  bestStarsByGrade,
  resumeInfo,
  onResume,
}: TrainMenuProps) {
  const { t } = useI18n()
  const resumeGradeLabel =
    resumeInfo?.grade === 1
      ? t('train.grade1')
      : resumeInfo?.grade === 2
        ? t('train.grade2')
        : t('train.grade3')
  return (
    <div className="space-y-2">
      <div className="rounded-3xl border-2 border-amber-200 bg-white p-4 text-center shadow-sm">
        <h2 className="text-lg font-black text-slate-800">{t('train.title')} 🚂</h2>
        <p className="mt-1 text-sm font-bold text-slate-500">{t('train.subtitle')}</p>
        <p className="mt-2 text-xs font-black uppercase tracking-wide text-slate-400">
          {t('train.selectGrade')}
        </p>
      </div>
      {resumeInfo && onResume && (
        <div className="space-y-1">
          <button
            type="button"
            onClick={onResume}
            className="min-h-14 w-full rounded-2xl border-b-4 border-emerald-600 bg-emerald-500 px-4 py-3 text-left text-base font-black text-white hover:bg-emerald-400 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-300"
          >
            {t('train.resumeSession', {
              gradeLabel: resumeGradeLabel,
              n: resumeInfo.round + 1,
              total: resumeInfo.total,
            })}
          </button>
          <p className="text-center text-xs font-bold text-slate-400">{t('train.startNewHint')}</p>
        </div>
      )}
      {GRADES.map((g) => {
        const best = bestStarsByGrade[String(g)] ?? 0
        const gradeLabel =
          g === 1 ? t('train.grade1') : g === 2 ? t('train.grade2') : t('train.grade3')
        return (
          <button
            key={g}
            type="button"
            onClick={() => onStart(g)}
            className="min-h-14 w-full rounded-2xl border-b-4 border-amber-600 bg-amber-400 px-4 py-3 text-left hover:bg-amber-300 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-amber-200"
          >
            <span className="block text-base font-black text-amber-950">
              {gradeLabel} · {t('train.start')}
            </span>
            <span className="mt-0.5 block text-xs font-bold text-amber-900">
              {best > 0 ? `★ ${best}/15` : '✨ Belum dicoba'}
            </span>
          </button>
        )
      })}
    </div>
  )
}
