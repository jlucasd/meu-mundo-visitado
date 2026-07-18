import { create } from 'zustand'
import type { CountryStatus } from '../types'
import { isCountry } from '../data/countries'

interface CountryState {
  visited: string[]
  wishlist: string[]
  toggleVisited: (id: string) => void
  toggleWishlist: (id: string) => void
  statusOf: (id: string) => CountryStatus
  /** substitui o estado inteiro (usado ao carregar o mapa do usuário logado) */
  hydrate: (visited: string[], wishlist: string[]) => void
  reset: () => void
}

// A persistência é feita por usuário logado em src/hooks/useUserCountries.ts
// (chave `mmv:countries:{userId}`), não mais de forma global.
export const useCountryStore = create<CountryState>()((set, get) => ({
  visited: [],
  wishlist: [],

  toggleVisited: (id) => {
    if (!isCountry(id)) return
    set((s) => {
      const visited = s.visited.includes(id)
        ? s.visited.filter((v) => v !== id)
        : [...s.visited, id]
      // marcar como visitado remove da wishlist
      const wishlist = visited.includes(id)
        ? s.wishlist.filter((w) => w !== id)
        : s.wishlist
      return { visited, wishlist }
    })
  },

  toggleWishlist: (id) => {
    if (!isCountry(id)) return
    set((s) => {
      if (s.visited.includes(id)) return s
      return {
        wishlist: s.wishlist.includes(id)
          ? s.wishlist.filter((w) => w !== id)
          : [...s.wishlist, id],
      }
    })
  },

  statusOf: (id) => {
    const s = get()
    if (s.visited.includes(id)) return 'visited'
    if (s.wishlist.includes(id)) return 'wishlist'
    return 'none'
  },

  hydrate: (visited, wishlist) =>
    set({
      visited: visited.filter(isCountry),
      wishlist: wishlist.filter(isCountry),
    }),

  reset: () => set({ visited: [], wishlist: [] }),
}))
