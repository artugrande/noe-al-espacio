"use client"

import { Volume2, VolumeX } from "lucide-react"
import { useEffect, useState } from "react"
import {
  isMuted as getIsMuted,
  setMuted as persistMuted,
  unlock,
} from "@/lib/game/audio"

export function MuteButton() {
  const [muted, setMuted] = useState(false)

  useEffect(() => {
    setMuted(getIsMuted())
  }, [])

  const toggleMute = () => {
    const nextMuted = !muted
    void unlock()
    persistMuted(nextMuted)
    setMuted(nextMuted)
  }

  return (
    <button
      type="button"
      aria-label={muted ? "Activar sonido" : "Silenciar sonido"}
      aria-pressed={muted}
      onClick={toggleMute}
      className="fixed right-3 top-3 z-50 rounded-full border border-white/15 bg-slate-950/70 p-3 text-white backdrop-blur transition hover:bg-slate-800/80"
      title={muted ? "Activar sonido" : "Silenciar sonido"}
    >
      {muted ? <VolumeX size={22} /> : <Volume2 size={22} />}
    </button>
  )
}
