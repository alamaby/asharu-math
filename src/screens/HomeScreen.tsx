import MascotBubble from '../components/layout/MascotBubble'
import { LEVELS, getLevel } from '../data/levels'
import { getAchievement } from '../lib/achievements'
import { useNavigation } from '../state/NavigationContext'
import { useProgress } from '../state/ProgressContext'

export default function HomeScreen() {
  const { navigate, goToTab } = useNavigation()
  const { progress } = useProgress()

  const completedCount = progress.completedLevelIds.length
  const lastLevel = progress.lastLevelId ? getLevel(progress.lastLevelId) : undefined
  const recentAchievements = Object.entries(progress.unlockedAchievements)
    .sort((a, b) => b[1].localeCompare(a[1]))
    .slice(0, 3)

  return (
    <div className="space-y-5">
      <section className="pt-2">
        <MascotBubble text="Halo! Aku Asya. Yuk, belajar berhitung bersusun! Mulai dari satuan, lalu lanjut ke puluhan." mood="cheer" />
      </section>

      <section aria-label="Ringkasan progres" className="grid grid-cols-3 gap-2">
        <div className="rounded-2xl border-2 border-sky-100 bg-white p-3 text-center shadow-sm">
          <p className="text-2xl font-black text-sky-600">
            {completedCount}
            <span className="text-sm text-slate-400">/{LEVELS.length}</span>
          </p>
          <p className="mt-0.5 text-xs font-bold text-slate-500">Level selesai</p>
        </div>
        <div className="rounded-2xl border-2 border-sky-100 bg-white p-3 text-center shadow-sm">
          <p className="text-2xl font-black text-amber-500">🔥 {progress.dayStreak}</p>
          <p className="mt-0.5 text-xs font-bold text-slate-500">Hari berturut-turut</p>
        </div>
        <div className="rounded-2xl border-2 border-sky-100 bg-white p-3 text-center shadow-sm">
          <p className="text-2xl font-black text-emerald-600">{progress.totalCorrect}</p>
          <p className="mt-0.5 text-xs font-bold text-slate-500">Jawaban benar</p>
        </div>
      </section>

      <section aria-label="Tindakan utama" className="space-y-2">
        <button
          type="button"
          disabled={!lastLevel}
          onClick={() => lastLevel && navigate({ name: 'learn', levelId: lastLevel.id })}
          className="min-h-14 w-full rounded-2xl border-b-4 border-emerald-600 bg-emerald-500 px-4 text-left text-base font-black text-white hover:bg-emerald-400 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-300 disabled:opacity-40"
        >
          ▶ Lanjutkan{lastLevel ? `: ${lastLevel.name}` : ' (mulai level pertama dulu)'}
        </button>
        <button
          type="button"
          onClick={() => goToTab('levels')}
          className="min-h-14 w-full rounded-2xl border-b-4 border-sky-600 bg-sky-500 px-4 text-left text-base font-black text-white hover:bg-sky-400 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-300"
        >
          📚 Mulai Belajar
        </button>
        <button
          type="button"
          onClick={() => goToTab('practice')}
          className="min-h-14 w-full rounded-2xl border-b-4 border-amber-500 bg-amber-400 px-4 text-left text-base font-black text-amber-950 hover:bg-amber-300 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-amber-200"
        >
          ✏️ Latihan Soal
        </button>
      </section>

      {recentAchievements.length > 0 && (
        <section aria-label="Pencapaian terbaru">
          <h2 className="text-sm font-black text-slate-700">Pencapaian terbaru 🏆</h2>
          <div className="mt-2 flex flex-wrap gap-2">
            {recentAchievements.map(([id]) => {
              const achievement = getAchievement(id)
              if (!achievement) return null
              return (
                <span
                  key={id}
                  className="flex items-center gap-1.5 rounded-full border-2 border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-800"
                >
                  <span aria-hidden="true">{achievement.icon}</span>
                  {achievement.name}
                </span>
              )
            })}
          </div>
        </section>
      )}

      <div className="pt-1 text-center">
        <button
          type="button"
          onClick={() => navigate({ name: 'settings' })}
          className="min-h-11 rounded-2xl px-4 text-sm font-bold text-slate-500 hover:bg-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-300"
        >
          ⚙️ Pengaturan
        </button>
      </div>
    </div>
  )
}
