"use client"

import { useLocale } from "@/lib/i18n/locale"
import type { Locale } from "@/lib/i18n/messages"

export function LanguageToggle() {
  const { locale, setLocale, t } = useLocale()

  const pick = (next: Locale) => {
    if (next !== locale) setLocale(next)
  }

  return (
    <div className="fixed left-3 top-3 z-50 flex overflow-hidden rounded-full border border-white/15 bg-slate-950/70 text-xs font-bold backdrop-blur">
      <button
        type="button"
        onClick={() => pick("es")}
        aria-pressed={locale === "es"}
        className={`px-3 py-2 transition ${
          locale === "es"
            ? "bg-sky-500 text-white"
            : "text-slate-300 hover:bg-white/10"
        }`}
        title={t("langEs")}
      >
        ES
      </button>
      <button
        type="button"
        onClick={() => pick("en")}
        aria-pressed={locale === "en"}
        className={`px-3 py-2 transition ${
          locale === "en"
            ? "bg-sky-500 text-white"
            : "text-slate-300 hover:bg-white/10"
        }`}
        title={t("langEn")}
      >
        EN
      </button>
    </div>
  )
}
