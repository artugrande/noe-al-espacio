const REFERENCE_FPS = 60

export function accumulateSpawns(
  accumulator: number,
  spawnChance: number,
  dt: number,
) {
  const total = accumulator + spawnChance * REFERENCE_FPS * dt
  const count = Math.floor(total)

  return {
    count,
    remainder: total - count,
  }
}
