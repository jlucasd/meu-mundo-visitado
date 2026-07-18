import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { useAuth } from '../auth/AuthContext'
import type { AuthUser, Role } from '../lib/authDb'

export default function UserAdminPanel() {
  const { user: me, listUsers, createUser, deleteUser } = useAuth()
  const [users, setUsers] = useState<AuthUser[]>([])
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<Role>('user')
  const [busy, setBusy] = useState(false)
  const [feedback, setFeedback] = useState<{ type: 'error' | 'ok'; text: string } | null>(
    null,
  )

  const refresh = useCallback(async () => {
    setUsers(await listUsers())
  }, [listUsers])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !password) {
      setFeedback({ type: 'error', text: 'Preencha e-mail e senha.' })
      return
    }
    setBusy(true)
    setFeedback(null)
    const res = await createUser(email, password, role)
    setBusy(false)
    if (!res.ok) {
      setFeedback({ type: 'error', text: res.message ?? 'Erro ao criar usuário.' })
      return
    }
    setFeedback({ type: 'ok', text: `Usuário ${res.user?.email} criado.` })
    setEmail('')
    setPassword('')
    setRole('user')
    await refresh()
  }

  const remove = async (u: AuthUser) => {
    if (!window.confirm(`Excluir o usuário ${u.email}? O mapa dele será apagado.`)) return
    const res = await deleteUser(u.id)
    if (!res.ok) {
      setFeedback({ type: 'error', text: res.message ?? 'Erro ao excluir usuário.' })
      return
    }
    setFeedback({ type: 'ok', text: `Usuário ${u.email} excluído.` })
    await refresh()
  }

  return (
    <div className="scrollbar-thin h-full overflow-y-auto p-4">
      <div className="border border-line bg-ink/60 p-4">
        <p className="mb-3 font-mono text-[10px] uppercase tracking-widest text-dim">
          Novo usuário
        </p>
        <form onSubmit={submit} className="space-y-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@exemplo.com"
            className="w-full border border-line bg-ink px-3 py-2 font-mono text-sm text-white placeholder:text-dim focus:border-neon focus:outline-none"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="senha (mín. 6 caracteres)"
            autoComplete="new-password"
            className="w-full border border-line bg-ink px-3 py-2 font-mono text-sm text-white placeholder:text-dim focus:border-neon focus:outline-none"
          />
          <div className="flex gap-2">
            {(
              [
                ['user', 'Usuário'],
                ['admin', 'Admin'],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setRole(value)}
                aria-pressed={role === value}
                className={`flex-1 px-2 py-1.5 font-mono text-[10px] uppercase tracking-wider transition-colors ${
                  role === value
                    ? 'bg-neon text-ink'
                    : 'border border-line text-dim hover:text-white'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <button
            type="submit"
            disabled={busy}
            className="w-full border border-neon px-4 py-2 font-mono text-xs uppercase tracking-wider text-neon transition-colors hover:bg-neon hover:text-ink disabled:opacity-50"
          >
            {busy ? 'Criando…' : '+ Criar usuário'}
          </button>
        </form>
        {feedback && (
          <p
            className={`mt-2 font-mono text-xs ${
              feedback.type === 'error' ? 'text-red-400' : 'text-neon'
            }`}
          >
            {feedback.text}
          </p>
        )}
      </div>

      <div className="mt-3 border border-line bg-ink/60 p-4">
        <p className="mb-3 font-mono text-[10px] uppercase tracking-widest text-dim">
          Usuários cadastrados ({users.length})
        </p>
        <ul className="space-y-2">
          {users.map((u) => (
            <li
              key={u.id}
              className="flex items-center justify-between gap-2 border border-line/50 px-3 py-2"
            >
              <div className="min-w-0">
                <p className="truncate font-mono text-xs text-white" title={u.email}>
                  {u.email}
                  {u.id === me?.id && <span className="ml-1 text-dim">(você)</span>}
                </p>
                <span
                  className={`font-mono text-[10px] uppercase tracking-wider ${
                    u.role === 'admin' ? 'text-gold' : 'text-dim'
                  }`}
                >
                  {u.role}
                </span>
              </div>
              <button
                onClick={() => void remove(u)}
                disabled={u.id === me?.id}
                title={
                  u.id === me?.id
                    ? 'Não é possível excluir o próprio usuário'
                    : `Excluir ${u.email}`
                }
                className="shrink-0 border border-line px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-dim transition-colors hover:border-red-500 hover:text-red-400 disabled:opacity-30 disabled:hover:border-line disabled:hover:text-dim"
              >
                Excluir
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
