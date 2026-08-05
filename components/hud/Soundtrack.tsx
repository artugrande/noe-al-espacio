"use client"

import { useEffect } from "react"
import { initSoundtrack, isMuted, playSoundtrack } from "@/lib/game/audio"

/**
 * Preloads and starts looping BGM. Unmuted autoplay may be blocked by the
 * browser until any pointer/key gesture — we retry quietly then.
 */
export function Soundtrack() {
  useEffect(() => {
    initSoundtrack()

    if (!isMuted()) {
      void playSoundtrack()
    }

    const startOnGesture = () => {
      if (!isMuted()) void playSoundtrack()
    }

    const events: Array<keyof DocumentEventMap> = [
      "pointerdown",
      "touchstart",
      "keydown",
    ]
    for (const event of events) {
      document.addEventListener(event, startOnGesture, {
        once: true,
        passive: true,
      })
    }

    return () => {
      for (const event of events) {
        document.removeEventListener(event, startOnGesture)
      }
    }
  }, [])

  return null
}
