import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import * as authDb from '../lib/authDb'
import type { AuthResult, AuthUser, Role } from '../lib/authDb'

interface AuthContextValue {
  user: AuthUser | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<AuthResult>
  signOut: () => Promise<void>
  listUsers: () => Promise<AuthUser[]>
  createUser: (email: string, password: string, role: Role) => Promise<AuthResult>
  deleteUser: (id: string) => Promise<AuthResult>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  // seed do admin + restauração de sessão na inicialização
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      await authDb.seedAdmin()
      const sessionUser = await authDb.getSessionUser()
      if (!cancelled) {
        setUser(sessionUser)
        setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const signIn = useCallback(async (email: string, password: string) => {
    const res = await authDb.authenticate(email, password)
    if (res.ok && res.user) {
      await authDb.createSession(res.user)
      setUser(res.user)
    }
    return res
  }, [])

  const signOut = useCallback(async () => {
    await authDb.clearSession()
    setUser(null)
  }, [])

  const listUsers = useCallback(async () => {
    if (user?.role !== 'admin') return []
    return authDb.listUsers()
  }, [user])

  const createUser = useCallback(
    async (email: string, password: string, role: Role): Promise<AuthResult> => {
      if (user?.role !== 'admin') return { ok: false, error: 'auth/not-admin' }
      return authDb.createUser(email, password, role)
    },
    [user],
  )

  const deleteUser = useCallback(
    async (id: string): Promise<AuthResult> => {
      if (user?.role !== 'admin') return { ok: false, error: 'auth/not-admin' }
      if (id === user.id) return { ok: false, error: 'auth/self-delete' }
      await authDb.deleteUser(id)
      return { ok: true }
    },
    [user],
  )

  return (
    <AuthContext.Provider
      value={{ user, loading, signIn, signOut, listUsers, createUser, deleteUser }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth deve ser usado dentro de <AuthProvider>')
  return ctx
}
