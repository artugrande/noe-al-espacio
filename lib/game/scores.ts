import { HIGH_SCORES_KEY, HIGH_SCORES_LIMIT } from "./constants"
import type { HighScoreEntry } from "./types"

export function loadHighScores(): HighScoreEntry[] {
  if (typeof localStorage === "undefined") return []
  try {
    const raw = localStorage.getItem(HIGH_SCORES_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as HighScoreEntry[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function submitScore(score: number): HighScoreEntry[] {
  const next = [
    ...loadHighScores(),
    { score, at: new Date().toISOString() },
  ]
    .sort((a, b) => b.score - a.score)
    .slice(0, HIGH_SCORES_LIMIT)
  if (typeof localStorage !== "undefined") {
    localStorage.setItem(HIGH_SCORES_KEY, JSON.stringify(next))
  }
  return next
}
