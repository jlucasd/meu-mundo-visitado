import { useState, type FormEvent } from 'react'
import { useAuthStore } from '../store/useAuthStore'

interface AuthModalProps {
  onClose: () => void
}

export default function AuthModal({ onClose }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<{ type: 'error' | 'info'; text: string } | null>(null)

  const signIn = useAuthStore((s) => s.signIn)
  const signUp = useAuthStore((s) => s.signUp)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setMessage(null)
    const fn = mode === 'login' ? signIn : signUp
    const res = await fn(email.trim(), password)
    setBusy(false)
    if (!res.ok) {
      setMessage({ type: 'error', text: res.message ?? 'Algo deu errado.' })
      return
    }
    if (res.message) {
      setMessage({ type: 'info', text: res.message })
      return
    }
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm border border-line bg-panel p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-mono text-sm uppercase tracking-widest text-neon">
            {mode === 'login' ? 'Entrar' : 'Criar conta'}
          </h2>
          <button
            onClick={onClose}
            className="font-mono text-dim transition-colors hover:text-white"
            aria-label="Fechar"
          >
            ✕
          </button>
        </div>

        <div className="mb-4 flex border border-line">
          {(
            [
              ['login', 'Entrar'],
              ['signup', 'Criar conta'],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => {
                setMode(key)
                setMessage(null)
              }}
              className={`flex-1 py-2 font-mono text-xs uppercase tracking-wider transition-colors ${
                mode === key ? 'bg-neon text-ink' : 'text-dim hover:text-white'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <form onSubmit={submit} className="space-y-3">
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu@email.com"
            className="w-full border border-line bg-ink px-3 py-2 font-mono text-sm text-white placeholder:text-dim focus:border-neon focus:outline-none"
          />
          <input
            type="password"
            required
            minLength={6}
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="senha (mín. 6 caracteres)"
            className="w-full border border-line bg-ink px-3 py-2 font-mono text-sm text-white placeholder:text-dim focus:border-neon focus:outline-none"
          />

          {message && (
            <p
              className={`font-mono text-xs ${
                message.type === 'error' ? 'text-red-400' : 'text-gold'
              }`}
            >
              {message.text}
            </p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="w-full border border-neon bg-neon/10 px-4 py-2 font-mono text-xs uppercase tracking-wider text-neon transition-colors hover:bg-neon hover:text-ink disabled:opacity-50"
          >
            {busy ? '…' : mode === 'login' ? 'Entrar' : 'Criar conta'}
          </button>
        </form>

        <p className="mt-4 font-mono text-[10px] leading-relaxed text-dim">
          Seu mapa fica salvo na sua conta e sincroniza entre dispositivos.
        </p>
      </div>
    </div>
  )
}
