import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { buildProblem } from '../src/lib/problemGenerator'
import type { AchievementDefinition } from '../src/types'
import { defaultProgress, STORAGE_KEY } from '../src/lib/storage'
import { ProgressProvider, useProgress } from '../src/state/ProgressContext'

function wrapper({ children }: { children: React.ReactNode }) {
  return <ProgressProvider>{children}</ProgressProvider>
}

describe('ProgressContext', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('useProgress di luar provider melempar error', () => {
    expect(() => renderHook(() => useProgress())).toThrow(
      'useProgress harus dipakai di dalam ProgressProvider',
    )
  })

  it('progres awal sama dengan default', () => {
    const { result } = renderHook(() => useProgress(), { wrapper })
    expect(result.current.progress).toEqual(defaultProgress())
  })

  it('recordAnswer memperbarui statistik dan mengembalikan achievement baru', () => {
    const { result } = renderHook(() => useProgress(), { wrapper })
    const problem = buildProblem('addition', 26, 87) // requiresCarry: true

    let unlocked: AchievementDefinition[] = []
    act(() => {
      unlocked = result.current.recordAnswer({ problem, wrongAttempts: 0 })
    })

    expect(unlocked.map((a) => a.id)).toContain('langkah-pertama')
    expect(result.current.progress.totalCorrect).toBe(1)
    expect(result.current.progress.currentStreak).toBe(1)
    expect(result.current.progress.bestStreak).toBe(1)
    expect(result.current.progress.carryCorrect).toBe(1)
    expect(result.current.progress.dayStreak).toBeGreaterThanOrEqual(1)
    expect(Object.keys(result.current.progress.unlockedAchievements)).toContain('langkah-pertama')
  })

  it('recordAnswer dengan percobaan salah mereset streak dan mencatat recovery', () => {
    const { result } = renderHook(() => useProgress(), { wrapper })
    const problem = buildProblem('subtraction', 52, 28)

    act(() => {
      result.current.recordAnswer({ problem, wrongAttempts: 0 })
    })
    let unlockedSecond: AchievementDefinition[] = []
    act(() => {
      unlockedSecond = result.current.recordAnswer({ problem, wrongAttempts: 2 })
    })

    // recovery membuka pencapaian "tanpa-menyerah", bukan achievement baru lainnya
    expect(unlockedSecond.map((a) => a.id)).toEqual(['tanpa-menyerah'])
    expect(result.current.progress.totalCorrect).toBe(2)
    expect(result.current.progress.totalWrong).toBe(2)
    expect(result.current.progress.currentStreak).toBe(0)
    expect(result.current.progress.bestStreak).toBe(1)
    expect(result.current.progress.recoveredCount).toBe(1)
    // bestStreak tidak turun meski streak saat ini nol
    expect(result.current.progress.bestStreak).toBeGreaterThan(
      result.current.progress.currentStreak,
    )
  })

  it('completeLevel mencatat level sekali dan menyimpan skor terbaik', () => {
    const { result } = renderHook(() => useProgress(), { wrapper })

    act(() => {
      result.current.completeLevel('level-1', 2)
    })
    act(() => {
      result.current.completeLevel('level-1', 3)
    })

    expect(result.current.progress.completedLevelIds).toEqual(['level-1'])
    expect(result.current.progress.bestScores['level-1']).toBe(3)
  })

  it('menyelesaikan seluruh level 2 digit membuka achievement bintang-2-digit', () => {
    const { result } = renderHook(() => useProgress(), { wrapper })

    act(() => {
      for (const id of ['level-1', 'level-2', 'level-3']) {
        result.current.completeLevel(id, 3)
      }
    })
    let lastUnlocked: AchievementDefinition[] = []
    act(() => {
      lastUnlocked = result.current.completeLevel('level-4', 3)
    })

    expect(lastUnlocked.map((a) => a.id)).toContain('bintang-2-digit')
  })

  it('setChildName memangkas spasi dan membatasi 20 karakter', () => {
    const { result } = renderHook(() => useProgress(), { wrapper })

    act(() => result.current.setChildName('  Budi  '))
    expect(result.current.progress.childName).toBe('Budi')

    act(() => result.current.setChildName('a'.repeat(30)))
    expect(result.current.progress.childName).toBe('a'.repeat(20))

    act(() => result.current.setChildName(null))
    expect(result.current.progress.childName).toBeNull()
  })

  it('progres tersimpan ke localStorage setelah perubahan', async () => {
    const { result } = renderHook(() => useProgress(), { wrapper })
    const problem = buildProblem('addition', 26, 87)

    act(() => {
      result.current.recordAnswer({ problem, wrongAttempts: 0 })
    })

    await waitFor(() => {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      expect(raw).not.toBeNull()
      expect(JSON.parse(raw as string).totalCorrect).toBe(1)
    })
  })

  it('resetProgress mengembalikan kondisi awal dan membersihkan localStorage', () => {
    const { result } = renderHook(() => useProgress(), { wrapper })

    act(() => {
      result.current.completeLevel('level-1', 2)
      result.current.setChildName('Budi')
    })
    act(() => result.current.resetProgress())

    expect(result.current.progress).toEqual(defaultProgress())
    // Efek persistensi menulis ulang kondisi default setelah reset
    const raw = window.localStorage.getItem(STORAGE_KEY)
    expect(raw).not.toBeNull()
    expect(JSON.parse(raw as string)).toEqual(defaultProgress())
  })
})
