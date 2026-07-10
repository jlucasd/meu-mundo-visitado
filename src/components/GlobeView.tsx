import { useEffect, useMemo, useRef, useState } from 'react'
import Globe, { GlobeMethods } from 'react-globe.gl'
import { countryFeatures } from '../data/countries'
import { useCountryStore } from '../store/useCountryStore'
import type { CountryFeature } from '../types'
import type { FlyTarget } from '../App'

const COLORS = {
  visited: 'rgba(0, 229, 255, 0.72)',
  visitedHover: 'rgba(0, 229, 255, 0.95)',
  wishlist: 'rgba(255, 200, 87, 0.72)',
  wishlistHover: 'rgba(255, 200, 87, 0.95)',
  none: 'rgba(140, 140, 165, 0.14)',
  noneHover: 'rgba(255, 255, 255, 0.35)',
  stroke: 'rgba(255, 255, 255, 0.22)',
  side: 'rgba(0, 229, 255, 0.05)',
}

const STATUS_LABEL = {
  visited: '<span style="color:#00e5ff">✓ visitado</span>',
  wishlist: '<span style="color:#ffc857">★ quero visitar</span>',
  none: '<span style="color:#8b8b9e">não visitado</span>',
} as const

interface GlobeViewProps {
  flyTarget: FlyTarget | null
}

export default function GlobeView({ flyTarget }: GlobeViewProps) {
  const globeRef = useRef<GlobeMethods | undefined>(undefined)
  const containerRef = useRef<HTMLDivElement>(null)
  const idleTimer = useRef<ReturnType<typeof setTimeout>>()
  const [size, setSize] = useState({ width: 0, height: 0 })
  const [hovered, setHovered] = useState<CountryFeature | null>(null)
  const [ready, setReady] = useState(false)

  const visited = useCountryStore((s) => s.visited)
  const wishlist = useCountryStore((s) => s.wishlist)
  const toggleVisited = useCountryStore((s) => s.toggleVisited)

  const visitedSet = useMemo(() => new Set(visited), [visited])
  const wishlistSet = useMemo(() => new Set(wishlist), [wishlist])

  // dimensões do container (o canvas precisa de width/height explícitos)
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      setSize({ width, height })
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  // rotação automática quando ocioso
  useEffect(() => {
    if (!ready) return
    const globe = globeRef.current
    if (!globe) return
    if (import.meta.env.DEV) {
      ;(window as unknown as { __globe?: GlobeMethods }).__globe = globe
    }
    const controls = globe.controls()
    controls.autoRotate = true
    controls.autoRotateSpeed = 0.45

    const pause = () => {
      controls.autoRotate = false
      clearTimeout(idleTimer.current)
    }
    const scheduleResume = () => {
      clearTimeout(idleTimer.current)
      idleTimer.current = setTimeout(() => {
        controls.autoRotate = true
      }, 4000)
    }
    controls.addEventListener('start', pause)
    controls.addEventListener('end', scheduleResume)
    return () => {
      controls.removeEventListener('start', pause)
      controls.removeEventListener('end', scheduleResume)
      clearTimeout(idleTimer.current)
    }
  }, [ready])

  // fly-to ao selecionar país na lista
  useEffect(() => {
    if (!flyTarget || !globeRef.current) return
    const controls = globeRef.current.controls()
    controls.autoRotate = false
    globeRef.current.pointOfView(
      { lat: flyTarget.lat, lng: flyTarget.lng, altitude: 1.6 },
      1000,
    )
    clearTimeout(idleTimer.current)
    idleTimer.current = setTimeout(() => {
      controls.autoRotate = true
    }, 6000)
  }, [flyTarget])

  const statusOf = (f: CountryFeature) =>
    visitedSet.has(f.properties.id)
      ? 'visited'
      : wishlistSet.has(f.properties.id)
        ? 'wishlist'
        : 'none'

  return (
    <div ref={containerRef} className="h-full w-full">
      {size.width > 0 && (
        <Globe
          ref={globeRef}
          width={size.width}
          height={size.height}
          backgroundColor="rgba(0,0,0,0)"
          globeImageUrl="/textures/earth-night.jpg"
          atmosphereColor="#00e5ff"
          atmosphereAltitude={0.16}
          polygonsData={countryFeatures}
          polygonAltitude={(f) => (f === hovered ? 0.05 : 0.008)}
          polygonCapColor={(f) => {
            const feature = f as CountryFeature
            const status = statusOf(feature)
            const isHovered = feature === hovered
            if (status === 'visited')
              return isHovered ? COLORS.visitedHover : COLORS.visited
            if (status === 'wishlist')
              return isHovered ? COLORS.wishlistHover : COLORS.wishlist
            return isHovered ? COLORS.noneHover : COLORS.none
          }}
          polygonSideColor={() => COLORS.side}
          polygonStrokeColor={() => COLORS.stroke}
          polygonsTransitionDuration={250}
          polygonLabel={(f) => {
            const p = (f as CountryFeature).properties
            return `
              <div style="background:#0d0d14;border:1px solid #1e1e2a;padding:6px 10px;font-family:'JetBrains Mono',monospace;font-size:12px;color:#fff;white-space:nowrap">
                <b>${p.name}</b><br/>${STATUS_LABEL[statusOf(f as CountryFeature)]}
              </div>`
          }}
          onPolygonClick={(f) => toggleVisited((f as CountryFeature).properties.id)}
          onPolygonHover={(f) => setHovered((f as CountryFeature) ?? null)}
          onGlobeReady={() => setReady(true)}
        />
      )}
    </div>
  )
}
