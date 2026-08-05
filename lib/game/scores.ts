import { HIGH_SCORES_KEY, HIGH_SCORES_LIMIT } from "./constants"
import type { HighScoreEntry } from "./types"

export function loadHighScores(): HighScoreEntry[] {
  if (typeof localStorage === "undefined") return []
  try {
    const raw = localStorage.getItem(HIGH_SCORES_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as HighScoreEntry[]
    if (!Array.isArray(parsed)) return []
    return parsed.map((entry) => ({
      name: typeof entry.name === "string" && entry.name ? entry.name : "Piloto",
      score: Number(entry.score) || 0,
      at: typeof entry.at === "string" ? entry.at : new Date().toISOString(),
      id: typeof entry.id === "string" ? entry.id : undefined,
    }))
  } catch {
    return []
  }
}

/** Local fallback when Redis is unavailable. */
export function submitScore(score: number, name = "Piloto"): HighScoreEntry[] {
  const next = [
    ...loadHighScores(),
    {
      name,
      score,
      at: new Date().toISOString(),
      id: crypto.randomUUID(),
    },
  ]
    .sort((a, b) => b.score - a.score)
    .slice(0, HIGH_SCORES_LIMIT)
  if (typeof localStorage !== "undefined") {
    localStorage.setItem(HIGH_SCORES_KEY, JSON.stringify(next))
  }
  return next
}

export async function fetchLeaderboard(): Promise<{
  scores: HighScoreEntry[]
  global: boolean
}> {
  try {
    const res = await fetch("/api/scores", { cache: "no-store" })
    if (!res.ok) {
      return { scores: loadHighScores(), global: false }
    }
    const data = (await res.json()) as {
      scores?: HighScoreEntry[]
      global?: boolean
    }
    if (data.global && Array.isArray(data.scores)) {
      return { scores: data.scores, global: true }
    }
    return { scores: loadHighScores(), global: false }
  } catch {
    return { scores: loadHighScores(), global: false }
  }
}

export async function publishScore(
  name: string,
  score: number,
): Promise<{ scores: HighScoreEntry[]; global: boolean; error?: string }> {
  try {
    const res = await fetch("/api/scores", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, score }),
    })
    const data = (await res.json()) as {
      scores?: HighScoreEntry[]
      global?: boolean
      error?: string
    }
    if (!res.ok) {
      // Still keep a local copy so the player sees something.
      const local = submitScore(score, name)
      return {
        scores: local,
        global: false,
        error: data.error ?? "No se pudo publicar",
      }
    }
    return {
      scores: Array.isArray(data.scores) ? data.scores : [],
      global: Boolean(data.global),
    }
  } catch {
    return {
      scores: submitScore(score, name),
      global: false,
      error: "Sin conexión al ranking global",
    }
  }
}
