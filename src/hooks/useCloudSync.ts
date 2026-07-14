import { useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/useAuthStore'
import { useCountryStore } from '../store/useCountryStore'

export type SyncStatus = 'idle' | 'loading' | 'saving' | 'saved' | 'error'

/**
 * Mantém o estado (visited/wishlist) em sincronia com a tabela `user_countries`
 * do Supabase quando há usuário logado. Sem login (ou sem Supabase), o app
 * segue usando apenas o localStorage do próprio store.
 */
export function useCloudSync(onStatus: (s: SyncStatus) => void) {
  const user = useAuthStore((s) => s.user)
  // evita "eco": quando aplicamos dados vindos da nuvem, não reenviar
  const applyingRemote = useRef(false)
  const loadedFor = useRef<string | null>(null)

  // carrega os dados do usuário ao entrar
  useEffect(() => {
    if (!supabase || !user) {
      loadedFor.current = null
      onStatus('idle')
      return
    }
    let cancelled = false
    onStatus('loading')
    ;(async () => {
      const { data, error } = await supabase
        .from('user_countries')
        .select('visited, wishlist')
        .eq('user_id', user.id)
        .maybeSingle()
      if (cancelled) return
      if (error) {
        onStatus('error')
        return
      }
      if (data) {
        applyingRemote.current = true
        useCountryStore.getState().hydrate(data.visited ?? [], data.wishlist ?? [])
        applyingRemote.current = false
      } else {
        // primeiro acesso: cria a linha semeando com o que já estava marcado
        // localmente (migra a experiência "convidado" para a conta)
        const { visited, wishlist } = useCountryStore.getState()
        await supabase.from('user_countries').upsert({ user_id: user.id, visited, wishlist })
      }
      loadedFor.current = user.id
      onStatus('saved')
    })()
    return () => {
      cancelled = true
    }
  }, [user, onStatus])

  // envia mudanças locais para a nuvem (com debounce)
  useEffect(() => {
    if (!supabase || !user) return
    let timer: ReturnType<typeof setTimeout>
    const unsub = useCountryStore.subscribe((state) => {
      if (applyingRemote.current) return
      if (loadedFor.current !== user.id) return
      onStatus('saving')
      clearTimeout(timer)
      timer = setTimeout(async () => {
        const { error } = await supabase!.from('user_countries').upsert({
          user_id: user.id,
          visited: state.visited,
          wishlist: state.wishlist,
          updated_at: new Date().toISOString(),
        })
        onStatus(error ? 'error' : 'saved')
      }, 700)
    })
    return () => {
      unsub()
      clearTimeout(timer)
    }
  }, [user, onStatus])
}
