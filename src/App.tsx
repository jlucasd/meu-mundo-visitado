import { useCallback, useEffect, useState } from 'react'
import GlobeView from './components/GlobeView'
import MapView from './components/MapView'
import CountryList from './components/CountryList'
import StatsPanel from './components/StatsPanel'
import ShareCard from './components/ShareCard'
import AuthBar from './components/AuthBar'
import { useCountryStore } from './store/useCountryStore'
import { useAuthStore } from './store/useAuthStore'
import { useCloudSync, type SyncStatus } from './hooks/useCloudSync'
import { TOTAL_COUNTRIES } from './data/countries'
import type { ViewMode } from './types'

export interface FlyTarget {
  lat: number
  lng: number
  /** timestamp para disparar o efeito mesmo repetindo o país */
  ts: number
}

type PanelTab = 'paises' | 'stats'

export default function App() {
  const [view, setView] = useState<ViewMode>('globe')
  const [panelOpen, setPanelOpen] = useState(false)
  const [tab, setTab] = useState<PanelTab>('paises')
  const [shareOpen, setShareOpen] = useState(false)
  const [flyTarget, setFlyTarget] = useState<FlyTarget | null>(null)
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle')
  const visitedCount = useCountryStore((s) => s.visited.length)
  const initAuth = useAuthStore((s) => s.init)

  useEffect(() => {
    initAuth()
  }, [initAuth])

  useCloudSync(setSyncStatus)

  const focusCountry = useCallback((lat: number, lng: number) => {
    setFlyTarget({ lat, lng, ts: Date.now() })
  }, [])

  return (
    <div className="relative h-full overflow-hidden starfield">
      {/* área principal: globo ou mapa */}
      <main className="absolute inset-0 md:right-96">
        {view === 'globe' ? <GlobeView flyTarget={flyTarget} /> : <MapView />}
      </main>

      {/* header */}
      <header className="pointer-events-none absolute left-0 top-0 z-20 p-4 md:p-6">
        <h1 className="text-xl font-bold uppercase tracking-widest md:text-2xl">
          Meu Mundo <span className="text-neon">Visitado</span>
        </h1>
        <p className="mt-1 font-mono text-xs text-dim md:text-sm">
          <span className="font-bold text-neon">{visitedCount}</span> / {TOTAL_COUNTRIES}{' '}
          países · {((visitedCount / TOTAL_COUNTRIES) * 100).toFixed(1)}% do mundo
        </p>
      </header>

      {/* controles */}
      <div className="absolute bottom-4 left-4 z-20 flex flex-col gap-2 md:bottom-6 md:left-6">
        <button
          onClick={() => setView((v) => (v === 'globe' ? 'map' : 'globe'))}
          className="border border-line bg-panel/90 px-4 py-2 font-mono text-xs uppercase tracking-wider text-white backdrop-blur transition-colors hover:border-neon hover:text-neon"
        >
          {view === 'globe' ? '🗺 Mapa 2D' : '🌐 Globo 3D'}
        </button>
        <button
          onClick={() => setShareOpen(true)}
          className="border border-line bg-panel/90 px-4 py-2 font-mono text-xs uppercase tracking-wider text-white backdrop-blur transition-colors hover:border-gold hover:text-gold"
        >
          ↗ Compartilhar
        </button>
      </div>

      {/* botão do painel (mobile) */}
      <button
        onClick={() => setPanelOpen((o) => !o)}
        className="absolute bottom-4 right-4 z-30 border border-neon bg-panel/90 px-4 py-2 font-mono text-xs uppercase tracking-wider text-neon shadow-neon backdrop-blur md:hidden"
      >
        {panelOpen ? '✕ Fechar' : '☰ Países'}
      </button>

      {/* painel lateral */}
      <aside
        className={`absolute right-0 top-0 z-20 flex h-full w-full max-w-full flex-col border-l border-line bg-panel/95 backdrop-blur transition-transform duration-300 sm:w-96 ${
          panelOpen ? 'translate-x-0' : 'translate-x-full'
        } md:translate-x-0`}
      >
        <AuthBar syncStatus={syncStatus} />
        <nav className="flex shrink-0 border-b border-line">
          {(
            [
              ['paises', 'Países'],
              ['stats', 'Estatísticas'],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex-1 px-4 py-3 font-mono text-xs uppercase tracking-widest transition-colors ${
                tab === key
                  ? 'border-b-2 border-neon text-neon'
                  : 'text-dim hover:text-white'
              }`}
            >
              {label}
            </button>
          ))}
        </nav>
        <div className="min-h-0 flex-1">
          {tab === 'paises' ? (
            <CountryList
              onFocusCountry={(c) => {
                setView('globe')
                focusCountry(c.lat, c.lng)
                if (window.innerWidth < 768) setPanelOpen(false)
              }}
            />
          ) : (
            <StatsPanel />
          )}
        </div>
      </aside>

      {shareOpen && <ShareCard onClose={() => setShareOpen(false)} />}
    </div>
  )
}
