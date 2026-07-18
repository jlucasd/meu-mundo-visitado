import { useCallback, useState } from 'react'
import GlobeView from './components/GlobeView'
import MapView from './components/MapView'
import CountryList from './components/CountryList'
import StatsPanel from './components/StatsPanel'
import ShareCard from './components/ShareCard'
import LoginScreen from './components/LoginScreen'
import UserAdminPanel from './components/UserAdminPanel'
import { AuthProvider, useAuth } from './auth/AuthContext'
import { LangProvider, useLang } from './i18n'
import { useUserCountries, type SyncStatus } from './hooks/useUserCountries'
import { useCountryStore } from './store/useCountryStore'
import { TOTAL_COUNTRIES } from './data/countries'
import type { ViewMode } from './types'

export interface FlyTarget {
  lat: number
  lng: number
  /** timestamp para disparar o efeito mesmo repetindo o país */
  ts: number
}

type PanelTab = 'paises' | 'stats' | 'usuarios'

export default function App() {
  return (
    <LangProvider>
      <AuthProvider>
        <Root />
      </AuthProvider>
    </LangProvider>
  )
}

function Root() {
  const { user, loading } = useAuth()
  const syncStatus = useUserCountries(user)

  if (loading) {
    return (
      <div className="starfield flex h-full items-center justify-center">
        <img src="/icons/logo.svg" alt="" className="w-48 animate-pulse opacity-70" />
      </div>
    )
  }
  // tela de login é a primeira tela: nada é acessível sem autenticação
  if (!user) return <LoginScreen />
  return <MainApp syncStatus={syncStatus} />
}

function MainApp({ syncStatus }: { syncStatus: SyncStatus }) {
  const { user, signOut } = useAuth()
  const { t } = useLang()
  const [view, setView] = useState<ViewMode>('globe')
  const [panelOpen, setPanelOpen] = useState(false)
  const [tab, setTab] = useState<PanelTab>('paises')
  const [shareOpen, setShareOpen] = useState(false)
  const [flyTarget, setFlyTarget] = useState<FlyTarget | null>(null)
  const visitedCount = useCountryStore((s) => s.visited.length)

  const isAdmin = user?.role === 'admin'
  const tabs: [PanelTab, string][] = [
    ['paises', t.tabs.countries],
    ['stats', t.tabs.stats],
    ...(isAdmin ? ([['usuarios', t.tabs.users]] as [PanelTab, string][]) : []),
  ]

  const focusCountry = useCallback((lat: number, lng: number) => {
    setFlyTarget({ lat, lng, ts: Date.now() })
  }, [])

  return (
    <div className="starfield relative h-full overflow-hidden">
      {/* área principal: globo ou mapa */}
      <main className="absolute inset-0 md:right-96">
        {view === 'globe' ? <GlobeView flyTarget={flyTarget} /> : <MapView />}
      </main>

      {/* header */}
      <header className="pointer-events-none absolute left-0 top-0 z-20 p-4 md:p-6">
        <div className="flex items-center gap-3">
          <img src="/icons/logo.svg" alt="" className="h-8 w-auto" />
          <h1 className="text-xl font-bold uppercase tracking-widest md:text-2xl">
            {t.brand.first} <span className="text-neon">{t.brand.highlight}</span>
          </h1>
        </div>
        <p className="mt-1 font-mono text-xs text-dim md:text-sm">
          {t.header.progress(
            visitedCount,
            TOTAL_COUNTRIES,
            ((visitedCount / TOTAL_COUNTRIES) * 100).toFixed(1),
          )}
        </p>
        <p className="pointer-events-auto mt-1 font-mono text-[11px] text-dim">
          {user?.email}
          {isAdmin && <span className="ml-1 text-gold">[admin]</span>} ·{' '}
          <button
            onClick={() => void signOut()}
            className="underline decoration-dotted underline-offset-2 transition-colors hover:text-red-400"
          >
            {t.header.signOut}
          </button>
        </p>
      </header>

      {/* controles */}
      <div className="absolute bottom-4 left-4 z-20 flex flex-col gap-2 md:bottom-6 md:left-6">
        <button
          onClick={() => setView((v) => (v === 'globe' ? 'map' : 'globe'))}
          className="border border-line bg-panel/90 px-4 py-2 font-mono text-xs uppercase tracking-wider text-white backdrop-blur transition-colors hover:border-neon hover:text-neon"
        >
          {view === 'globe' ? t.controls.map2d : t.controls.globe3d}
        </button>
        <button
          onClick={() => setShareOpen(true)}
          className="border border-line bg-panel/90 px-4 py-2 font-mono text-xs uppercase tracking-wider text-white backdrop-blur transition-colors hover:border-gold hover:text-gold"
        >
          {t.controls.share}
        </button>
      </div>

      {/* botão do painel (mobile) */}
      <button
        onClick={() => setPanelOpen((o) => !o)}
        className="absolute bottom-4 right-4 z-30 border border-neon bg-panel/90 px-4 py-2 font-mono text-xs uppercase tracking-wider text-neon shadow-neon backdrop-blur md:hidden"
      >
        {panelOpen ? t.controls.close : t.controls.menu}
      </button>

      {/* painel lateral */}
      <aside
        className={`absolute right-0 top-0 z-20 flex h-full w-full max-w-full flex-col border-l border-line bg-panel/95 backdrop-blur transition-transform duration-300 sm:w-96 ${
          panelOpen ? 'translate-x-0' : 'translate-x-full'
        } md:translate-x-0`}
      >
        {/* usuário logado + logout */}
        <div className="flex shrink-0 items-center justify-between gap-2 border-b border-line px-3 py-2">
          <div className="min-w-0">
            <p className="truncate font-mono text-[11px] text-white" title={user?.email}>
              {user?.email}
            </p>
            <p className="font-mono text-[10px] text-dim">
              <span
                className={`uppercase tracking-wider ${isAdmin ? 'text-gold' : ''}`}
              >
                {isAdmin ? t.roles.admin : t.roles.user}
              </span>{' '}
              · {t.sync[syncStatus]}
            </p>
          </div>
          <button
            onClick={() => void signOut()}
            className="shrink-0 border border-line px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-dim transition-colors hover:border-red-500 hover:text-red-400"
          >
            {t.header.signOut}
          </button>
        </div>

        <nav className="flex shrink-0 border-b border-line">
          {tabs.map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex-1 px-2 py-3 font-mono text-xs uppercase tracking-widest transition-colors ${
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
          {tab === 'paises' && (
            <CountryList
              onFocusCountry={(c) => {
                setView('globe')
                focusCountry(c.lat, c.lng)
                if (window.innerWidth < 768) setPanelOpen(false)
              }}
            />
          )}
          {tab === 'stats' && <StatsPanel />}
          {tab === 'usuarios' && isAdmin && <UserAdminPanel />}
        </div>
      </aside>

      {shareOpen && <ShareCard onClose={() => setShareOpen(false)} />}
    </div>
  )
}
