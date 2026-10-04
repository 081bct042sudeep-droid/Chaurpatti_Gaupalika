import { createContext, useContext, useEffect, useState } from 'react'

export type Language = 'en' | 'ne'
const storageKey = 'chaurpati-language'
const LanguageContext = createContext<{ language: Language; setLanguage: (language: Language) => void } | null>(null)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => localStorage.getItem(storageKey) === 'ne' ? 'ne' : 'en')
  const setLanguage = (next: Language) => { localStorage.setItem(storageKey, next); setLanguageState(next) }
  useEffect(() => { document.documentElement.lang = language === 'en' ? 'en' : 'ne' }, [language])
  return <LanguageContext.Provider value={{ language, setLanguage }}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) throw new Error('useLanguage must be used inside LanguageProvider')
  return context
}
