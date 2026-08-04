import { describe, expect, it } from "vitest"
import { circlesOverlap2D, spheresOverlap } from "./collisions"

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

describe("circlesOverlap2D", () => {
  it("hits even when Z differs a lot", () => {
    expect(
      circlesOverlap2D({ x: 0, y: 0, z: 0 }, 0.4, { x: 0.2, y: 0.1, z: -3 }, 0.3),
    ).toBe(true)
  })

  it("misses when XY are far", () => {
    expect(
      circlesOverlap2D({ x: 0, y: 0, z: 0 }, 0.3, { x: 2, y: 0, z: 0 }, 0.3),
    ).toBe(false)
  })
})
