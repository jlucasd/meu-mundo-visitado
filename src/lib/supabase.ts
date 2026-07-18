import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

/**
 * Banco na nuvem (Supabase/Postgres) para usuários e mapas por usuário.
 * Sem as variáveis de ambiente, o app cai para o armazenamento local
 * (src/lib/storage.ts) de forma transparente.
 */
export const isCloudConfigured = Boolean(url && anonKey)

export const supabase = isCloudConfigured
  ? createClient(url as string, anonKey as string, {
      auth: { persistSession: false },
    })
  : null
