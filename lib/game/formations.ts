import { PLAY_X_MAX, PLAY_X_MIN } from "./constants"

export type FormationKind = "wall" | "vee" | "diagonal"

const LANE = PLAY_X_MAX - PLAY_X_MIN

export function formationPositions(
  kind: FormationKind,
  spawnY: number,
): Array<{ x: number; y: number }> {
  if (kind === "wall") {
    const columns = 6
    const gapIndex = 1 + Math.floor(Math.random() * (columns - 2))
    const out: Array<{ x: number; y: number }> = []
    for (let i = 0; i < columns; i += 1) {
      if (i === gapIndex) continue
      const t = i / (columns - 1)
      out.push({ x: PLAY_X_MIN + t * LANE, y: spawnY })
    }
    return out
  }

  if (kind === "vee") {
    const tipX = PLAY_X_MIN + 0.25 * LANE + Math.random() * 0.5 * LANE
    return [
      { x: tipX, y: spawnY },
      { x: tipX - 1.4, y: spawnY + 0.7 },
      { x: tipX + 1.4, y: spawnY + 0.7 },
      { x: tipX - 2.6, y: spawnY + 1.4 },
      { x: tipX + 2.6, y: spawnY + 1.4 },
    ].filter((p) => p.x >= PLAY_X_MIN && p.x <= PLAY_X_MAX)
  }

  // diagonal
  const fromLeft = Math.random() < 0.5
  const count = 5
  const out: Array<{ x: number; y: number }> = []
  for (let i = 0; i < count; i += 1) {
    const t = i / (count - 1)
    const x = fromLeft
      ? PLAY_X_MIN + 0.8 + t * (LANE - 1.6)
      : PLAY_X_MAX - 0.8 - t * (LANE - 1.6)
    out.push({ x, y: spawnY + i * 0.55 })
  }
  return out
}

export function randomFormation(): FormationKind {
  const roll = Math.random()
  if (roll < 0.4) return "wall"
  if (roll < 0.7) return "vee"
  return "diagonal"
}
