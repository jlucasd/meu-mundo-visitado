/**
 * Adapter de persistência com a interface do `window.storage`
 * (get / set / delete / list). Se o ambiente expuser `window.storage`
 * (ex.: artifacts), usa ele; caso contrário, cai para `localStorage`
 * com valores serializados em JSON.
 */
interface StorageLike {
  get(key: string): Promise<unknown>
  set(key: string, value: unknown): Promise<void>
  delete(key: string): Promise<void>
  list(prefix: string): Promise<string[]>
}

interface WindowStorageApi {
  get(key: string): Promise<unknown>
  set(key: string, value: unknown): Promise<unknown>
  delete(key: string): Promise<unknown>
  list?(prefix?: string): Promise<unknown>
}

function getWindowStorage(): WindowStorageApi | null {
  const ws = (window as unknown as { storage?: WindowStorageApi }).storage
  if (ws && typeof ws.get === 'function' && typeof ws.set === 'function') return ws
  return null
}

function parseMaybeJson(value: unknown): unknown {
  if (typeof value !== 'string') return value
  try {
    return JSON.parse(value)
  } catch {
    return value
  }
}

const windowStorageAdapter = (ws: WindowStorageApi): StorageLike => ({
  async get(key) {
    return parseMaybeJson(await ws.get(key))
  },
  async set(key, value) {
    await ws.set(key, JSON.stringify(value))
  },
  async delete(key) {
    await ws.delete(key)
  },
  async list(prefix) {
    const res = ws.list ? await ws.list(prefix) : []
    if (Array.isArray(res)) {
      return res
        .map((k) => (typeof k === 'string' ? k : (k as { key?: string })?.key ?? ''))
        .filter((k) => k.startsWith(prefix))
    }
    return []
  },
})

const localStorageAdapter: StorageLike = {
  async get(key) {
    const raw = localStorage.getItem(key)
    return raw === null ? null : parseMaybeJson(raw)
  },
  async set(key, value) {
    localStorage.setItem(key, JSON.stringify(value))
  },
  async delete(key) {
    localStorage.removeItem(key)
  },
  async list(prefix) {
    return Object.keys(localStorage).filter((k) => k.startsWith(prefix))
  },
}

const ws = typeof window !== 'undefined' ? getWindowStorage() : null
export const storage: StorageLike = ws ? windowStorageAdapter(ws) : localStorageAdapter
