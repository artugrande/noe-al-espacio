import { HIGH_SCORES_LIMIT } from "./constants"
import type { HighScoreEntry } from "./types"
import {
  createServiceClient,
  isSupabaseConfigured,
} from "@/lib/supabase/admin"

export {
  PLAYER_NAME_MAX,
  MAX_SCORE,
  sanitizePlayerName,
  sanitizeScore,
} from "./scoreValidation"

export async function listGlobalScores(
  limit = HIGH_SCORES_LIMIT,
): Promise<HighScoreEntry[] | null> {
  if (!isSupabaseConfigured()) return null
  const supabase = createServiceClient()
  if (!supabase) return null

  const { data, error } = await supabase
    .from("leaderboard")
    .select("id, name, score, created_at")
    .order("score", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(limit)

  if (error) throw error

  return (data ?? []).map((row) => ({
    id: row.id as string,
    name: row.name as string,
    score: Number(row.score),
    at: row.created_at as string,
  }))
}

export async function submitGlobalScore(
  name: string,
  score: number,
): Promise<HighScoreEntry[] | null> {
  if (!isSupabaseConfigured()) return null
  const supabase = createServiceClient()
  if (!supabase) return null

  const { error } = await supabase.from("leaderboard").insert({ name, score })
  if (error) throw error

  return listGlobalScores()
}
