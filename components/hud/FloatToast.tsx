"use client"

import { useEffect, useState, useSyncExternalStore } from "react"
import { getSnapshot, subscribe } from "@/components/game/gameState"

/** Floating near-miss / feedback popup over the playfield. */
export function FloatToast() {
  const toast = useSyncExternalStore(
    subscribe,
    () => getSnapshot().toast,
    () => null,
  )
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!toast) {
      setVisible(false)
      return
    }
    setVisible(true)
    const hide = window.setTimeout(() => setVisible(false), 1400)
    return () => window.clearTimeout(hide)
  }, [toast?.id])

  if (!toast || !visible) return null

  return (
    <div className="pointer-events-none absolute inset-x-0 top-[28%] z-20 flex justify-center px-4">
      <div
        key={toast.id}
        className="noe-float-toast rounded-2xl border border-amber-300/50 bg-slate-950/85 px-5 py-3 text-center shadow-lg shadow-amber-500/20 backdrop-blur"
      >
        <p className="text-lg font-black tracking-tight text-amber-200 sm:text-xl">
          {toast.message}
        </p>
      </div>
    </div>
  )
}
