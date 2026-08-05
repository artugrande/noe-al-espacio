export type GameScreen = "loading" | "home" | "playing" | "gameOver" | "win"

export type HazardKind = "junk" | "mate" | "empanada" | "shield" | "boost"

/** Visual / behavior variant for junk hazards. */
export type JunkVariant = "normal" | "heavy" | "splitter"

export type AchievementId =
  | "first_mate"
  | "survived_90s"
  | "first_shield"
  | "first_boost"
  | "combo_x4"
  | "mate_objective"

export interface Difficulty {
  spawnChance: number
  scrollSpeed: number
}

export interface HighScoreEntry {
  score: number
  at: string // ISO date
}
