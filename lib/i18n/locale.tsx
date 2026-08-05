"use client"

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react"
import { messages, type Locale, type MessageKey } from "./messages"

const STORAGE_KEY = "noe_locale"

let localeState: Locale = "es"
const listeners = new Set<() => void>()

function detectLocale(): Locale {
  if (typeof window === "undefined") return "es"
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY)
    if (saved === "en" || saved === "es") return saved
  } catch {
    // ignore
  }
  const nav = window.navigator.language?.toLowerCase() ?? "es"
  return nav.startsWith("en") ? "en" : "es"
}

function emit() {
  listeners.forEach((listener) => listener())
}

export function getLocale() {
  return localeState
}

export function setLocale(next: Locale) {
  localeState = next
  try {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, next)
      document.documentElement.lang = next
    }
  } catch {
    // ignore
  }
  emit()
}

export function translate(key: MessageKey, locale: Locale = localeState) {
  return messages[locale][key] ?? messages.es[key] ?? key
}

/** Non-React access (e.g. Hazards toast). */
export function t(key: MessageKey) {
  return translate(key, localeState)
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

function getSnapshot() {
  return localeState
}

function getServerSnapshot(): Locale {
  return "es"
}

export function hydrateLocale() {
  localeState = detectLocale()
  if (typeof document !== "undefined") {
    document.documentElement.lang = localeState
  }
  emit()
}

const LocaleContext = createContext<{
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: MessageKey) => string
} | null>(null)

export function LocaleProvider({ children }: { children: ReactNode }) {
  const locale = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      t: (key: MessageKey) => translate(key, locale),
    }),
    [locale],
  )

  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  )
}

export function useLocale() {
  const ctx = useContext(LocaleContext)
  if (!ctx) {
    throw new Error("useLocale must be used within LocaleProvider")
  }
  return ctx
}

export function useT() {
  return useLocale().t
}

export function useHydrateLocale() {
  return useCallback(() => {
    hydrateLocale()
  }, [])
}
