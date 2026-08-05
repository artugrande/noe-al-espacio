"use client"

import type { HighScoreEntry } from "@/lib/game/types"

export function LeaderboardPanel({
  scores,
  global,
  loading,
}: {
  scores: HighScoreEntry[]
  global: boolean
  loading?: boolean
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-xl font-bold text-amber-300">🏆 Mejores puntajes</h2>
        <span className="text-xs uppercase tracking-wider text-slate-400">
          {loading ? "Cargando…" : global ? "Global" : "Este dispositivo"}
        </span>
      </div>

      {loading ? (
        <p className="mt-5 text-slate-300">Trayendo el ranking…</p>
      ) : scores.length > 0 ? (
        <ol className="mt-4 space-y-2">
          {scores.map((entry, index) => (
            <li
              key={entry.id ?? `${entry.at}-${entry.name}-${index}`}
              className="flex items-center justify-between gap-3 rounded-xl bg-black/20 px-4 py-3"
            >
              <span className="min-w-0 truncate text-slate-200">
                <span className="mr-2 text-slate-400">#{index + 1}</span>
                {entry.name}
              </span>
              <strong className="shrink-0 text-amber-200">
                {entry.score} pts
              </strong>
            </li>
          ))}
        </ol>
      ) : (
        <p className="mt-5 text-slate-300">
          ¡Sé la primera persona en entrar al ranking!
        </p>
      )}
    </div>
  )
}
