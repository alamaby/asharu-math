import type { Language } from '../i18n/types'
import { createT } from '../i18n/core'
import type { AchievementDefinition, AchievementStats, UserProgress } from '../types'
import { SITE_URL } from './site'

export const ACHIEVEMENTS: readonly AchievementDefinition[] = [
  {
    id: 'langkah-pertama',
    name: { id: 'Langkah Pertama', en: 'First Steps' },
    description: { id: 'Menyelesaikan soal pertama', en: 'Solved the very first question' },
    icon: '🌱',
    check: (stats) => stats.totalCorrect >= 1,
  },
  {
    id: 'jago-satuan',
    name: { id: 'Jago Satuan', en: 'Ones Place Pro' },
    description: { id: 'Menjawab 10 soal dengan benar', en: 'Answered 10 questions correctly' },
    icon: '🔢',
    check: (stats) => stats.totalCorrect >= 10,
  },
  {
    id: 'ahli-menyimpan',
    name: { id: 'Ahli Menyimpan', en: 'Carrying Expert' },
    description: {
      id: 'Menyelesaikan 10 soal penjumlahan dengan menyimpan',
      en: 'Solved 10 addition questions with carrying',
    },
    icon: '🎒',
    check: (stats) => stats.carryCorrect >= 10,
  },
  {
    id: 'ahli-meminjam',
    name: { id: 'Ahli Meminjam', en: 'Borrowing Expert' },
    description: {
      id: 'Menyelesaikan 10 soal pengurangan dengan meminjam',
      en: 'Solved 10 subtraction questions with borrowing',
    },
    icon: '🤝',
    check: (stats) => stats.borrowCorrect >= 10,
  },
  {
    id: 'bintang-2-digit',
    name: { id: 'Bintang 2 Digit', en: '2-Digit Star' },
    description: {
      id: 'Menyelesaikan semua level 2 digit',
      en: 'Completed every 2-digit level',
    },
    icon: '⭐',
    check: (stats) =>
      ['level-1', 'level-2', 'level-3', 'level-4'].every((id) =>
        stats.completedLevelIds.includes(id),
      ),
  },
  {
    id: 'bintang-3-digit',
    name: { id: 'Bintang 3 Digit', en: '3-Digit Star' },
    description: {
      id: 'Menyelesaikan semua level 3 digit',
      en: 'Completed every 3-digit level',
    },
    icon: '🌟',
    check: (stats) =>
      ['level-5', 'level-6', 'level-7', 'level-8'].every((id) =>
        stats.completedLevelIds.includes(id),
      ),
  },
  {
    id: 'bintang-4-digit',
    name: { id: 'Bintang 4 Digit', en: '4-Digit Star' },
    description: {
      id: 'Menyelesaikan semua level 4 digit',
      en: 'Completed every 4-digit level',
    },
    icon: '💫',
    check: (stats) =>
      ['level-9', 'level-10', 'level-11'].every((id) => stats.completedLevelIds.includes(id)),
  },
  {
    id: 'tanpa-menyerah',
    name: { id: 'Tanpa Menyerah', en: 'Never Give Up' },
    description: {
      id: 'Memperbaiki jawaban salah hingga menjadi benar',
      en: 'Fixed a wrong answer until it became correct',
    },
    icon: '💪',
    check: (stats) => stats.recoveredCount >= 1,
  },
  {
    id: 'tepat-10',
    name: { id: '10 Jawaban Tepat', en: '10 in a Row' },
    description: {
      id: 'Menjawab 10 soal dengan benar berturut-turut',
      en: 'Answered 10 questions correctly in a row',
    },
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

export function achievementShareText(
  achievement: AchievementDefinition,
  childName?: string | null,
  lang: Language = 'id',
): string {
  const t = createT(lang)
  const intro = childName ? t('share.introWithName', { name: childName }) : ''
  return t('share.template', {
    intro,
    achievement: achievement.name[lang],
    url: SITE_URL,
  })
}
