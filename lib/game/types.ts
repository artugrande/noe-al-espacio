export type GameScreen = "loading" | "home" | "playing" | "gameOver" | "win"

export type HazardKind = "junk" | "mate" | "empanada" | "shield" | "boost"

export type AchievementId =
  | "first_mate"
  | "survived_90s"
  | "first_shield"
  | "first_boost"

export interface Difficulty {
  spawnChance: number
  scrollSpeed: number
}

export interface HighScoreEntry {
  score: number
  at: string // ISO date
}
