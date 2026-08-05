export const PLAYER_NAME_MAX = 16
export const MAX_SCORE = 1_000_000

export function sanitizePlayerName(raw: string): string | null {
  const trimmed = raw.trim().replace(/\s+/g, " ")
  if (trimmed.length < 1 || trimmed.length > PLAYER_NAME_MAX) return null
  if (!/^[\p{L}\p{N} _.\-]+$/u.test(trimmed)) return null
  return trimmed
}

export function sanitizeScore(raw: unknown): number | null {
  if (typeof raw !== "number" || !Number.isFinite(raw)) return null
  const score = Math.floor(raw)
  if (score < 0 || score > MAX_SCORE) return null
  return score
}
