import { useMemo } from 'react'
import { geoArea } from 'd3-geo'
import {
  continents,
  countriesByContinent,
  countryFeatures,
  TOTAL_COUNTRIES,
} from '../data/countries'
import { useCountryStore } from '../store/useCountryStore'

/** área esférica (esterradianos) de cada país, calculada uma vez */
const areaById = new Map<string, number>(
  countryFeatures.map((f) => [f.properties.id, geoArea(f)]),
)
const totalLandArea = countryFeatures
  .filter((f) => f.properties.id !== 'ATA')
  .reduce((sum, f) => sum + (areaById.get(f.properties.id) ?? 0), 0)

export default function StatsPanel() {
  const visited = useCountryStore((s) => s.visited)
  const wishlist = useCountryStore((s) => s.wishlist)
  const reset = useCountryStore((s) => s.reset)

  const percent = (visited.length / TOTAL_COUNTRIES) * 100

  const landPercent = useMemo(() => {
    const visitedArea = visited.reduce((sum, id) => sum + (areaById.get(id) ?? 0), 0)
    return (visitedArea / totalLandArea) * 100
  }, [visited])

  const byContinent = useMemo(
    () =>
      continents.map((cont) => {
        const all = countriesByContinent.get(cont) ?? []
        const count = all.filter((c) => visited.includes(c.id)).length
        return { continent: cont, count, total: all.length }
      }),
    [visited],
  )

  return (
    <div className="scrollbar-thin h-full overflow-y-auto p-4">
      <div className="border border-line bg-ink/60 p-4">
        <p className="font-mono text-[10px] uppercase tracking-widest text-dim">
          Países visitados
        </p>
        <p className="mt-1 text-4xl font-bold">
          <span className="text-neon">{visited.length}</span>
          <span className="text-dim"> / {TOTAL_COUNTRIES}</span>
        </p>
        <div className="mt-3 h-2 w-full bg-line">
          <div
            className="h-full bg-neon shadow-neon transition-all duration-500"
            style={{ width: `${percent}%` }}
          />
        </div>
        <p className="mt-2 font-mono text-xs text-dim">
          <span className="text-neon">{percent.toFixed(1)}%</span> do mundo ·{' '}
          <span className="text-neon">{landPercent.toFixed(1)}%</span> da área terrestre
        </p>
      </div>

      <div className="mt-3 border border-line bg-ink/60 p-4">
        <p className="font-mono text-[10px] uppercase tracking-widest text-dim">
          Quero visitar
        </p>
        <p className="mt-1 text-2xl font-bold text-gold">{wishlist.length}</p>
      </div>

      <div className="mt-3 border border-line bg-ink/60 p-4">
        <p className="mb-3 font-mono text-[10px] uppercase tracking-widest text-dim">
          Por continente
        </p>
        <ul className="space-y-3">
          {byContinent.map(({ continent, count, total }) => (
            <li key={continent}>
              <div className="flex items-baseline justify-between">
                <span className="text-sm">{continent}</span>
                <span className="font-mono text-xs text-dim">
                  <span className={count > 0 ? 'font-bold text-neon' : ''}>{count}</span>
                  /{total}
                </span>
              </div>
              <div className="mt-1 h-1 w-full bg-line">
                <div
                  className="h-full bg-neon transition-all duration-500"
                  style={{ width: `${total > 0 ? (count / total) * 100 : 0}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      </div>

      <button
        onClick={() => {
          if (window.confirm('Apagar todos os países marcados?')) reset()
        }}
        className="mt-4 w-full border border-line px-4 py-2 font-mono text-xs uppercase tracking-wider text-dim transition-colors hover:border-red-500 hover:text-red-400"
      >
        Zerar progresso
      </button>
    </div>
  )
}
