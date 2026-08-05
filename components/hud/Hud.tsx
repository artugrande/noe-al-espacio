"use client"

import { useSyncExternalStore } from "react"
import {
  getSnapshot,
  subscribe,
} from "@/components/game/gameState"
import { GAME_DURATION_MS } from "@/lib/game/constants"
import { FloatToast } from "./FloatToast"

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
  const turbSeconds = Math.ceil(snapshot.turbulenceMs / 1000)

  return (
    <div className="pointer-events-none absolute inset-0 z-10 text-white">
      <FloatToast />
      <div className="flex items-start justify-between gap-3 p-4">
        <div className="flex flex-col gap-2">
          <div className="rounded-xl border border-white/10 bg-slate-950/70 px-4 py-2 backdrop-blur">
            <p className="text-xs uppercase tracking-wider text-slate-400">
              Puntaje
            </p>
            <p className="text-2xl font-black text-amber-300">{snapshot.score}</p>
          </div>
          {snapshot.comboCount > 1 ? (
            <div className="rounded-xl border border-fuchsia-400/40 bg-fuchsia-500/20 px-4 py-2 backdrop-blur">
              <p className="text-xs uppercase tracking-wider text-fuchsia-200">
                Combo
              </p>
              <p className="text-xl font-black text-fuchsia-100">
                x{snapshot.comboMult.toFixed(2)} · {snapshot.comboCount}
              </p>
            </div>
          ) : null}
        </div>

        <div className="rounded-xl border border-white/10 bg-slate-950/70 px-4 py-2 text-center backdrop-blur">
          <p className="text-xs uppercase tracking-wider text-slate-400">Tiempo</p>
          <p className="font-mono text-2xl font-black">
            {formatTime(remainingMs)}
          </p>
          <p className="mt-1 text-xs text-slate-300">
            Meta 🧉 {snapshot.matesCollected}/{snapshot.objectiveTarget}
            {snapshot.objectiveDone ? " ✓" : ""}
          </p>
        </div>

        <div className="flex min-w-28 flex-col gap-2">
          <div className="rounded-xl border border-sky-400/30 bg-slate-950/70 px-4 py-2 text-right backdrop-blur">
            <p className="text-xs uppercase tracking-wider text-slate-400">Escudo</p>
            <p className="text-xl font-black">
              {snapshot.hasShield ? "🛡️ Activo" : "—"}
            </p>
          </div>
          <div
            className={`rounded-xl border px-4 py-2 text-right backdrop-blur ${
              snapshot.boostRemainingMs > 0
                ? "border-amber-400/70 bg-amber-500/25 animate-pulse"
                : "border-amber-400/30 bg-slate-950/70"
            }`}
          >
            <p className="text-xs uppercase tracking-wider text-slate-400">
              Impulso
            </p>
            <p className="text-xl font-black text-amber-300">
              {snapshot.boostRemainingMs > 0
                ? `⚡ ¡RÁPIDO! ${boostSeconds}s`
                : "—"}
            </p>
          </div>
          {snapshot.turbulenceMs > 0 ? (
            <div className="rounded-xl border border-violet-400/60 bg-violet-500/25 px-4 py-2 text-right backdrop-blur animate-pulse">
              <p className="text-xs uppercase tracking-wider text-violet-200">
                Turbulencia
              </p>
              <p className="text-lg font-black text-violet-100">
                🌀 {turbSeconds}s
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
