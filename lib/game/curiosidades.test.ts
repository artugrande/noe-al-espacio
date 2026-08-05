import { describe, expect, it } from "vitest"
import { CURIOSIDADES, checkAchievements, pickCuriosity } from "./curiosidades"

describe("curiosidades", () => {
  it("has at least 3 curiosities", () => {
    expect(CURIOSIDADES.length).toBeGreaterThanOrEqual(3)
  })
  it("pickCuriosity returns one of the list", () => {
    expect(CURIOSIDADES).toContainEqual(pickCuriosity(0))
  })
  it("unlocks first_mate and survived_90s", () => {
    const ids = checkAchievements({
      collectedMate: true,
      gameTimeMs: 90_000,
      usedShield: false,
    })
    expect(ids).toContain("first_mate")
    expect(ids).toContain("survived_90s")
  })

  it("unlocks first_magnet when used", () => {
    const ids = checkAchievements({
      collectedMate: false,
      gameTimeMs: 1_000,
      usedShield: false,
      usedMagnet: true,
    })
    expect(ids).toContain("first_magnet")
  })
})
