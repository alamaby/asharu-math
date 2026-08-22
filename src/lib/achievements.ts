import type { AchievementDefinition, AchievementStats, UserProgress } from '../types'

export const ACHIEVEMENTS: readonly AchievementDefinition[] = [
  {
    id: 'langkah-pertama',
    name: 'Langkah Pertama',
    description: 'Menyelesaikan soal pertama',
    icon: '🌱',
    check: (stats) => stats.totalCorrect >= 1,
  },
  {
    id: 'jago-satuan',
    name: 'Jago Satuan',
    description: 'Menjawab 10 soal dengan benar',
    icon: '🔢',
    check: (stats) => stats.totalCorrect >= 10,
  },
  {
    id: 'ahli-menyimpan',
    name: 'Ahli Menyimpan',
    description: 'Menyelesaikan 10 soal penjumlahan dengan menyimpan',
    icon: '🎒',
    check: (stats) => stats.carryCorrect >= 10,
  },
  {
    id: 'ahli-meminjam',
    name: 'Ahli Meminjam',
    description: 'Menyelesaikan 10 soal pengurangan dengan meminjam',
    icon: '🤝',
    check: (stats) => stats.borrowCorrect >= 10,
  },
  {
    id: 'bintang-2-digit',
    name: 'Bintang 2 Digit',
    description: 'Menyelesaikan semua level 2 digit',
    icon: '⭐',
    check: (stats) =>
      ['level-1', 'level-2', 'level-3', 'level-4'].every((id) => stats.completedLevelIds.includes(id)),
  },
  {
    id: 'bintang-3-digit',
    name: 'Bintang 3 Digit',
    description: 'Menyelesaikan semua level 3 digit',
    icon: '🌟',
    check: (stats) =>
      ['level-5', 'level-6', 'level-7', 'level-8'].every((id) => stats.completedLevelIds.includes(id)),
  },
  {
    id: 'bintang-4-digit',
    name: 'Bintang 4 Digit',
    description: 'Menyelesaikan semua level 4 digit',
    icon: '💫',
    check: (stats) =>
      ['level-9', 'level-10', 'level-11'].every((id) => stats.completedLevelIds.includes(id)),
  },
  {
    id: 'tanpa-menyerah',
    name: 'Tanpa Menyerah',
    description: 'Memperbaiki jawaban salah hingga menjadi benar',
    icon: '💪',
    check: (stats) => stats.recoveredCount >= 1,
  },
  {
    id: 'tepat-10',
    name: '10 Jawaban Tepat',
    description: 'Menjawab 10 soal dengan benar berturut-turut',
    icon: '🔥',
    check: (stats) => stats.bestStreak >= 10,
  },
]

export function getAchievement(id: string): AchievementDefinition | undefined {
  return ACHIEVEMENTS.find((achievement) => achievement.id === id)
}

export function statsFromProgress(progress: UserProgress): AchievementStats {
  return {
    totalCorrect: progress.totalCorrect,
    bestStreak: progress.bestStreak,
    carryCorrect: progress.carryCorrect,
    borrowCorrect: progress.borrowCorrect,
    recoveredCount: progress.recoveredCount,
    completedLevelIds: progress.completedLevelIds,
  }
}

/** Mengembalikan achievement yang BARU terbuka berdasarkan progres terkini. */
export function evaluateNewAchievements(progress: UserProgress): AchievementDefinition[] {
  const stats = statsFromProgress(progress)
  return ACHIEVEMENTS.filter(
    (achievement) => !(achievement.id in progress.unlockedAchievements) && achievement.check(stats),
  )
}

export function achievementShareText(achievement: AchievementDefinition): string {
  return `Aku mendapatkan pencapaian '${achievement.name}' di Asharu Math! Yuk, belajar matematika bersama!`
}
