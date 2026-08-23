import { describe, expect, it } from 'vitest'
import { achievementShareText, getAchievement } from '../src/lib/achievements'
import { facebookShareUrl, telegramShareUrl, whatsappShareUrl, xShareUrl } from '../src/lib/socialShare'
import { SITE_URL } from '../src/lib/site'

const achievement = getAchievement('ahli-menyimpan')

describe('teks bagikan achievement', () => {
  it('menyertakan nama anak bila ada', () => {
    const text = achievementShareText(achievement!, 'Budi')
    expect(text).toContain('Namaku Budi.')
    expect(text).toContain("'Ahli Menyimpan'")
    expect(text).toContain(SITE_URL)
  })

  it('tanpa nama tetap valid dan memuat URL', () => {
    const text = achievementShareText(achievement!, null)
    expect(text).not.toContain('Namaku')
    expect(text).toContain(SITE_URL)
  })
})

describe('tautan berbagi media sosial', () => {
  const message = `Namaku Budi. Pencapaian 'Ahli Menyimpan' ${SITE_URL}`

  it('whatsapp mengodekan teks lengkap', () => {
    expect(whatsappShareUrl(message)).toBe(`https://wa.me/?text=${encodeURIComponent(message)}`)
  })

  it('facebook memakai tautan situs', () => {
    expect(facebookShareUrl()).toBe(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(SITE_URL)}`)
    expect(facebookShareUrl('https://lain.example')).toContain('lain.example')
  })

  it('x (twitter) memuat teks terkode', () => {
    expect(xShareUrl(message)).toBe(`https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}`)
  })

  it('telegram memuat url dan teks terkode', () => {
    const url = telegramShareUrl(message)
    expect(url.startsWith('https://t.me/share/url?')).toBe(true)
    expect(url).toContain(`url=${encodeURIComponent(SITE_URL)}`)
    expect(url).toContain(`text=${encodeURIComponent(message)}`)
  })
})
