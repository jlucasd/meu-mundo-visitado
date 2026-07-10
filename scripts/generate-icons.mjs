import sharp from 'sharp'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const svg = readFileSync(join(root, 'public/icons/icon.svg'))

const targets = [
  { file: 'icon-192.png', size: 192, padding: 0 },
  { file: 'icon-512.png', size: 512, padding: 0 },
  // maskable: conteúdo dentro da "safe zone" central (~80%)
  { file: 'icon-maskable-512.png', size: 512, padding: 64 },
]

for (const { file, size, padding } of targets) {
  const inner = size - padding * 2
  let img = sharp(svg).resize(inner, inner)
  if (padding > 0) {
    img = sharp(await img.png().toBuffer()).extend({
      top: padding,
      bottom: padding,
      left: padding,
      right: padding,
      background: '#07070b',
    })
  }
  await img.png().toFile(join(root, 'public/icons', file))
  console.log('gerado:', file)
}
