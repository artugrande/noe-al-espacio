import { HIGH_SCORES_LIMIT } from "./constants"
import { sanitizePlayerName, sanitizeScore } from "./scoreValidation"
import type { HighScoreEntry } from "./types"
import { getRedis } from "@/lib/server/redis"

export { PLAYER_NAME_MAX, MAX_SCORE, sanitizePlayerName, sanitizeScore } from "./scoreValidation"

export const LEADERBOARD_KEY = "noe:leaderboard"
/** Keep a bit of history beyond the visible top list. */
const KEEP_ENTRIES = 100

interface StoredMember {
  id: string
  name: string
  at: string
}

function parseMember(member: unknown): StoredMember | null {
  if (typeof member !== "string") return null
  try {
    const parsed = JSON.parse(member) as StoredMember
    if (
      typeof parsed?.id !== "string" ||
      typeof parsed?.name !== "string" ||
      typeof parsed?.at !== "string"
    ) {
      return null
    }
    return parsed
  } catch {
    return null
  }
}

function normalizeZRange(
  rows: unknown,
): Array<{ member: string; score: number }> {
  if (!Array.isArray(rows) || rows.length === 0) return []

  if (
    typeof rows[0] === "object" &&
    rows[0] !== null &&
    "member" in (rows[0] as object)
  ) {
    return (rows as Array<{ member: string; score: number }>).map((row) => ({
      member: String(row.member),
      score: Number(row.score),
    }))
  }

  const out: Array<{ member: string; score: number }> = []
  for (let i = 0; i < rows.length; i += 2) {
    out.push({
      member: String(rows[i]),
      score: Number(rows[i + 1]),
    })
  }
  return out
}

export async function listGlobalScores(
  limit = HIGH_SCORES_LIMIT,
): Promise<HighScoreEntry[] | null> {
  const redis = getRedis()
  if (!redis) return null

  const rows = await redis.zrange(LEADERBOARD_KEY, 0, limit - 1, {
    rev: true,
    withScores: true,
  })

  const scores: HighScoreEntry[] = []
  for (const { member, score } of normalizeZRange(rows)) {
    const parsed = parseMember(member)
    if (!parsed) continue
    scores.push({
      id: parsed.id,
      name: parsed.name,
      score,
      at: parsed.at,
    })
  }
  return scores
}

export async function submitGlobalScore(
  name: string,
  score: number,
): Promise<HighScoreEntry[] | null> {
  const redis = getRedis()
  if (!redis) return null

  const member = JSON.stringify({
    id: crypto.randomUUID(),
    name,
    at: new Date().toISOString(),
  } satisfies StoredMember)

  await redis.zadd(LEADERBOARD_KEY, { score, member })

  const total = await redis.zcard(LEADERBOARD_KEY)
  if (total > KEEP_ENTRIES) {
    await redis.zremrangebyrank(LEADERBOARD_KEY, 0, total - KEEP_ENTRIES - 1)
  }

  return listGlobalScores()
}
