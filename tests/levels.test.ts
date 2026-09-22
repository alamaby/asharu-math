import { describe, expect, it } from 'vitest'
import { getNextLevelId, isLevelUnlocked, LEVELS } from '../src/data/levels'

describe('isLevelUnlocked', () => {
  it('user baru: hanya k1-membilang yang terbuka', () => {
    const completed: string[] = []
    expect(isLevelUnlocked('k1-membilang', completed)).toBe(true)
    expect(isLevelUnlocked('k1-banding', completed)).toBe(false)
    expect(isLevelUnlocked('k1-tambah-1-digit', completed)).toBe(false)
    expect(isLevelUnlocked('level-1', completed)).toBe(false)
    expect(isLevelUnlocked('tantangan', completed)).toBe(false)
  })

  it('level yang sudah selesai selalu bisa diulang walau migrasi belum lengkap', () => {
    expect(isLevelUnlocked('level-1', ['level-1'])).toBe(true)
    expect(isLevelUnlocked('level-5', ['level-5'])).toBe(true)
  })

  it('veteran dengan legacy level-1: seluruh Kelas 1 terbuka dan level-1 terbuka', () => {
    const completed = ['level-1']
    expect(isLevelUnlocked('k1-tambah-1-digit', completed)).toBe(true)
    expect(isLevelUnlocked('k1-kurang-1-digit', completed)).toBe(true)
    expect(isLevelUnlocked('k1-jembatan-2-digit', completed)).toBe(true)
    expect(isLevelUnlocked('level-1', completed)).toBe(true)
    // level berikutnya belum otomatis terbuka tanpa menyelesaikan level prasyaratnya
    expect(isLevelUnlocked('level-2', completed)).toBe(true)
    expect(isLevelUnlocked('level-3', completed)).toBe(false)
  })

  it('veteran dengan level tengah tetap tidak membuka level lompat', () => {
    const completed = ['level-5']
    expect(isLevelUnlocked('k1-tambah-1-digit', completed)).toBe(true)
    expect(isLevelUnlocked('level-1', completed)).toBe(true)
    expect(isLevelUnlocked('level-6', completed)).toBe(true)
    expect(isLevelUnlocked('level-7', completed)).toBe(false)
  })

  it('rantai K1 berurutan untuk user baru', () => {
    expect(isLevelUnlocked('k1-banding', ['k1-membilang'])).toBe(true)
    expect(isLevelUnlocked('k1-nilai-tempat', ['k1-banding'])).toBe(true)
    expect(isLevelUnlocked('k1-tambah-1-digit', ['k1-nilai-tempat'])).toBe(true)
    expect(isLevelUnlocked('k1-kurang-1-digit', ['k1-tambah-1-digit'])).toBe(true)
    // k1-campur membutuhkan langsung k1-kurang, bukan akumulasi tidak langsung
    expect(isLevelUnlocked('k1-campur-1-digit', ['k1-kurang-1-digit'])).toBe(true)
    expect(isLevelUnlocked('k1-campur-1-digit', ['k1-tambah-1-digit'])).toBe(false)
    expect(isLevelUnlocked('k1-campur-1-digit', ['k1-tambah-1-digit', 'k1-kurang-1-digit'])).toBe(
      true,
    )
    expect(isLevelUnlocked('k1-jembatan-2-digit', ['k1-campur-1-digit'])).toBe(true)
    expect(isLevelUnlocked('level-1', ['k1-jembatan-2-digit'])).toBe(true)
  })

  it('id tidak dikenal selalu terkunci', () => {
    expect(isLevelUnlocked('tidak-ada', [])).toBe(false)
    expect(isLevelUnlocked('tidak-ada', ['level-1'])).toBe(false)
  })

  it('rantai cerita: cerita-1 terbuka setelah level-11', () => {
    expect(isLevelUnlocked('cerita-1', ['level-11'])).toBe(true)
    expect(isLevelUnlocked('cerita-1', [])).toBe(false)
    expect(isLevelUnlocked('cerita-2', ['cerita-1'])).toBe(true)
    expect(isLevelUnlocked('cerita-3', ['cerita-2'])).toBe(true)
    expect(isLevelUnlocked('cerita-4', ['cerita-3'])).toBe(true)
    // tantangan harus setelah cerita-4
    expect(isLevelUnlocked('tantangan', ['level-11'])).toBe(false)
    expect(isLevelUnlocked('tantangan', ['cerita-4'])).toBe(true)
  })

  it('semua level story punya settings.kind === story dan requires menunjuk id valid', () => {
    const ids = new Set(LEVELS.map((l) => l.id))
    for (const level of LEVELS) {
      if (level.levelKind !== 'story') continue
      expect((level.settings as { kind?: string }).kind).toBe('story')
      if (level.requires !== null) {
        expect(ids.has(level.requires)).toBe(true)
      }
    }
  })
})

describe('getNextLevelId linear', () => {
  it('mengembalikan id berikutnya dalam LEVELS', () => {
    for (let i = 0; i < LEVELS.length - 1; i++) {
      expect(getNextLevelId(LEVELS[i].id)).toBe(LEVELS[i + 1].id)
    }
    expect(getNextLevelId(LEVELS[LEVELS.length - 1].id)).toBeNull()
    expect(getNextLevelId('tidak-ada')).toBeNull()
    expect(getNextLevelId(null)).toBeNull()
  })

  it('rantai cerita linier: level-11 -> cerita-1 ... -> tantangan', () => {
    expect(getNextLevelId('level-11')).toBe('cerita-1')
    expect(getNextLevelId('cerita-1')).toBe('cerita-2')
    expect(getNextLevelId('cerita-2')).toBe('cerita-3')
    expect(getNextLevelId('cerita-3')).toBe('cerita-4')
    expect(getNextLevelId('cerita-4')).toBe('tantangan')
  })
})
