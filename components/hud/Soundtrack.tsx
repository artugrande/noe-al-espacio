"use client"

import { useEffect, useState } from "react"
import {
  initSoundtrack,
  isMuted,
  isSoundtrackPlaying,
  playSoundtrack,
} from "@/lib/game/audio"

/**
 * Starts BGM ASAP. Unmuted autoplay is blocked by browsers until a gesture —
 * if that happens we show a one-tap chip (Chrome/Safari policy, not a game bug).
 */
export function Soundtrack() {
  const [needsGesture, setNeedsGesture] = useState(false)

  useEffect(() => {
    initSoundtrack()
    let cancelled = false

    const tryPlay = async () => {
      if (isMuted() || cancelled) return
      const started = await playSoundtrack()
      if (!cancelled) setNeedsGesture(!started && !isSoundtrackPlaying())
    }

    void tryPlay()

    // Retry when the tab becomes visible again (helps returning visitors).
    const onVisibility = () => {
      if (document.visibilityState === "visible") void tryPlay()
    }
    document.addEventListener("visibilitychange", onVisibility)

    const startOnGesture = () => {
      if (isMuted()) {
        setNeedsGesture(false)
        return
      }
      void playSoundtrack().then((started) => {
        if (started || isSoundtrackPlaying()) setNeedsGesture(false)
      })
    }

    const events: Array<keyof DocumentEventMap> = [
      "pointerdown",
      "touchstart",
      "keydown",
    ]
    for (const event of events) {
      document.addEventListener(event, startOnGesture, { passive: true })
    }

    return () => {
      cancelled = true
      document.removeEventListener("visibilitychange", onVisibility)
      for (const event of events) {
        document.removeEventListener(event, startOnGesture)
      }
    }
  }, [])

  if (!needsGesture || isMuted()) return null

  return (
    <button
      type="button"
      onClick={() => {
        void playSoundtrack().then((started) => {
          if (started || isSoundtrackPlaying()) setNeedsGesture(false)
        })
      }}
      className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 rounded-full border border-sky-300/40 bg-slate-950/90 px-5 py-2.5 text-sm font-semibold text-sky-100 shadow-lg shadow-black/50 backdrop-blur transition hover:border-sky-300/70 hover:bg-slate-900"
    >
      🔊 Tocá para activar la música
    </button>
  )
}
