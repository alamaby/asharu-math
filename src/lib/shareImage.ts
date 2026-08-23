import type { AchievementDefinition } from '../types'
import { SITE_NAME, SITE_URL } from './site'

export interface AchievementImageData {
  achievement: AchievementDefinition
  childName: string | null
  date: Date
}

const CANVAS_SIZE = 1080

function roundedRectPath(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number): void {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}

/**
 * Menggambar kartu pencapaian 1080x1080 menjadi PNG.
 * Mengembalikan null bila lingkungan tidak mendukung canvas
 * (mis. pengujian jsdom) — pemanggil wajib menyediakan fallback.
 */
export async function generateAchievementImage(data: AchievementImageData): Promise<Blob | null> {
  if (typeof document === 'undefined') return null
  const canvas = document.createElement('canvas')
  if (typeof canvas.getContext !== 'function') return null
  canvas.width = CANVAS_SIZE
  canvas.height = CANVAS_SIZE
  const ctx = canvas.getContext('2d')
  if (!ctx) return null

  const { achievement, childName, date } = data

  // Latar gradasi biru ceria + aksen gelembung
  const gradient = ctx.createLinearGradient(0, 0, CANVAS_SIZE, CANVAS_SIZE)
  gradient.addColorStop(0, '#e0f2fe')
  gradient.addColorStop(1, '#7dd3fc')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE)

  const bubbles = [
    { x: 120, y: 150, r: 70, color: 'rgba(253, 224, 71, 0.5)' },
    { x: 960, y: 110, r: 50, color: 'rgba(255, 255, 255, 0.55)' },
    { x: 1000, y: 880, r: 90, color: 'rgba(253, 224, 71, 0.35)' },
    { x: 90, y: 900, r: 55, color: 'rgba(255, 255, 255, 0.45)' },
  ]
  for (const bubble of bubbles) {
    ctx.fillStyle = bubble.color
    ctx.beginPath()
    ctx.arc(bubble.x, bubble.y, bubble.r, 0, Math.PI * 2)
    ctx.fill()
  }

  // Kartu putih
  ctx.shadowColor = 'rgba(15, 23, 42, 0.18)'
  ctx.shadowBlur = 30
  ctx.shadowOffsetY = 12
  ctx.fillStyle = '#ffffff'
  roundedRectPath(ctx, 90, 140, 900, 790, 48)
  ctx.fill()
  ctx.shadowColor = 'transparent'
  ctx.shadowBlur = 0
  ctx.shadowOffsetY = 0

  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  // Ikon achievement (emoji)
  ctx.font = '200px "Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif'
  ctx.fillStyle = '#000000'
  ctx.fillText(achievement.icon, CANVAS_SIZE / 2, 340)

  // Label kecil
  ctx.font = '800 38px "Nunito", "Segoe UI", sans-serif'
  ctx.fillStyle = '#0284c7'
  ctx.fillText('P E N C A P A I A N', CANVAS_SIZE / 2, 520)

  // Sapaan dengan nama anak
  ctx.font = '900 64px "Nunito", "Segoe UI", sans-serif'
  ctx.fillStyle = '#0f172a'
  ctx.fillText(childName ? `Hebat, ${childName}!` : 'Hebat!', CANVAS_SIZE / 2, 610)

  // Nama achievement
  ctx.font = '800 54px "Nunito", "Segoe UI", sans-serif'
  ctx.fillStyle = '#b45309'
  ctx.fillText(achievement.name, CANVAS_SIZE / 2, 700)

  // Deskripsi singkat
  ctx.font = '600 32px "Nunito", "Segoe UI", sans-serif'
  ctx.fillStyle = '#64748b'
  ctx.fillText(achievement.description, CANVAS_SIZE / 2, 770)

  // Tanggal
  const dateString = date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
  ctx.font = '700 34px "Nunito", "Segoe UI", sans-serif'
  ctx.fillStyle = '#475569'
  ctx.fillText(dateString, CANVAS_SIZE / 2, 840)

  // Footer aplikasi
  ctx.font = '800 42px "Nunito", "Segoe UI", sans-serif'
  ctx.fillStyle = '#075985'
  ctx.fillText(`${SITE_NAME}  •  ${SITE_URL.replace('https://', '')}`, CANVAS_SIZE / 2, 1020)

  return new Promise<Blob | null>((resolve) => {
    canvas.toBlob((blob) => resolve(blob), 'image/png')
  })
}
