"use client"

import { Volume2, VolumeX } from "lucide-react"
import { useEffect, useState } from "react"
import {
  isMuted as getIsMuted,
  playSoundtrack,
  setMuted as persistMuted,
  unlock,
} from "@/lib/game/audio"
import { useT } from "@/lib/i18n/locale"

export function MuteButton() {
  const t = useT()
  const [muted, setMuted] = useState(false)

  useEffect(() => {
    setMuted(getIsMuted())
  }, [])

  const toggleMute = () => {
    const nextMuted = !muted
    void unlock()
    persistMuted(nextMuted)
    setMuted(nextMuted)
    if (!nextMuted) {
      void playSoundtrack()
    }
  }

  return (
    <button
      type="button"
      aria-label={muted ? t("muteOn") : t("muteOff")}
      aria-pressed={muted}
      onClick={toggleMute}
      className="fixed right-3 top-3 z-50 rounded-full border border-white/15 bg-slate-950/70 p-3 text-white shadow-lg shadow-black/40 backdrop-blur transition hover:bg-slate-800/80"
      title={muted ? t("muteOn") : t("muteOff")}
    >
      {muted ? <VolumeX size={22} /> : <Volume2 size={22} />}
    </button>
  )
}
