import { describe, expect, it } from "vitest"
import { spheresOverlap } from "./collisions"

describe("spheresOverlap", () => {
  it("detects overlap", () => {
    expect(
      spheresOverlap({ x: 0, y: 0, z: 0 }, 0.5, { x: 0.4, y: 0, z: 0 }, 0.5),
    ).toBe(true)
  })
  it("rejects separated spheres", () => {
    expect(
      spheresOverlap({ x: 0, y: 0, z: 0 }, 0.5, { x: 2, y: 0, z: 0 }, 0.5),
    ).toBe(false)
  })
})
