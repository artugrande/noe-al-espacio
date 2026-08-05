// lib/game/difficulty.test.ts
import { describe, expect, it } from "vitest"
import { getDifficulty } from "./difficulty"

describe("getDifficulty", () => {
  it("starts at baseline at t=0", () => {
    const d = getDifficulty(0)
    expect(d.spawnChance).toBeCloseTo(0.04, 3)
    expect(d.scrollSpeed).toBeCloseTo(2.15, 3)
  })

  it("increases spawn and speed by mid-game", () => {
    const early = getDifficulty(0)
    const mid = getDifficulty(90_000)
    expect(mid.spawnChance).toBeGreaterThan(early.spawnChance)
    expect(mid.scrollSpeed).toBeGreaterThan(early.scrollSpeed)
  })

  it("caps at max multipliers", () => {
    const late = getDifficulty(180_000)
    const later = getDifficulty(300_000)
    expect(late.spawnChance).toBe(later.spawnChance)
    expect(late.scrollSpeed).toBe(later.scrollSpeed)
  })
})
