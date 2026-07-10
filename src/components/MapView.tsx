import { useEffect, useMemo, useRef, useState } from 'react'
import { geoNaturalEarth1, geoPath, geoGraticule10 } from 'd3-geo'
import { countryFeatures } from '../data/countries'
import { useCountryStore } from '../store/useCountryStore'
import type { CountryFeature } from '../types'

const FILL = {
  visited: 'rgba(0, 229, 255, 0.8)',
  wishlist: 'rgba(255, 200, 87, 0.8)',
  none: 'rgba(140, 140, 165, 0.18)',
}

interface Tooltip {
  x: number
  y: number
  name: string
  status: string
}

export default function MapView() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState({ width: 0, height: 0 })
  const [tooltip, setTooltip] = useState<Tooltip | null>(null)

  const visited = useCountryStore((s) => s.visited)
  const wishlist = useCountryStore((s) => s.wishlist)
  const toggleVisited = useCountryStore((s) => s.toggleVisited)

  const visitedSet = useMemo(() => new Set(visited), [visited])
  const wishlistSet = useMemo(() => new Set(wishlist), [wishlist])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const observer = new ResizeObserver(([entry]) => {
      setSize({ width: entry.contentRect.width, height: entry.contentRect.height })
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const { paths, graticulePath, spherePath } = useMemo(() => {
    if (size.width === 0) return { paths: [], graticulePath: '', spherePath: '' }
    const projection = geoNaturalEarth1().fitExtent(
      [
        [16, 16],
        [size.width - 16, size.height - 16],
      ],
      { type: 'Sphere' },
    )
    const path = geoPath(projection)
    return {
      paths: countryFeatures.map((f) => ({ feature: f, d: path(f) ?? '' })),
      graticulePath: path(geoGraticule10()) ?? '',
      spherePath: path({ type: 'Sphere' }) ?? '',
    }
  }, [size])

  const statusOf = (f: CountryFeature) =>
    visitedSet.has(f.properties.id)
      ? 'visited'
      : wishlistSet.has(f.properties.id)
        ? 'wishlist'
        : 'none'

  const STATUS_TEXT = {
    visited: '✓ visitado',
    wishlist: '★ quero visitar',
    none: 'não visitado',
  } as const

  return (
    <div ref={containerRef} className="relative flex h-full w-full items-center justify-center">
      {size.width > 0 && (
        <svg width={size.width} height={size.height} role="img" aria-label="Mapa-múndi">
          <path d={spherePath} fill="rgba(13, 13, 20, 0.6)" stroke="#1e1e2a" />
          <path d={graticulePath} fill="none" stroke="rgba(255,255,255,0.05)" />
          {paths.map(({ feature, d }) => {
            const status = statusOf(feature)
            return (
              <path
                key={feature.properties.id}
                data-id={feature.properties.id}
                d={d}
                className="map-country"
                fill={FILL[status]}
                stroke="rgba(255,255,255,0.25)"
                strokeWidth={0.5}
                onClick={() => toggleVisited(feature.properties.id)}
                onMouseMove={(e) =>
                  setTooltip({
                    x: e.clientX,
                    y: e.clientY,
                    name: feature.properties.name,
                    status: STATUS_TEXT[status],
                  })
                }
                onMouseLeave={() => setTooltip(null)}
              />
            )
          })}
        </svg>
      )}
      {tooltip && (
        <div
          className="pointer-events-none fixed z-40 border border-line bg-panel px-3 py-1.5 font-mono text-xs"
          style={{ left: tooltip.x + 12, top: tooltip.y + 12 }}
        >
          <b>{tooltip.name}</b>
          <span className="ml-2 text-dim">{tooltip.status}</span>
        </div>
      )}
    </div>
  )
}
