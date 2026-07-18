import { storage } from './storage'
import { supabase } from './supabase'
import type { AuthErrorKey } from '../i18n/messages'

export type Role = 'admin' | 'user'

export interface AuthUser {
  id: string
  email: string
  role: Role
  createdAt: string
}

interface StoredUser extends AuthUser {
  passwordHash: string
  salt: string
  iterations: number
}

interface SessionRecord {
  userId: string
  token: string
  createdAt: string
}

interface UserRow {
  id: string
  email: string
  role: Role
  password_hash: string
  salt: string
  iterations: number
  created_at: string
}

const USER_PREFIX = 'mmv:user:'
const SESSION_KEY = 'mmv:session'
export const COUNTRIES_PREFIX = 'mmv:countries:'

export const ADMIN_EMAIL = 'jlucasd01@gmail.com'
/**
 * Senha inicial do admin (seed). Troque criando um novo usuário admin no
 * painel "Usuários" e apagando este. Atenção: como o login roda no cliente,
 * esta constante é visível no bundle — a autenticação aqui protege a UX e
 * organiza dados por usuário, não é segurança de servidor.
 */
export const ADMIN_SEED_PASSWORD = 'MeuMundo@Admin2026'

const PBKDF2_ITERATIONS = 150_000
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function toBase64(buf: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(buf)))
}

function fromBase64(b64: string): Uint8Array {
  return Uint8Array.from(atob(b64), (c) => c.charCodeAt(0))
}

/** PBKDF2-SHA-256 via Web Crypto — nunca armazenamos senha em texto plano. */
async function hashPassword(
  password: string,
  saltB64: string,
  iterations: number,
): Promise<string> {
  const enc = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    'PBKDF2',
    false,
    ['deriveBits'],
  )
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: fromBase64(saltB64) as BufferSource, iterations, hash: 'SHA-256' },
    key,
    256,
  )
  return toBase64(bits)
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

function toPublic(u: StoredUser): AuthUser {
  return { id: u.id, email: u.email, role: u.role, createdAt: u.createdAt }
}

function rowToUser(r: UserRow): StoredUser {
  return {
    id: r.id,
    email: r.email,
    role: r.role,
    createdAt: r.created_at,
    passwordHash: r.password_hash,
    salt: r.salt,
    iterations: r.iterations,
  }
}

function userToRow(u: StoredUser): UserRow {
  return {
    id: u.id,
    email: u.email,
    role: u.role,
    created_at: u.createdAt,
    password_hash: u.passwordHash,
    salt: u.salt,
    iterations: u.iterations,
  }
}

// ---------------------------------------------------------------------------
// Repositório de usuários: Supabase primeiro; se indisponível (offline, tabela
// ausente, sem env vars), cai para o armazenamento local deste navegador.
// ---------------------------------------------------------------------------

async function localListUsers(): Promise<StoredUser[]> {
  const keys = await storage.list(USER_PREFIX)
  const users = await Promise.all(keys.map((k) => storage.get(k)))
  return users.filter((u): u is StoredUser => Boolean(u && (u as StoredUser).id))
}

/** Retorna os usuários e a origem consultada ('cloud' | 'local'). */
async function listAllUsers(): Promise<{ users: StoredUser[]; source: 'cloud' | 'local' }> {
  if (supabase) {
    const { data, error } = await supabase.from('app_users').select('*')
    if (!error && data) return { users: (data as UserRow[]).map(rowToUser), source: 'cloud' }
  }
  return { users: await localListUsers(), source: 'local' }
}

async function findByEmail(email: string): Promise<StoredUser | null> {
  const normalized = normalizeEmail(email)
  if (supabase) {
    const { data, error } = await supabase
      .from('app_users')
      .select('*')
      .eq('email', normalized)
      .maybeSingle()
    if (!error) return data ? rowToUser(data as UserRow) : null
  }
  const users = await localListUsers()
  return users.find((u) => u.email === normalized) ?? null
}

