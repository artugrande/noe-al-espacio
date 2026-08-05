import { describe, expect, it } from "vitest"
import { formationPositions } from "./formations"
import { PLAY_X_MAX, PLAY_X_MIN } from "./constants"

describe("formations", () => {
  it("wall leaves a gap (fewer than full columns)", () => {
    const points = formationPositions("wall", 5)
    expect(points.length).toBe(5)
    for (const p of points) {
      expect(p.x).toBeGreaterThanOrEqual(PLAY_X_MIN)
      expect(p.x).toBeLessThanOrEqual(PLAY_X_MAX)
    }
  })

  it("vee returns several points", () => {
    expect(formationPositions("vee", 5).length).toBeGreaterThanOrEqual(3)
  })

  it("diagonal returns 5 steps", () => {
    expect(formationPositions("diagonal", 5)).toHaveLength(5)
  })
})
