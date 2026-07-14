import { useMemo, useState } from 'react'
import { continents, countries } from '../data/countries'
import { useCountryStore } from '../store/useCountryStore'
import type { CountryProperties } from '../types'

interface CountryListProps {
  onFocusCountry: (country: CountryProperties) => void
}

export default function CountryList({ onFocusCountry }: CountryListProps) {
  const [search, setSearch] = useState('')
  const [continent, setContinent] = useState<string>('')

  const visited = useCountryStore((s) => s.visited)
  const wishlist = useCountryStore((s) => s.wishlist)
  const toggleVisited = useCountryStore((s) => s.toggleVisited)
  const toggleWishlist = useCountryStore((s) => s.toggleWishlist)

  const filtered = useMemo(() => {
    const q = search
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
    return countries.filter((c) => {
      if (continent && c.continent !== continent) return false
      if (!q) return true
      const name = c.name
        .toLowerCase()
        .normalize('NFD')
        .replace(/\p{Diacritic}/gu, '')
      return name.includes(q) || c.nameEn.toLowerCase().includes(q)
    })
  }, [search, continent])

  return (
    <div className="flex h-full flex-col">
      <div className="shrink-0 space-y-2 border-b border-line p-3">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar país…"
          className="w-full border border-line bg-ink px-3 py-2 font-mono text-sm text-white placeholder:text-dim focus:border-neon focus:outline-none"
        />
        <div className="flex flex-wrap gap-1">
          <button
            onClick={() => setContinent('')}
            className={`px-2 py-1 font-mono text-[10px] uppercase tracking-wider transition-colors ${
              continent === ''
                ? 'bg-neon text-ink'
                : 'border border-line text-dim hover:text-white'
            }`}
          >
            Todos
          </button>
          {continents.map((c) => (
            <button
              key={c}
              onClick={() => setContinent(continent === c ? '' : c)}
              className={`px-2 py-1 font-mono text-[10px] uppercase tracking-wider transition-colors ${
                continent === c
                  ? 'bg-neon text-ink'
                  : 'border border-line text-dim hover:text-white'
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4 pt-1 font-mono text-[10px] text-dim">
          <span className="flex items-center gap-1.5">
            <span className="flex h-4 w-4 items-center justify-center border border-neon bg-neon text-[9px] text-ink">
              ✓
            </span>
            visitado
          </span>
          <span className="flex items-center gap-1.5">
            <span className="text-base leading-none text-gold">★</span>
            quero visitar
          </span>
        </div>
      </div>

      <ul className="scrollbar-thin min-h-0 flex-1 overflow-y-auto">
        {filtered.map((c) => {
          const isVisited = visited.includes(c.id)
          const isWishlist = wishlist.includes(c.id)
          return (
            <li
              key={c.id}
              className={`flex items-center gap-2 border-b border-line/50 px-3 py-2 transition-colors hover:bg-white/5 ${
                isVisited ? 'bg-neon/5' : isWishlist ? 'bg-gold/5' : ''
              }`}
            >
              <button
                onClick={() => toggleVisited(c.id)}
                title={isVisited ? 'Desmarcar visitado' : 'Marcar como visitado'}
                aria-pressed={isVisited}
                className={`flex h-6 w-6 shrink-0 items-center justify-center border text-sm transition-all ${
                  isVisited
                    ? 'border-neon bg-neon text-ink shadow-neon'
                    : 'border-line text-transparent hover:border-neon'
                }`}
              >
                ✓
              </button>
              <button
                onClick={() => onFocusCountry(c)}
                className="min-w-0 flex-1 text-left"
                title={`Voar até ${c.name}`}
              >
                <span
                  className={`block truncate text-sm ${
                    isVisited ? 'font-bold text-neon' : isWishlist ? 'text-gold' : ''
                  }`}
                >
                  {c.name}
                </span>
                <span className="block font-mono text-[10px] uppercase tracking-wider text-dim">
                  {c.continent}
                </span>
              </button>
              <button
                onClick={() => toggleWishlist(c.id)}
                disabled={isVisited}
                title={
                  isVisited
                    ? 'Já visitado'
                    : isWishlist
                      ? 'Remover de "quero visitar"'
                      : 'Marcar como "quero visitar"'
                }
                aria-pressed={isWishlist}
                className={`flex h-7 w-7 shrink-0 items-center justify-center text-lg transition-all disabled:opacity-20 ${
                  isWishlist
                    ? 'text-gold drop-shadow-[0_0_6px_rgba(255,200,87,0.6)]'
                    : 'text-dim hover:scale-110 hover:text-gold'
                }`}
              >
                {isWishlist ? '★' : '☆'}
              </button>
            </li>
          )
        })}
        {filtered.length === 0 && (
          <li className="p-6 text-center font-mono text-sm text-dim">
            Nenhum país encontrado.
          </li>
        )}
      </ul>
    </div>
  )
}
