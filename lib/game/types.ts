export type GameScreen = "loading" | "home" | "playing" | "gameOver" | "win"

export type HazardKind = "junk" | "mate" | "empanada" | "shield"

export type AchievementId = "first_mate" | "survived_90s" | "first_shield"

export interface Difficulty {
  spawnChance: number
  scrollSpeed: number
}

export interface HighScoreEntry {
  score: number
  at: string // ISO date
}
