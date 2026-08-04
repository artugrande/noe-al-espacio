"use client"

import { useEffect, useState, useSyncExternalStore } from "react"
import { RotateCcw } from "lucide-react"
import {
  getSnapshot,
  patchSnapshot,
  subscribe,
} from "@/components/game/gameState"
import { useMobile } from "@/components/hud/useMobile"

export function OrientationWarning() {
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
          <h2 className="text-2xl font-bold text-white">
            ¡Rota tu dispositivo!
          </h2>
          <p className="text-lg text-gray-300">
            Este juego funciona mejor en modo horizontal
          </p>
          <p className="text-sm text-gray-400">
            Gira tu teléfono para continuar jugando
          </p>
        </div>

        <div className="mt-8 rounded-xl border border-blue-400/30 bg-blue-600/20 p-4">
          <p className="text-sm text-blue-200">
            📱 Activa la rotación automática en tu dispositivo
          </p>
        </div>
      </div>
    </div>
  )
}
