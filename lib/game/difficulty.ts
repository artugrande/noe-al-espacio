import {
  BASE_SCROLL_SPEED,
  BASE_SPAWN_CHANCE,
  GAME_DURATION_MS,
  MAX_SCROLL_SPEED,
  MAX_SPAWN_CHANCE,
} from "./constants"
import type { Difficulty } from "./types"

/** Linear ramp from t=0 → GAME_DURATION_MS, then clamp. */
export function getDifficulty(gameTimeMs: number): Difficulty {
  const t = Math.min(Math.max(gameTimeMs, 0) / GAME_DURATION_MS, 1)
  return {
    spawnChance:
      BASE_SPAWN_CHANCE + (MAX_SPAWN_CHANCE - BASE_SPAWN_CHANCE) * t,
    scrollSpeed:
      BASE_SCROLL_SPEED + (MAX_SCROLL_SPEED - BASE_SCROLL_SPEED) * t,
  }
}
