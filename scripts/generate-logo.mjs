// Gera a logo (logo.svg) e o ícone PWA (icon.svg) a partir do mapa-múndi
// real do app (src/data/countries.geo.json), projetado com d3-geo.
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { geoNaturalEarth1, geoPath } from 'd3-geo'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const geo = JSON.parse(readFileSync(join(root, 'src/data/countries.geo.json'), 'utf8'))

const W = 480
const H = 240
const projection = geoNaturalEarth1().fitExtent(
  [
    [8, 8],
    [W - 8, H - 8],
  ],
  { type: 'Sphere' },
)
const path = geoPath(projection)

const sphere = path({ type: 'Sphere' })
const land = geo.features
  .map((f) => path(f))
  .filter(Boolean)
  .join('')

// estrela dourada sobre o Brasil
const bra = geo.features.find((f) => f.properties.id === 'BRA').properties
const [sx, sy] = projection([bra.lng, bra.lat])
function starPath(cx, cy, r) {
  let d = ''
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5
    const rr = i % 2 ? r * 0.45 : r
    d += `${i ? 'L' : 'M'}${(cx + rr * Math.cos(a)).toFixed(1)},${(cy + rr * Math.sin(a)).toFixed(1)}`
  }
  return d + 'Z'
}
const star = starPath(sx, sy, 14)

const mark = `
  <path d="${sphere}" fill="#0d0d14" stroke="#1e1e2a" stroke-width="2"/>
  <path d="${land}" fill="#00e5ff" opacity="0.3" filter="url(#glow)"/>
  <path d="${land}" fill="#00e5ff" opacity="0.9"/>
  <path d="${star}" fill="#ffc857"/>`

const defs = `<defs><filter id="glow" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="5"/></filter></defs>`

writeFileSync(
  join(root, 'public/icons/logo.svg'),
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}">${defs}${mark}</svg>\n`,
)

// ícone quadrado (PWA): mapa centralizado sobre fundo escuro
writeFileSync(
  join(root, 'public/icons/icon.svg'),
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">${defs}
  <rect width="512" height="512" fill="#07070b"/>
  <g transform="translate(16,136)">${mark}</g>
</svg>\n`,
)

console.log('gerados: logo.svg, icon.svg')
