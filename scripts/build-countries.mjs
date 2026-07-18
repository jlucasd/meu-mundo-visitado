// Reconstrói src/data/countries.geo.json a partir do GeoJSON completo do
// Natural Earth 110m (baixe-o antes para /tmp/ne_110m_countries.geojson):
//   curl -sL -o /tmp/ne_110m_countries.geojson \
//     https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_0_countries.geojson
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const src = '/tmp/ne_110m_countries.geojson'
const d = JSON.parse(readFileSync(src, 'utf8'))

const CONT_PT = {
  Africa: 'África',
  Asia: 'Ásia',
  Europe: 'Europa',
  'North America': 'América do Norte',
  'South America': 'América do Sul',
  Oceania: 'Oceania',
  Antarctica: 'Antártida',
  'Seven seas (open ocean)': 'Oceania',
}

const round = (c) =>
  Array.isArray(c[0]) ? c.map(round) : [Math.round(c[0] * 100) / 100, Math.round(c[1] * 100) / 100]

const feats = d.features.map((f) => {
  const p = f.properties
  // territórios disputados (ISO_A3_EH = -99) usam o código próprio do Natural Earth
  const iso3 = p.ISO_A3_EH !== '-99' ? p.ISO_A3_EH : p.ADM0_A3
  const iso2 = p.ISO_A2_EH !== '-99' ? p.ISO_A2_EH : iso3.slice(0, 2)
  return {
    type: 'Feature',
    properties: {
      id: iso3,
      iso2,
      name: p.NAME_PT || p.NAME,
      nameEn: p.NAME,
      nameEs: p.NAME_ES || p.NAME,
      continent: CONT_PT[p.CONTINENT] || p.CONTINENT,
      lat: Math.round(p.LABEL_Y * 100) / 100,
      lng: Math.round(p.LABEL_X * 100) / 100,
    },
    geometry: { type: f.geometry.type, coordinates: round(f.geometry.coordinates) },
  }
})

const ids = feats.map((f) => f.properties.id)
const dups = ids.filter((v, i) => ids.indexOf(v) !== i)
if (dups.length) throw new Error(`ids duplicados: ${dups.join(',')}`)

const out = join(root, 'src/data/countries.geo.json')
writeFileSync(out, JSON.stringify({ type: 'FeatureCollection', features: feats }))
console.log(`OK: ${feats.length} países →`, out)
