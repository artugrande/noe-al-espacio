"use client"

import { useSyncExternalStore } from "react"
import {
  getSnapshot,
  subscribe,
} from "@/components/game/gameState"
import { GAME_DURATION_MS } from "@/lib/game/constants"

function formatTime(milliseconds: number) {
  const totalSeconds = Math.max(0, Math.ceil(milliseconds / 1000))
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${seconds.toString().padStart(2, "0")}`
}

export function Hud() {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
  const remainingMs = GAME_DURATION_MS - snapshot.gameTimeMs
  const boostSeconds = Math.ceil(snapshot.boostRemainingMs / 1000)

  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-start justify-between gap-3 p-4 text-white">
      <div className="rounded-xl border border-white/10 bg-slate-950/70 px-4 py-2 backdrop-blur">
        <p className="text-xs uppercase tracking-wider text-slate-400">Puntaje</p>
        <p className="text-2xl font-black text-amber-300">{snapshot.score}</p>
      </div>
      <div className="rounded-xl border border-white/10 bg-slate-950/70 px-4 py-2 text-center backdrop-blur">
        <p className="text-xs uppercase tracking-wider text-slate-400">Tiempo</p>
        <p className="font-mono text-2xl font-black">
          {formatTime(remainingMs)}
        </p>
      </div>
      <div className="flex min-w-28 flex-col gap-2">
        <div className="rounded-xl border border-sky-400/30 bg-slate-950/70 px-4 py-2 text-right backdrop-blur">
          <p className="text-xs uppercase tracking-wider text-slate-400">Escudo</p>
          <p className="text-xl font-black">
            {snapshot.hasShield ? "🛡️ Activo" : "—"}
          </p>
        </div>
        <div className="rounded-xl border border-amber-400/30 bg-slate-950/70 px-4 py-2 text-right backdrop-blur">
          <p className="text-xs uppercase tracking-wider text-slate-400">Impulso</p>
          <p className="text-xl font-black text-amber-300">
            {snapshot.boostRemainingMs > 0 ? `⚡ ${boostSeconds}s` : "—"}
          </p>
        </div>
      </div>
    </div>
  )
}
