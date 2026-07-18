import { useState, type FormEvent } from 'react'
import { useAuth } from '../auth/AuthContext'

export default function LoginScreen() {
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !password) {
      setError('Preencha e-mail e senha.')
      return
    }
    setBusy(true)
    setError(null)
    const res = await signIn(email, password)
    setBusy(false)
    if (!res.ok) setError(res.message ?? 'Não foi possível entrar.')
  }

  return (
    <div className="starfield flex h-full items-center justify-center overflow-y-auto p-4">
      <div className="w-full max-w-sm">
        <img
          src="/icons/logo.svg"
          alt="Mapa-múndi — logo do Meu Mundo Visitado"
          className="mx-auto mb-6 w-64 drop-shadow-[0_0_24px_rgba(0,229,255,0.25)]"
        />
        <h1 className="text-center text-2xl font-bold uppercase tracking-widest">
          Meu Mundo <span className="text-neon">Visitado</span>
        </h1>
        <p className="mt-1 text-center font-mono text-xs text-dim">
          entre para marcar os países do seu mundo
        </p>

        <form
          onSubmit={submit}
          className="mt-8 space-y-3 border border-line bg-panel/90 p-5 backdrop-blur"
        >
          <label className="block">
            <span className="font-mono text-[10px] uppercase tracking-widest text-dim">
              E-mail
            </span>
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              className="mt-1 w-full border border-line bg-ink px-3 py-2 font-mono text-sm text-white placeholder:text-dim focus:border-neon focus:outline-none"
            />
          </label>
          <label className="block">
            <span className="font-mono text-[10px] uppercase tracking-widest text-dim">
              Senha
            </span>
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="mt-1 w-full border border-line bg-ink px-3 py-2 font-mono text-sm text-white placeholder:text-dim focus:border-neon focus:outline-none"
            />
          </label>

          {error && (
            <p role="alert" className="border border-red-500/40 bg-red-500/10 px-3 py-2 font-mono text-xs text-red-400">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="w-full border border-neon bg-neon/10 px-4 py-2.5 font-mono text-xs uppercase tracking-widest text-neon transition-colors hover:bg-neon hover:text-ink disabled:opacity-50"
          >
            {busy ? 'Entrando…' : 'Entrar'}
          </button>
        </form>

        <p className="mt-4 text-center font-mono text-[10px] leading-relaxed text-dim">
          Acesso restrito a usuários cadastrados.
          <br />
          Peça ao administrador para criar a sua conta.
        </p>
      </div>
    </div>
  )
}
