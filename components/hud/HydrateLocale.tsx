"use client"

import { useEffect } from "react"
import { hydrateLocale } from "@/lib/i18n/locale"

export function HydrateLocale() {
  useEffect(() => {
    hydrateLocale()
  }, [])
  return null
}
