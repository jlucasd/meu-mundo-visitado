import { create } from 'zustand'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

interface AuthResult {
  ok: boolean
  /** mensagem de erro (ok=false) ou informativa (ok=true, ex.: confirmar e-mail) */
  message?: string
}

interface AuthState {
  session: Session | null
  user: User | null
  status: 'loading' | 'ready'
  init: () => void
  signIn: (email: string, password: string) => Promise<AuthResult>
  signUp: (email: string, password: string) => Promise<AuthResult>
  signOut: () => Promise<void>
}

function translateError(msg: string): string {
  const m = msg.toLowerCase()
  if (m.includes('invalid login credentials')) return 'E-mail ou senha incorretos.'
  if (m.includes('user already registered') || m.includes('already been registered'))
    return 'Este e-mail já está cadastrado.'
  if (m.includes('password should be at least'))
    return 'A senha precisa ter ao menos 6 caracteres.'
  if (m.includes('unable to validate email') || m.includes('invalid email'))
    return 'E-mail inválido.'
  if (m.includes('email not confirmed')) return 'Confirme seu e-mail antes de entrar.'
  if (m.includes('rate limit')) return 'Muitas tentativas. Tente novamente em instantes.'
  return msg
}

let initialized = false

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  user: null,
  status: supabase ? 'loading' : 'ready',

  init: () => {
    if (!supabase || initialized) return
    initialized = true
    supabase.auth.getSession().then(({ data }) => {
      set({
        session: data.session,
        user: data.session?.user ?? null,
        status: 'ready',
      })
    })
    supabase.auth.onAuthStateChange((_event, session) => {
      set({ session, user: session?.user ?? null, status: 'ready' })
    })
  },

  signIn: async (email, password) => {
    if (!supabase) return { ok: false, message: 'Login indisponível.' }
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return { ok: false, message: translateError(error.message) }
    return { ok: true }
  },

  signUp: async (email, password) => {
    if (!supabase) return { ok: false, message: 'Cadastro indisponível.' }
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) return { ok: false, message: translateError(error.message) }
    // sem sessão => o Supabase exige confirmação de e-mail
    if (!data.session) {
      return {
        ok: true,
        message: 'Conta criada! Confirme pelo link enviado ao seu e-mail e depois entre.',
      }
    }
    return { ok: true }
  },

  signOut: async () => {
    if (!supabase) return
    await supabase.auth.signOut()
  },
}))
