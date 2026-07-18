import { useEffect, useRef } from 'react'
import { storage } from '../lib/storage'
import { ADMIN_EMAIL, COUNTRIES_PREFIX, type AuthUser } from '../lib/authDb'
import { useCountryStore } from '../store/useCountryStore'

interface CountriesRecord {
  visited: string[]
  wishlist: string[]
}

/** chave da versão antiga do app (sem login), usada uma única vez na migração */
const LEGACY_KEY = 'meu-mundo-visitado:v1'

const keyFor = (userId: string) => `${COUNTRIES_PREFIX}${userId}`

/**
 * Associa o mapa (visited/wishlist) ao usuário logado: carrega os dados dele
 * ao entrar e salva cada alteração (com debounce) sob `mmv:countries:{userId}`.
 */
export function useUserCountries(user: AuthUser | null) {
  const loadedFor = useRef<string | null>(null)

  // carrega o mapa do usuário ao logar (e limpa ao deslogar)
  useEffect(() => {
    if (!user) {
      loadedFor.current = null
      useCountryStore.getState().reset()
      return
    }
    let cancelled = false
    ;(async () => {
      let data = (await storage.get(keyFor(user.id))) as CountriesRecord | null
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
            await storage.set(keyFor(user.id), data)
            localStorage.removeItem(LEGACY_KEY)
          }
        } catch {
          // dados antigos ilegíveis: segue com mapa vazio
        }
      }
      if (cancelled) return
      useCountryStore.getState().hydrate(data?.visited ?? [], data?.wishlist ?? [])
      loadedFor.current = user.id
    })()
    return () => {
      cancelled = true
    }
  }, [user])

  // salva alterações do usuário logado
  useEffect(() => {
    if (!user) return
    let timer: ReturnType<typeof setTimeout>
    const unsub = useCountryStore.subscribe((state) => {
      if (loadedFor.current !== user.id) return
      clearTimeout(timer)
      timer = setTimeout(() => {
        void storage.set(keyFor(user.id), {
          visited: state.visited,
          wishlist: state.wishlist,
        })
      }, 300)
    })
    return () => {
      unsub()
      clearTimeout(timer)
    }
  }, [user])
}
