import { describe, expect, it } from 'vitest'
import {
  ACHIEVEMENTS,
  achievementShareText,
  evaluateNewAchievements,
  getAchievement,
  statsFromProgress,
} from '../src/lib/achievements'
import { SITE_URL } from '../src/lib/site'
import { defaultProgress } from '../src/lib/storage'
import type { AchievementStats } from '../src/types'

function stats(partial: Partial<AchievementStats>): AchievementStats {
  return {
    totalCorrect: 0,
    bestStreak: 0,
    carryCorrect: 0,
    borrowCorrect: 0,
    recoveredCount: 0,
    completedLevelIds: [],
    ...partial,
  }
}

describe('ACHIEVEMENTS', () => {
  it('id dan nama unik', () => {
    const ids = ACHIEVEMENTS.map((a) => a.id)
    const names = ACHIEVEMENTS.map((a) => a.name)
    expect(new Set(ids).size).toBe(ids.length)
    expect(new Set(names).size).toBe(names.length)
  })

  it('setiap definisi memiliki ikon dan deskripsi', () => {
    for (const a of ACHIEVEMENTS) {
      expect(a.icon.length).toBeGreaterThan(0)
      expect(a.description.length).toBeGreaterThan(0)
      expect(typeof a.check).toBe('function')
    }
  })

  it('getAchievement menemukan berdasarkan id dan undefined untuk id asing', () => {
    expect(getAchievement('langkah-pertama')?.name).toBe('Langkah Pertama')
    expect(getAchievement('tidak-ada')).toBeUndefined()
  })
})

describe('statsFromProgress', () => {
  it('memetakan field progres ke statistik pencapaian', () => {
    const progress = {
      ...defaultProgress(),
      totalCorrect: 5,
      bestStreak: 3,
      carryCorrect: 2,
      borrowCorrect: 1,
      recoveredCount: 4,
      completedLevelIds: ['level-1'],
    }
    expect(statsFromProgress(progress)).toEqual(
      stats({
        totalCorrect: 5,
        bestStreak: 3,
        carryCorrect: 2,
        borrowCorrect: 1,
        recoveredCount: 4,
        completedLevelIds: ['level-1'],
      }),
    )
  })
})

describe('evaluateNewAchievements', () => {
  it('hanya mengembalikan achievement yang memenuhi syarat dan belum terbuka', () => {
    const progress = { ...defaultProgress(), totalCorrect: 1 }
    const unlocked = evaluateNewAchievements(progress)
    expect(unlocked.map((a) => a.id)).toEqual(['langkah-pertama'])
  })

  it('tidak menduplikasi achievement yang sudah terbuka', () => {
    const today = new Date().toISOString()
    const progress = {
      ...defaultProgress(),
      totalCorrect: 12,
      unlockedAchievements: { 'langkah-pertama': today },
    }
    const ids = evaluateNewAchievements(progress).map((a) => a.id)
    expect(ids).toContain('jago-satuan')
    expect(ids).not.toContain('langkah-pertama')
  })

  it('syarat level 2 digit: keempat level harus selesai', () => {
    const partial = stats({ completedLevelIds: ['level-1', 'level-2'] })
    const full = stats({ completedLevelIds: ['level-1', 'level-2', 'level-3', 'level-4'] })
    const bintang2 = getAchievement('bintang-2-digit')!
    expect(bintang2.check(partial)).toBe(false)
    expect(bintang2.check(full)).toBe(true)
  })

  it('syarat streak terbaik minimal 10 untuk tepat-10', () => {
    const tepat10 = getAchievement('tepat-10')!
    expect(tepat10.check(stats({ bestStreak: 9 }))).toBe(false)
    expect(tepat10.check(stats({ bestStreak: 10 }))).toBe(true)
  })
})

describe('achievementShareText', () => {
  const achievement = getAchievement('langkah-pertama')!

  it('menyertakan nama anak jika ada', () => {
    const text = achievementShareText(achievement, 'Budi')
    expect(text).toContain('Namaku Budi.')
    expect(text).toContain(achievement.name)
    expect(text).toContain(SITE_URL)
  })

  it('tanpa nama anak tetap lengkap dengan tautan situs', () => {
    const text = achievementShareText(achievement, null)
    expect(text).not.toContain('Namaku')
    expect(text).toContain(achievement.name)
    expect(text).toContain(SITE_URL)
  })
})
