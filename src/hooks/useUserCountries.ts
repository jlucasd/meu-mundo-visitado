import { useEffect, useRef, useState } from 'react'
import { storage } from '../lib/storage'
import { supabase } from '../lib/supabase'
import { ADMIN_EMAIL, COUNTRIES_PREFIX, type AuthUser } from '../lib/authDb'
import { useCountryStore } from '../store/useCountryStore'

interface CountriesRecord {
  visited: string[]
  wishlist: string[]
}

export type SyncStatus = 'loading' | 'cloud' | 'local'

/** chave da versão antiga do app (sem login), usada uma única vez na migração */
const LEGACY_KEY = 'meu-mundo-visitado:v1'

const keyFor = (userId: string) => `${COUNTRIES_PREFIX}${userId}`

async function cloudLoad(userId: string): Promise<CountriesRecord | null | 'error'> {
  if (!supabase) return 'error'
  const { data, error } = await supabase
    .from('user_countries')
    .select('visited, wishlist')
    .eq('user_id', userId)
    .maybeSingle()
  if (error) return 'error'
  return data ? { visited: data.visited ?? [], wishlist: data.wishlist ?? [] } : null
}

async function cloudSave(userId: string, rec: CountriesRecord): Promise<boolean> {
  if (!supabase) return false
  const { error } = await supabase.from('user_countries').upsert({
    user_id: userId,
    visited: rec.visited,
    wishlist: rec.wishlist,
    updated_at: new Date().toISOString(),
  })
  return !error
}

/**
 * Associa o mapa (visited/wishlist) ao usuário logado. Fonte principal:
 * Supabase (`user_countries`, uma linha por usuário). O storage local funciona
 * como cache e como fallback quando a nuvem está indisponível.
 */
export function useUserCountries(user: AuthUser | null): SyncStatus {
  const loadedFor = useRef<string | null>(null)
  const [status, setStatus] = useState<SyncStatus>('loading')

  // carrega o mapa do usuário ao logar (e limpa ao deslogar)
  useEffect(() => {
    if (!user) {
      loadedFor.current = null
      useCountryStore.getState().reset()
      setStatus('loading')
      return
    }
    let cancelled = false
    setStatus('loading')
    ;(async () => {
      let data: CountriesRecord | null = null
      let cloudOk = false

      const fromCloud = await cloudLoad(user.id)
      if (fromCloud !== 'error') {
        cloudOk = true
        data = fromCloud
      }
      if (!data) {
        // fallback/migração: cache local deste navegador
        data = (await storage.get(keyFor(user.id))) as CountriesRecord | null
      }
      if (!data && user.email === ADMIN_EMAIL) {
        // migração única: dados marcados antes do sistema de login viram o mapa do admin
        try {
          const raw = localStorage.getItem(LEGACY_KEY)
          if (raw) {
            const parsed = JSON.parse(raw) as {
              state?: { visited?: string[]; wishlist?: string[] }
            }
            data = {
              visited: parsed.state?.visited ?? [],
              wishlist: parsed.state?.wishlist ?? [],
            }
            localStorage.removeItem(LEGACY_KEY)
          }
        } catch {
          // dados antigos ilegíveis: segue com mapa vazio
        }
      }

      const rec = data ?? { visited: [], wishlist: [] }
      if (cloudOk && fromCloud === null) {
        // primeira vez deste usuário na nuvem: cria a linha dele (e confirma
        // que a escrita funciona — senão o status cai para "local")
        cloudOk = await cloudSave(user.id, rec)
      }
      if (cancelled) return
      useCountryStore.getState().hydrate(rec.visited, rec.wishlist)
      loadedFor.current = user.id
      setStatus(cloudOk ? 'cloud' : 'local')
    })()
    return () => {
      cancelled = true
    }
  }, [user])

  // salva alterações do usuário logado (nuvem + cache local, com debounce)
  useEffect(() => {
    if (!user) return
    let timer: ReturnType<typeof setTimeout>
    const unsub = useCountryStore.subscribe((state) => {
      if (loadedFor.current !== user.id) return
      clearTimeout(timer)
      timer = setTimeout(() => {
        const rec = { visited: state.visited, wishlist: state.wishlist }
        void storage.set(keyFor(user.id), rec)
        void cloudSave(user.id, rec).then((ok) =>
          setStatus((prev) => {
            const next = ok ? 'cloud' : 'local'
            return prev === next ? prev : next
          }),
        )
      }, 500)
    })
    return () => {
      unsub()
      clearTimeout(timer)
    }
  }, [user])

  return status
}
