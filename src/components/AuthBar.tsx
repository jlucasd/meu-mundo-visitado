import { useState } from 'react'
import { isSupabaseConfigured } from '../lib/supabase'
import { useAuthStore } from '../store/useAuthStore'
import AuthModal from './AuthModal'
import type { SyncStatus } from '../hooks/useCloudSync'

const SYNC_LABEL: Record<SyncStatus, string> = {
  idle: '',
  loading: 'carregando…',
  saving: 'salvando…',
  saved: '✓ sincronizado',
  error: '⚠ erro ao salvar',
}

export default function AuthBar({ syncStatus }: { syncStatus: SyncStatus }) {
  const [modalOpen, setModalOpen] = useState(false)
  const user = useAuthStore((s) => s.user)
  const status = useAuthStore((s) => s.status)
  const signOut = useAuthStore((s) => s.signOut)

  // sem Supabase configurado: modo local
  if (!isSupabaseConfigured) {
    return (
      <div className="shrink-0 border-b border-line px-3 py-2 font-mono text-[10px] text-dim">
        modo local · dados salvos só neste navegador
      </div>
    )
  }

  if (status === 'loading') {
    return (
      <div className="shrink-0 border-b border-line px-3 py-2 font-mono text-[10px] text-dim">
        conectando…
      </div>
    )
  }

  if (!user) {
    return (
      <>
        <div className="flex shrink-0 items-center justify-between border-b border-line px-3 py-2">
          <span className="font-mono text-[10px] text-dim">visitante · não sincronizado</span>
          <button
            onClick={() => setModalOpen(true)}
            className="border border-neon px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-neon transition-colors hover:bg-neon hover:text-ink"
          >
            Entrar
          </button>
        </div>
        {modalOpen && <AuthModal onClose={() => setModalOpen(false)} />}
      </>
    )
  }

  return (
    <div className="flex shrink-0 items-center justify-between gap-2 border-b border-line px-3 py-2">
      <div className="min-w-0">
        <p className="truncate font-mono text-[11px] text-white" title={user.email ?? ''}>
          {user.email}
        </p>
        <p
          className={`font-mono text-[10px] ${
            syncStatus === 'error' ? 'text-red-400' : 'text-dim'
          }`}
        >
          {SYNC_LABEL[syncStatus] || 'conectado'}
        </p>
      </div>
      <button
        onClick={() => void signOut()}
        className="shrink-0 border border-line px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-dim transition-colors hover:border-red-500 hover:text-red-400"
      >
        Sair
      </button>
    </div>
  )
}
