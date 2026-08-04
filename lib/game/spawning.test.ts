import { describe, expect, it } from "vitest"
import { accumulateSpawns } from "./spawning"

describe("accumulateSpawns", () => {
  it("produces the same expected spawns across frame rates", () => {
    const atThirtyFps = Array.from({ length: 30 }).reduce<number>(
      (accumulator) => accumulateSpawns(accumulator, 0.03, 1 / 30).remainder,
      0,
    )
    const atSixtyFps = Array.from({ length: 60 }).reduce<number>(
      (accumulator) => accumulateSpawns(accumulator, 0.03, 1 / 60).remainder,
      0,
    )

    expect(atThirtyFps).toBeCloseTo(atSixtyFps)
  })

  it("returns every whole spawn accumulated during a long frame", () => {
    expect(accumulateSpawns(0.4, 0.03, 1)).toEqual({
      count: 2,
      remainder: expect.closeTo(0.2),
    })
  })
})
