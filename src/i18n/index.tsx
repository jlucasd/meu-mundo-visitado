import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import { LANGS, messages, type Lang, type Messages } from './messages'
import type { CountryProperties } from '../types'

const LANG_KEY = 'mmv:lang'

interface LangContextValue {
  lang: Lang
  setLang: (lang: Lang) => void
  t: Messages
  /** nome do país no idioma atual */
  countryName: (c: CountryProperties) => string
}

const LangContext = createContext<LangContextValue | null>(null)

function initialLang(): Lang {
  try {
    const saved = localStorage.getItem(LANG_KEY)
    if (saved === 'pt' || saved === 'en' || saved === 'es') return saved
  } catch {
    // storage indisponível: segue no padrão
  }
  return 'pt'
}

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(initialLang)

  useEffect(() => {
    document.documentElement.lang =
      LANGS.find((l) => l.code === lang)?.htmlLang ?? 'pt-BR'
  }, [lang])

  const setLang = useCallback((next: Lang) => {
    setLangState(next)
    try {
      localStorage.setItem(LANG_KEY, next)
    } catch {
      // sem persistência: só muda em memória
    }
  }, [])

  const countryName = useCallback(
    (c: CountryProperties) =>
      lang === 'en' ? c.nameEn : lang === 'es' ? c.nameEs : c.name,
    [lang],
  )

  return (
    <LangContext.Provider value={{ lang, setLang, t: messages[lang], countryName }}>
      {children}
    </LangContext.Provider>
  )
}

export function useLang(): LangContextValue {
  const ctx = useContext(LangContext)
  if (!ctx) throw new Error('useLang deve ser usado dentro de <LangProvider>')
  return ctx
}

export { LANGS, type Lang }
