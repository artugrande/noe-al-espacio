"use client"

import { useState, type FormEvent } from "react"
import { PLAYER_NAME_MAX } from "@/lib/game/scoreValidation"
import { publishScore } from "@/lib/game/scores"
import type { HighScoreEntry } from "@/lib/game/types"
import { useT } from "@/lib/i18n/locale"
import { LeaderboardPanel } from "./LeaderboardPanel"

export function ScorePublishForm({
  score,
  align = "center",
}: {
  score: number
  align?: "center" | "left"
}) {
  const t = useT()
  const [name, setName] = useState("")
  const [scores, setScores] = useState<HighScoreEntry[]>([])
  const [global, setGlobal] = useState(false)
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">(
    "idle",
  )
  const [error, setError] = useState<string | null>(null)
  const [showBoard, setShowBoard] = useState(false)

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    if (status === "saving" || status === "saved") return
    setStatus("saving")
    setError(null)

    const result = await publishScore(name, score)
    setScores(result.scores)
    setGlobal(result.global)
    setShowBoard(true)

    if (result.error && !result.global) {
      setStatus("error")
      setError(result.error)
      return
    }
    setStatus("saved")
  }

  return (
    <div className={align === "left" ? "text-left" : "text-center"}>
      {status !== "saved" ? (
        <form onSubmit={onSubmit} className="mt-5 space-y-3">
          <label className="block text-sm text-slate-300">
            {t("publishNameLabel")}
            <input
              type="text"
              value={name}
              maxLength={PLAYER_NAME_MAX}
              autoComplete="nickname"
              placeholder={t("publishPlaceholder")}
              onChange={(event) => setName(event.target.value)}
              className="mt-2 w-full rounded-xl border border-white/15 bg-black/30 px-4 py-3 text-base text-white outline-none ring-sky-400/40 placeholder:text-slate-500 focus:ring-2"
            />
          </label>
          <button
            type="submit"
            disabled={status === "saving" || name.trim().length < 1}
            className="w-full rounded-xl border border-amber-300/40 bg-amber-400/15 px-5 py-3 font-bold text-amber-100 transition hover:bg-amber-400/25 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {status === "saving" ? t("publishing") : t("publishButton")}
          </button>
          {error ? <p className="text-sm text-rose-300">{error}</p> : null}
        </form>
      ) : (
        <p className="mt-5 text-sm font-semibold text-emerald-300">
          {global ? t("publishedGlobal") : t("publishedLocal")}
        </p>
      )}

      {showBoard ? (
        <div className="mt-5 rounded-2xl border border-white/10 bg-black/25 p-4">
          <LeaderboardPanel scores={scores} global={global} />
        </div>
      ) : null}
    </div>
  )
}
