"use client"

import { useSyncExternalStore } from "react"
import { ChevronLeft, ChevronRight, Rocket } from "lucide-react"
import { getSnapshot, subscribe } from "@/components/game/gameState"
import { input } from "@/components/game/input"
import { useMobile } from "@/components/hud/useMobile"

export function MobileControls() {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
  const isMobile = useMobile()

  if (!isMobile || snapshot.screen !== "playing") return null

  return (
    <div className="fixed bottom-4 left-0 right-0 z-50 flex items-end justify-between px-4">
      <div className="flex gap-4">
        <button
          type="button"
          aria-label="Mover a la izquierda"
          onTouchStart={(event) => {
            event.preventDefault()
            input.setLeft(true)
          }}
          onTouchEnd={(event) => {
            event.preventDefault()
            input.setLeft(false)
          }}
          onTouchCancel={() => input.setLeft(false)}
          className="glass-button select-none rounded-full p-4 text-2xl text-white transition-all duration-200 active:scale-95"
          style={{ touchAction: "none" }}
        >
          <ChevronLeft size={32} />
        </button>

        <button
          type="button"
          aria-label="Mover a la derecha"
          onTouchStart={(event) => {
            event.preventDefault()
            input.setRight(true)
          }}
          onTouchEnd={(event) => {
            event.preventDefault()
            input.setRight(false)
          }}
          onTouchCancel={() => input.setRight(false)}
          className="glass-button select-none rounded-full p-4 text-2xl text-white transition-all duration-200 active:scale-95"
          style={{ touchAction: "none" }}
        >
          <ChevronRight size={32} />
        </button>
      </div>

      {!snapshot.launched ? (
        <button
          type="button"
          aria-label="Despegar"
          onTouchStart={(event) => {
            event.preventDefault()
            input.pressLaunch()
          }}
          className="glass-button animate-pulse select-none rounded-full bg-gradient-to-r from-blue-600 to-purple-600 p-4 text-2xl text-white transition-all duration-200 active:scale-95"
          style={{ touchAction: "none" }}
        >
          <Rocket size={32} />
        </button>
      ) : null}
    </div>
  )
}