async function findById(id: string): Promise<StoredUser | null> {
  if (supabase) {
    const { data, error } = await supabase
      .from('app_users')
      .select('*')
      .eq('id', id)
      .maybeSingle()
    if (!error) return data ? rowToUser(data as UserRow) : null
  }
  return ((await storage.get(`${USER_PREFIX}${id}`)) as StoredUser | null) ?? null
}

export interface AuthResult {
  ok: boolean
  error?: AuthErrorKey
  user?: AuthUser
}

export async function createUser(
  email: string,
  password: string,
  role: Role,
): Promise<AuthResult> {
  const normalized = normalizeEmail(email)
  if (!EMAIL_RE.test(normalized)) return { ok: false, error: 'auth/invalid-email' }
  if (password.length < 6) return { ok: false, error: 'auth/weak-password' }
  if (await findByEmail(normalized)) return { ok: false, error: 'auth/email-taken' }

  const salt = toBase64(crypto.getRandomValues(new Uint8Array(16)).buffer)
  const user: StoredUser = {
    id: crypto.randomUUID(),
    email: normalized,
    role,
    createdAt: new Date().toISOString(),
    salt,
    iterations: PBKDF2_ITERATIONS,
    passwordHash: await hashPassword(password, salt, PBKDF2_ITERATIONS),
  }

  if (supabase) {
    const { error } = await supabase.from('app_users').insert(userToRow(user))
    if (!error) return { ok: true, user: toPublic(user) }
    // corrida de e-mail duplicado entre dispositivos
    if (error.code === '23505') return { ok: false, error: 'auth/email-taken' }
    // outra falha (tabela ausente, offline): registra localmente
  }
  await storage.set(`${USER_PREFIX}${user.id}`, user)
  return { ok: true, user: toPublic(user) }
}

let seedPromise: Promise<void> | null = null

/** Cria o admin padrão na primeira inicialização (idempotente). */
export function seedAdmin(): Promise<void> {
  // promise única: evita corrida de seeds em montagens duplicadas (StrictMode)
  seedPromise ??= (async () => {
    if (await findByEmail(ADMIN_EMAIL)) return
    await createUser(ADMIN_EMAIL, ADMIN_SEED_PASSWORD, 'admin')
  })()
  return seedPromise
}

export async function authenticate(
  email: string,
  password: string,
): Promise<AuthResult> {
  const user = await findByEmail(email)
  if (!user) return { ok: false, error: 'auth/invalid-credentials' }
  const hash = await hashPassword(password, user.salt, user.iterations)
  if (hash !== user.passwordHash) return { ok: false, error: 'auth/invalid-credentials' }
  return { ok: true, user: toPublic(user) }
}

export async function listUsers(): Promise<AuthUser[]> {
  const { users } = await listAllUsers()
  return users.map(toPublic).sort((a, b) => a.email.localeCompare(b.email))
}

/** Remove o usuário e o mapa de países associado a ele (nuvem e local). */
export async function deleteUser(id: string): Promise<void> {
  if (supabase) {
    // o cascade da FK apaga também a linha em user_countries
    await supabase.from('app_users').delete().eq('id', id)
  }
  await storage.delete(`${USER_PREFIX}${id}`)
  await storage.delete(`${COUNTRIES_PREFIX}${id}`)
}

export async function createSession(user: AuthUser): Promise<void> {
  const session: SessionRecord = {
    userId: user.id,
    token: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  }
  await storage.set(SESSION_KEY, session)
}

/** Valida a sessão persistida: precisa apontar para um usuário existente. */
export async function getSessionUser(): Promise<AuthUser | null> {
  const session = (await storage.get(SESSION_KEY)) as SessionRecord | null
  if (!session?.userId || !session.token) return null
  const stored = await findById(session.userId)
  if (!stored) {
    await storage.delete(SESSION_KEY)
    return null
  }
  return toPublic(stored)
}

export async function clearSession(): Promise<void> {
  await storage.delete(SESSION_KEY)
}
