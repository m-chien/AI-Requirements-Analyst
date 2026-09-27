"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import { translations } from "@/lib/i18n"

type Language = "en" | "vi"

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType>({
  language: "en",
  setLanguage: () => null,
  t: (key: string) => key,
})

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>("en")
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const savedLang = localStorage.getItem("app-lang") as Language
    if (savedLang) {
      setLanguage(savedLang)
    }
    setIsLoaded(true)
  }, [])

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang)
    localStorage.setItem("app-lang", lang)
  }

  const t = (path: string) => {
    const keys = path.split('.')
    let current: any = translations[language]
    for (const key of keys) {
      if (current[key] === undefined) {
        return path // Fallback to key path if not found
      }
      current = current[key]
    }
    return current as string
  }

  if (!isLoaded) {
    return <div className="min-h-screen bg-background" /> // Prevent hydration flicker
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export const useLanguage = () => useContext(LanguageContext)
