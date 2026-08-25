import { mkdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'

const root = process.cwd()
const outDir = path.join(root, 'public', 'icons')
const svgPath = path.join(root, 'public', 'favicon.svg')

await mkdir(outDir, { recursive: true })
const svg = await readFile(svgPath)

// Ikon reguler: render apa adanya
await sharp(svg, { density: 300 }).resize(192, 192).png().toFile(path.join(outDir, 'pwa-192.png'))
await sharp(svg, { density: 300 }).resize(512, 512).png().toFile(path.join(outDir, 'pwa-512.png'))

// Ikon maskable: kanvas sky penuh + karya diskalakan ke safe-zone (~80%)
const size = 512
const scale = 0.8
const art = Math.round(size * scale)
const offset = Math.round((size - art) / 2)
const backdrop = Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"><rect width="${size}" height="${size}" fill="#0ea5e9"/></svg>`,
)
const artwork = await sharp(svg, { density: 300 }).resize(art, art).png().toBuffer()
await sharp(backdrop)
  .composite([{ input: artwork, left: offset, top: offset }])
  .png()
  .toFile(path.join(outDir, 'pwa-maskable-512.png'))

console.log('Ikon PWA dibuat di public/icons/')
