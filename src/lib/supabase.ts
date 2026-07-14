import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

/**
 * O app funciona sem Supabase (modo local / localStorage). O login e a
 * sincronização em nuvem só ligam quando as duas variáveis de ambiente existem.
 */
export const isSupabaseConfigured = Boolean(url && anonKey)

export const supabase = isSupabaseConfigured
  ? createClient(url as string, anonKey as string, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null

/** Linha única por usuário com os países marcados. */
export interface UserCountriesRow {
  user_id: string
  visited: string[]
  wishlist: string[]
  updated_at?: string
}
