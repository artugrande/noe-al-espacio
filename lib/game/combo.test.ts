import { describe, expect, it } from "vitest"
import { comboMultiplier, scoreWithCombo } from "./combo"

describe("combo", () => {
  it("starts at 1x", () => {
    expect(comboMultiplier(0)).toBe(1)
    expect(comboMultiplier(1)).toBe(1)
  })

  it("ramps and caps at 4x", () => {
    expect(comboMultiplier(2)).toBeCloseTo(1.25)
    expect(comboMultiplier(5)).toBeCloseTo(2)
    expect(comboMultiplier(20)).toBe(4)
  })

  it("scores with rounding", () => {
    expect(scoreWithCombo(10, 2)).toBe(13)
  })
})
