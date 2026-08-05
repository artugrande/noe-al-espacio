"use client"

import { useEffect, useState, useSyncExternalStore } from "react"
import { RotateCcw } from "lucide-react"
import {
  getSnapshot,
  patchSnapshot,
  subscribe,
} from "@/components/game/gameState"
import { useMobile } from "@/components/hud/useMobile"
import { useT } from "@/lib/i18n/locale"

export function OrientationWarning() {
  const t = useT()
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
  const isMobile = useMobile()
  const [isPortrait, setIsPortrait] = useState(false)
  const shouldPause =
    snapshot.screen === "playing" && isMobile && isPortrait

  useEffect(() => {
    const update = () => setIsPortrait(window.innerHeight > window.innerWidth)

    update()
    window.addEventListener("resize", update)
    window.addEventListener("orientationchange", update)

    return () => {
      window.removeEventListener("resize", update)
      window.removeEventListener("orientationchange", update)
    }
  }, [])

  useEffect(() => {
    if (snapshot.paused !== shouldPause) {
      patchSnapshot({ paused: shouldPause })
    }
  }, [shouldPause, snapshot.paused])

  if (!shouldPause) return null

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black p-8 text-white">
      <div className="space-y-6 text-center">
        <div className="animate-bounce">
          <RotateCcw size={80} className="mx-auto text-blue-400" />
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-white">{t("rotateTitle")}</h2>
          <p className="text-lg text-gray-300">{t("rotateBody")}</p>
        </div>
      </div>
    </div>
  )
}
