"use client"

import type { HighScoreEntry } from "@/lib/game/types"
import { useT } from "@/lib/i18n/locale"

export function LeaderboardPanel({
  scores,
  global,
  loading,
}: {
  scores: HighScoreEntry[]
  global: boolean
  loading?: boolean
}) {
  const t = useT()

  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-xl font-bold text-amber-300">
          {t("leaderboardTitle")}
        </h2>
        <span className="text-xs uppercase tracking-wider text-slate-400">
          {loading
            ? t("leaderboardLoading")
            : global
              ? t("leaderboardGlobal")
              : t("leaderboardLocal")}
        </span>
      </div>

      {loading ? (
        <p className="mt-5 text-slate-300">{t("leaderboardLoading")}</p>
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
        <p className="mt-5 text-slate-300">{t("leaderboardEmpty")}</p>
      )}
    </div>
  )
}
