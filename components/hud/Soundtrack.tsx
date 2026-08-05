"use client"

import { useEffect } from "react"
import {
  initSoundtrack,
  isMuted,
  playSoundtrack,
} from "@/lib/game/audio"

/**
 * Preloads and starts the looping BGM as soon as the home (or any) screen mounts.
 * Browsers often block autoplay until the first tap/click/key — we retry then.
 */
export function Soundtrack() {
  useEffect(() => {
    initSoundtrack()

    if (!isMuted()) {
      void playSoundtrack()
    }

    const startOnGesture = () => {
      if (!isMuted()) {
        void playSoundtrack()
      }
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
